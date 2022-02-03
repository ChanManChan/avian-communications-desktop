$(document).ready(() => {
  $.get("/api/posts", { followingOnly: true }, posts => {
    outputPosts(posts, $(".postsContainer"))
  })
})