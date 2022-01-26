$(document).ready(() => {
  $.get("/api/posts", posts => {
    outputPosts(posts, $(".postsContainer"))
  })
})

function outputPosts(results, container) {
  container.html("")

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show</span>") 
    return
  }

  results.forEach(result => {
    const html = createPostHtml(result)
    container.append(html)
  })
}