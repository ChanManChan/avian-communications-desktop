const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Chat = require('../schemas/Chat')
const User = require('../schemas/User')

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

router.get("/:chatId", async (req, res, next) => {
  const user = req.session.user
  const userId = user._id
  const chatId = req.params.chatId
  const isValidId = mongoose.isValidObjectId(chatId)

  const payload = {
    pageTitle: "Chat",
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user),
  }

  if (!isValidId) {
    payload.errorMessage = "Not a valid chatId"
    return res.status(400).render("chat", payload)
  }
  
  let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId }} }).populate("users")

  if (!chat) {
    const userFound = await User.findById(chatId)
    if (userFound) {
      chat = await getChatByUserId(userId, userFound._id)
    }
  }

  if (!chat) {
    payload.errorMessage = "Chat does not exist or you do not have permission to view it."
  } else {
    payload.chat = chat
  }

  res.status(200).render("chat", payload)
})

function getChatByUserId(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate({
    isGroupChat: false,
    users: {
      $size: 2,
      $all: [
        { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
        { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }},
      ]
    }
  }, {
    $setOnInsert: {
      users: [userLoggedInId, otherUserId]
    }
  }, {
    new: true,
    upsert: true
  })
  .populate("users")
}

module.exports = router