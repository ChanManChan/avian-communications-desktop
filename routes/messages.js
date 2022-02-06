const express = require('express')
const router = express.Router()

router.get("/", (req, res, next) => {
  const user = req.session.user
  res.status(200).render("inbox", {
    pageTitle: "Inbox",
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user)
  })
})

router.get("/new", (req, res, next) => {
  const user = req.session.user
  res.status(200).render("message", {
    pageTitle: "New message",
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user)
  })
})

module.exports = router