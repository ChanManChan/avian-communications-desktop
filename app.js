const express = require('express')
const app = express()
const port = 3000
const middleware = require('./middleware')
const path = require("path")
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv').config()
require('./database')

app.listen(port, () => console.log(`Server listening on port ${port}`))
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
const postsRoute = require('./routes/api/posts')

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/api/posts", postsRoute)

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user
  }
  res.status(200).render("home", payload)
})