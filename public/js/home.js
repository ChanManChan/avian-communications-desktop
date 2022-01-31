$(document).ready(() => {
  $.get("/api/posts", posts => {
    outputPosts(posts, $(".postsContainer"))
  })
})