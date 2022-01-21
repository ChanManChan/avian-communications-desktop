const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/User')

app.set("view engine", "pug")
app.set("views", "views")

router.get("/", (req, res, next) => {
  res.status(200).render("register")
})

router.post("/", (req, res, next) => {
  const body = req.body
  const firstName = body.firstName.trim()
  const lastName = body.lastName.trim()
  const userName = body.username.trim()
  const email = body.email.trim()
  const password = body.password
  const payload = req.body

  if (firstName && lastName && userName && email && password) {
    User.findOne({})
  } else {
    payload.errorMessage = "Make sure each field has a valid value."
    res.status(200).render("register", payload)
  }
})

module.exports = router