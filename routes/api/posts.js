const express = require('express')
const router = express.Router()
const User = require('../../schemas/User')
const Post = require('../../schemas/Post')

router.get("/", (req, res, next) => {
 
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

module.exports = router