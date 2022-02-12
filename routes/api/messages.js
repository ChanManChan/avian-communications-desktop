const express = require('express')
const router = express.Router()
const Message = require('../../schemas/Message')
const Chat = require('../../schemas/Chat')
const User = require('../../schemas/User')
const Notification = require('../../schemas/Notification')

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
  
  const chat = await Chat.findByIdAndUpdate(chatId, { latestMessage: message }).catch(e => console.error(e))
  insertNotifications(chat, message)
  res.status(201).send(message)
})

function insertNotifications(chat, message) {
  chat.users.forEach(userId => {
    const userFrom = message.sender._id
    if (userId == userFrom.toString()) return
    Notification.insertNotification(userId, userFrom, "newMessage", chat._id)
  })
}

module.exports = router