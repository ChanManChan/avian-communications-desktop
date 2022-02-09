const express = require('express')
const router = express.Router()
const Message = require('../../schemas/Message')

router.post("/", async (req, res, next) => {
  const content = req.body.content
  const chatId = req.body.chatId
  const currentUserId = req.session.user._id

  if (!content || !chatId) {
    console.error("Invalid data passed into request")
    return res.sendStatus(400)
  }

  const newMessage = {
    sender: currentUserId,
    content,
    chat: chatId
  }

  const message = await Message.create(newMessage).catch(() => res.sendStatus(500))
  res.status(201).send(message)
})

module.exports = router