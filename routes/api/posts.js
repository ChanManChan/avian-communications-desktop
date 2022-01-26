const express = require('express')
const router = express.Router()
const User = require('../../schemas/User')
const Post = require('../../schemas/Post')

router.get("/", async (req, res, next) => {
 const posts = await Post
          .find()
          .populate("postedBy")
          .sort({ "createdAt": -1 })
          .catch(e => res.sendStatus(400))
 res.status(200).send(posts)
})

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.sendStatus(400)
  }

  const postData = {
    content: req.body.content,
    postedBy: req.session.user
  }

  let createdPost = await Post.create(postData).catch(e => res.sendStatus(400))
  createdPost = await User.populate(createdPost, { path: "postedBy" })
  res.status(201).send(createdPost)
})

router.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id
  const userId = req.session.user._id
  const isLiked = req.session.user.likes?.includes(postId) ?? false
  const option = isLiked ? "$pull" : "$addToSet"

  req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true }).catch(e => res.sendStatus(400))
  res.status(200).send("ford")
})

module.exports = router