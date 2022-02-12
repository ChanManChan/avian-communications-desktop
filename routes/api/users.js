const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: "uploads/" })
const User = require('../../schemas/User')
const Notification = require('../../schemas/Notification')

router.get("/", async (req, res, next) => {
  let searchFilter = req.query

  if (searchFilter.search) {
    searchFilter = {
      $or: [
        { firstName: { $regex: searchFilter.search, $options: "i" }},
        { lastName: { $regex: searchFilter.search, $options: "i" }},
        { username: { $regex: searchFilter.search, $options: "i" }}
      ]
    }
  }

  const results = await User.find(searchFilter).catch(() => res.sendStatus(500))
  res.status(200).send(results)
})

router.put("/:userId/follow", async (req, res, next) => {
  const currentUserId = req.session.user._id
  const userId = req.params.userId
  const user = await User.findById(userId)
  if (user == null) {
    return res.sendStatus(404)
  }

  const isFollowing = user.followers && user.followers.includes(currentUserId)
  const option = isFollowing ? "$pull" : "$addToSet"
  req.session.user = await User.findByIdAndUpdate(currentUserId, { [option]: { following: userId } }, { new: true })
                      .catch(e => res.sendStatus(500))
  await User.findByIdAndUpdate(userId, { [option]: { followers: currentUserId } }).catch(e => res.sendStatus(500))

  if (!isFollowing) {
    await Notification.insertNotification(userId, currentUserId, "follow", currentUserId)
  }

  res.status(200).send(req.session.user)
})

router.get("/:userId/following", async (req, res, next) => {
  const userId = req.params.userId
  const results = await User.findById(userId).populate("following").catch(e => res.sendStatus(500))
  res.status(200).send(results)
})

router.get("/:userId/followers", async (req, res, next) => {
  const userId = req.params.userId
  const results = await User.findById(userId).populate("followers").catch(e => res.sendStatus(500))
  res.status(200).send(results)
})

router.post("/profile-picture", upload.single("croppedImage"), async (req, res, next) => {
  const currentUser = req.session.user
  if (!req.file) {
    console.error("No file uploaded with ajax request")
    return res.sendStatus(400)
  }
  const filePath = `/uploads/profile-pictures/${req.file.filename}.png`
  const tempPath = req.file.path
  const targetPath = path.join(__dirname, `../../${filePath}`)
  fs.rename(tempPath, targetPath, async error => {
    if (error != null) {
      console.error(error)
      return res.sendStatus(500)
    }
    req.session.user = await User.findByIdAndUpdate(currentUser._id, { profilePic: filePath }, { new: true })
    res.status(200).send(req.session.user)
  })
})

router.post("/cover-picture", upload.single("croppedImage"), async (req, res, next) => {
  const currentUser = req.session.user
  if (!req.file) {
    console.error("No file uploaded with ajax request")
    return res.sendStatus(400)
  }
  const filePath = `/uploads/cover-pictures/${req.file.filename}.png`
  const tempPath = req.file.path
  const targetPath = path.join(__dirname, `../../${filePath}`)
  fs.rename(tempPath, targetPath, async error => {
    if (error != null) {
      console.error(error)
      return res.sendStatus(500)
    }
    req.session.user = await User.findByIdAndUpdate(currentUser._id, { coverPhoto: filePath }, { new: true })
    res.status(200).send(req.session.user)
  })
})

module.exports = router