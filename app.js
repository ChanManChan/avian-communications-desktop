const express = require('express')
const app = express()
const port = 3000
const middleware = require('./middleware')
const path = require("path")
require('./database')

app.listen(port, () => console.log(`Server listening on port ${port}`))

app.set("view engine", "pug")
app.set("views", "views")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended:false }))

// Routes
const loginRoute = require('./routes/loginRoutes')
const registerRoute = require('./routes/registerRoutes')
app.use("/login", loginRoute)
app.use("/register", registerRoute)

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home"
  }
  res.status(200).render("home", payload)
})