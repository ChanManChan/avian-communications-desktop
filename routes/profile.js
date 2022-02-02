const express = require('express')
const User = require('../schemas/User')
const router = express.Router()

router.get("/", (req, res, next) => {
  const user = req.session.user
  const payload = {
    pageTitle: user.username,
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user),
    profileUser: user
  }
  res.status(200).render("profile", payload)
})

router.get("/:username", async (req, res, next) => {
  const userLoggedIn = req.session.user
  const username = req.params.username
  const payload = await getPayload(username, userLoggedIn)
  res.status(200).render("profile", payload)
})

router.get("/:username/replies", async (req, res, next) => {
  const userLoggedIn = req.session.user
  const username = req.params.username
  const payload = await getPayload(username, userLoggedIn)
  payload.selectedTab = "replies"
  res.status(200).render("profile", payload)
})

async function getPayload(identifier, userLoggedIn) {
  let user = await User.findOne({ username: identifier })
  if (user == null) {
    user = await User.findById(identifier)
    if (user == null) {
      return {
        pageTitle: "User not found",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)
      }  
    }
  }
  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user
  }
}

module.exports = router