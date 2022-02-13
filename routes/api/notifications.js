const express = require('express')
const router = express.Router()
const Notification = require('../../schemas/Notification')

router.get("/", async (req, res, next) => {
  const currentUserId = req.session.user._id
  const unreadOnly = req.query.unreadOnly
  const searchFilter = { userTo: currentUserId, notificationType: { $ne: "newMessage" } }

  if (unreadOnly && unreadOnly == "true") {
    searchFilter.opened = false
  }

  const notifications = await Notification.find(searchFilter)
                          .populate("userTo")
                          .populate("userFrom")
                          .sort({ createdAt: -1 })
                          .catch(() => res.sendStatus(500))
  res.status(200).send(notifications)
})

router.get("/latest", async (req, res, next) => {
  const currentUserId = req.session.user._id
  const notification = await Notification.findOne({ userTo: currentUserId })
                          .populate("userTo")
                          .populate("userFrom")
                          .sort({ createdAt: -1 })
                          .catch(() => res.sendStatus(500))
  res.status(200).send(notification)
})

router.put("/:id/opened", async (req, res, next) => {
  const notificationId = req.params.id
  await Notification.findByIdAndUpdate(notificationId, { opened: true }).catch(() => res.sendStatus(500))
  res.sendStatus(204)
})

router.put("/opened", async (req, res, next) => {
  await Notification.updateMany({ userTo: req.session.user._id }, { opened: true }).catch(() => res.sendStatus(500))
  res.sendStatus(204)
})

module.exports = router