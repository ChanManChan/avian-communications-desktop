const express = require('express')
const router = express.Router()
const Chat = require('../../schemas/Chat')

router.post("/", async (req, res, next) => {
  if (!req.body.users) {
    console.error("Users list not sent with request")
    return res.sendStatus(400)
  }
  
  const users = JSON.parse(req.body.users)
  
  if (users.length == 0) {
    console.error("Users array is empty")
    return res.sendStatus(400)
  }

  users.push(req.session.user)
  const chatData = {
    users,
    isGroupChat: true
  }

  const chat = await Chat.create(chatData).catch(() => res.sendStatus(500))
  res.status(200).send(chat)
})

router.get("/", async (req, res, next) => {
  const chatList = await Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } }})
                .populate("users")
                .sort({ updatedAt: -1 })
                .catch(() => res.sendStatus(500))
  res.status(200).send(chatList)
})

router.put("/:chatId", async (req, res, next) => {
  const chatId = req.params.chatId
  const chat = await Chat.findByIdAndUpdate(chatId, req.body, { new: true }).catch(() => res.sendStatus(500))
  res.status(200).send(chat)
})

router.get("/:chatId", async (req, res, next) => {
  const chatId = req.params.chatId
  const currentUserId = req.session.user._id
  const chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: currentUserId }} }).populate("users").catch(() => res.sendStatus(500))
  res.status(200).send(chat)
})

module.exports = router