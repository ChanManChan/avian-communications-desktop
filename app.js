const express = require('express')
const app = express()
const middleware = require('./middleware')
const path = require("path")
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv').config()
require('./database')

const port = process.env.SERVER_PORT
const server = app.listen(port, () => console.log(`Server listening on port ${port}`))
const io = require('socket.io')(server, { pingTimeout: 60000 })
const sessionStore = MongoStore.create({ mongoUrl: process.env.DB_URI, collectionName: 'sessions' })

app.set("view engine", "pug")
app.set("views", "views")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended:false }))
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
 }))

// Routes
const loginRoute = require('./routes/auth/login')
const registerRoute = require('./routes/auth/register')
const logoutRoute = require('./routes/auth/logout')
const postRoute = require('./routes/post')
const profileRoute = require('./routes/profile')
const searchRoute = require('./routes/search')
const messagesRoute = require('./routes/messages')

const postsApiRoute = require('./routes/api/posts')
const usersApiRoute = require('./routes/api/users')
const chatsApiRoute = require('./routes/api/chats')
const messagesApiRoute = require('./routes/api/messages')

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/posts", postRoute)
app.use("/profile", profileRoute)
app.use("/search", searchRoute)
app.use("/messages", messagesRoute)

app.use("/api/posts", postsApiRoute)
app.use("/api/users", usersApiRoute)
app.use("/api/chats", chatsApiRoute)
app.use("/api/messages", messagesApiRoute)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  }
  res.status(200).render("home", payload)
})

io.on('connection', socket => {
  socket.on("setup", userData => {
    socket.join(userData._id)
    socket.emit("connected")
  })

  socket.on("join room", room => socket.join(room))
  socket.on("typing", room => socket.in(room).emit("typing"))
  socket.on("stop typing", room => socket.in(room).emit("stop typing"))

  socket.on("new message", message => {
    const chat = message.chat
    if (!chat.users) return console.error("chat.users not defined");

    chat.users.forEach(user => {
      if (user._id == message.sender._id) return
      socket.in(user._id).emit("message received", message)
    })
  })
})