const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../schemas/User')

router.get("/", (req, res, next) => {
  res.status(200).render("register")
})

router.post("/", async (req, res, next) => {
  const payload = req.body
  const firstName = payload.firstName.trim()
  const lastName = payload.lastName.trim()
  const username = payload.username.trim()
  const email = payload.email.trim()
  const password = payload.password

  if (firstName && lastName && username && email && password) {
    const user = await User.findOne({
      $or: [ 
        { username },
        { email }
      ]
    }).catch(e => {
      console.error(e)
      payload.errorMessage = "Something went wrong"
      res.status(500).render("register", payload)
    })

    if (user == null) {
      payload.password = await bcrypt.hash(password, 10)
      const createdUser = await User.create(payload)
      req.session.user = createdUser
      res.redirect("/")
    } else {
      if (email == user.email) {
        payload.errorMessage = "Email already in use."
      } else {
        payload.errorMessage = "Username already in use."
      }
  
      res.status(400).render("register", payload)
    }

  } else {
    payload.errorMessage = "Make sure each field has a valid value."
    res.status(400).render("register", payload)
  }
})

module.exports = router