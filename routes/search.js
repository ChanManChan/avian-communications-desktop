const express = require('express')
const router = express.Router()

router.get("/", (req, res, next) => {
  const payload = createPayload(req)
  res.status(200).render("search", payload)
})

router.get("/:selectedTab", (req, res, next) => {
  const payload = createPayload(req)
  payload.selectedTab = req.params.selectedTab
  res.status(200).render("search", payload)
})

function createPayload(req) {
  const user = req.session.user
  return {
    pageTitle: "Search",
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user)
  }
}

module.exports = router