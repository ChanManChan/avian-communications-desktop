const express = require('express')
const router = express.Router()
const Notification = require('../../schemas/Notification')

router.get("/", async (req, res, next) => {
  const currentUserId = req.session.user._id
  const notifications = await Notification.find({ userTo: currentUserId, notificationType: { $ne: "newMessage" } })
                          .populate("userTo")
                          .populate("userFrom")
                          .sort({ createdAt: -1 })
                          .catch(() => res.sendStatus(500))
  res.status(200).send(notifications)
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