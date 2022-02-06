$("#searchBox").keydown(e => {
  clearTimeout(timer)
  const textbox = $(e.target)

  timer = setTimeout(() => {
    const value = textbox.val().trim()
    const searchType = textbox.data().search

    if (value == "") {
      $(".resultsContainer").html("")
    } else {
      search(value, searchType) 
    }

  }, 1000)
})

function search(searchTerm, searchType) {
  const url = searchType == "users" ? "/api/users" : "/api/posts"
  $.get(url, { search: searchTerm }, results => {
    if (searchType == "users") {
      outputUsers(results, $(".resultsContainer"))
    } else {
      outputPosts(results, $(".resultsContainer"))
    }
  })
}