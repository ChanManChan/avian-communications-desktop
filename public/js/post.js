$(document).ready(() => {
  $.get("/api/posts/" + postId, result => {
    outputPostWithReplies(result, $(".postsContainer"))
  })
})