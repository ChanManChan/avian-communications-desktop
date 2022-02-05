$(document).ready(() => {
  if (selectedTab === "replies") {
    loadReplies()
  } else {
    loadPosts()
  }
})

function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, pinned: true }, result => {
    outputPinnedPost(result, $(".pinnedPostContainer"))
  })

  $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}

function loadReplies() {
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
    outputPosts(results, $(".postsContainer"))
  })
}

function outputPinnedPost(result, container) {
  if (result.length == 0) {
    container.hide()
    return
  }

  container.html("")
  const html = createPostHtml(result[0])
  container.append(html)
}
