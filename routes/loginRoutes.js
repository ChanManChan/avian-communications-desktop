const express = require('express')
const app = express()
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../schemas/User')

app.set("view engine", "pug")
app.set("views", "views")

router.get("/", (req, res, next) => {
  res.status(200).render("login")
})

router.post("/", async (req, res, next) => {
  const payload = req.body
  const identifier = payload.logIdentifier
  const password = payload.logPassword
  if (identifier && password) {
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    }).catch(e => {
      console.error(e)
      payload.errorMessage = "Something went wrong"
      res.status(500).render("login", payload)
    })

    if (user != null) {
      const result = await bcrypt.compare(password, user.password)

      if (result) {
        req.session.user = user
        return res.redirect("/")
      }
    }

    payload.errorMessage = "Incorrect login credentials"
    return res.status(400).render("login", payload)
  }

  payload.errorMessage = "Enter your credentials to login"
  return res.status(400).render("login", payload)
})

module.exports = router