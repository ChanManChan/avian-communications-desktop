const express = require('express')
const router = express.Router()

router.get("/", (req, res, next) => {
  const user = req.session.user
  res.status(200).render("notifications", {
    pageTitle: "Notifications",
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user)
  })
})

module.exports = router