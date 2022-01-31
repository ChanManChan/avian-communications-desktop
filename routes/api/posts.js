const express = require('express')
const router = express.Router()
const User = require('../../schemas/User')
const Post = require('../../schemas/Post')

router.get("/", async (req, res, next) => {
 const posts = await getPosts({})
 res.status(200).send(posts)
})

router.get("/:id", async (req, res, next) => {
  const postId = req.params.id
  const post = await getPosts({ _id: postId })
  res.status(200).send(post)
 })

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.sendStatus(400)
  }

  const postData = {
    content: req.body.content,
    postedBy: req.session.user
  }

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo
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
  const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true }).catch(e => res.sendStatus(400))
  res.status(200).send(post)
})

router.post("/:id/repost", async (req, res, next) => {
  const postId = req.params.id
  const userId = req.session.user._id
  const deletedPost = await Post.findOneAndDelete({ postedBy: userId, repostData: postId }).catch(e => res.sendStatus(400))
  const option = deletedPost != null ? "$pull" : "$addToSet"
  
  let repost = deletedPost
  if (repost == null) {
    repost = await Post.create({ postedBy: userId, repostData: postId }).catch(e => res.sendStatus(400))
  }

  req.session.user = await User.findByIdAndUpdate(userId, { [option]: { reposts: repost._id } }, { new: true }).catch(e => res.sendStatus(400))
  const post = await Post.findByIdAndUpdate(postId, { [option]: { repostUsers: userId } }, { new: true }).catch(e => res.sendStatus(400))
  res.status(200).send(post)
})

async function getPosts(filter) {
  let results = await Post
          .find(filter)
          .populate("postedBy")
          .populate("repostData")
          .populate("replyTo")
          .sort({ "createdAt": -1 })
          .catch(e => console.error(e))
  results = await User.populate(results, { path: "replyTo.postedBy" })
  return await User.populate(results, { path: "repostData.postedBy" })
}

module.exports = router