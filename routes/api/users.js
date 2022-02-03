const express = require('express')
const router = express.Router()
const User = require('../../schemas/User')

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

module.exports = router