const express = require('express')
const router = express.Router()
const User = require('../../schemas/User')
const Post = require('../../schemas/Post')
const Notification = require('../../schemas/Notification')

router.get("/", async (req, res, next) => {
  const searchFilter = req.query

  if (searchFilter.isReply) {
    const isReply = searchFilter.isReply == "true"
    searchFilter.replyTo = { $exists: isReply }
    delete searchFilter.isReply
  }

  if (searchFilter.followingOnly) {
    const currentUser = req.session.user
    const followingOnly = searchFilter.followingOnly == "true"

    if (followingOnly) {
      const userIds = [...currentUser.following ?? []]
      userIds.push(currentUser._id)
      searchFilter.postedBy = { $in: userIds }
    }
    delete searchFilter.followingOnly
  }

  if (searchFilter.search) {
    searchFilter.content = { $regex: searchFilter.search, $options: "i" }
    delete searchFilter.search
  }

  const posts = await getPosts(searchFilter)
  res.status(200).send(posts)
})

router.get("/:id", async (req, res, next) => {
  const postId = req.params.id
  let postData = await getPosts({ _id: postId })
  postData = postData[0]

  const result = {
    postData
  }

  if (postData.replyTo !== undefined) {
    result.replyTo = await Post.populate(postData.replyTo, { path: "repostData", populate: { path: "postedBy" } })
  }

  result.replies = await getPosts({ replyTo: postId })
  res.status(200).send(result)
})

router.delete("/:id", async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id).catch(() => res.sendStatus(500))
  res.status(202).send(post)
})

router.put("/:id", async (req, res, next) => {
  const previousPinnedId = req.body.previousPinned
  const currentPinnedId = req.params.id
  let post

  if (previousPinnedId) {
    post = await Post.findByIdAndUpdate(previousPinnedId, { pinned: false }, { new: true }).catch(() => res.sendStatus(500))
    delete req.body.previousPinned
  }

  if (previousPinnedId == currentPinnedId) {
    return res.status(200).send(post)
  }

  post = await Post.findByIdAndUpdate(currentPinnedId, req.body, { new: true }).populate("postedBy").catch(() => res.sendStatus(500))
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

  if (createdPost.replyTo) {
    createdPost = await Post.populate(createdPost, { path: "replyTo" })
    createdPost = await User.populate(createdPost, { path: "replyTo.postedBy" })
    await Notification.insertNotification(createdPost.replyTo.postedBy._id, req.session.user._id, "reply", createdPost._id)
  }

  res.status(201).send(createdPost)
})

router.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id
  const userId = req.session.user._id
  const isLiked = req.session.user.likes?.includes(postId) ?? false
  const option = isLiked ? "$pull" : "$addToSet"

  req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true }).catch(e => res.sendStatus(400))
  const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true }).catch(e => res.sendStatus(400))

  if (!isLiked) {
    await Notification.insertNotification(post.postedBy, userId, "postLike", post._id)
  }

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
  const originalPost = await Post.findByIdAndUpdate(postId, { [option]: { repostUsers: userId } }, { new: true }).catch(e => res.sendStatus(400))
  repost = await Post.populate(repost, { path: "repostData" })
  repost = await User.populate(repost, { path: "postedBy" })
  repost = await User.populate(repost, { path: "repostData.postedBy" })

  if (!deletedPost) {
    await Notification.insertNotification(originalPost.postedBy, userId, "repost", originalPost._id)
  }

  res.status(200).send(repost)
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