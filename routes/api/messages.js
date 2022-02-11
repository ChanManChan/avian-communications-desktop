const express = require('express')
const router = express.Router()
const Message = require('../../schemas/Message')
const Chat = require('../../schemas/Chat')
const User = require('../../schemas/User')

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

  let message = await Message.create(newMessage).catch(() => res.sendStatus(500))
  message = await message.populate("sender")
  message = await message.populate("chat")
  message = await User.populate(message, { path: "chat.users" })
  
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message }).catch(e => console.error(e))
  res.status(201).send(message)
})

module.exports = router