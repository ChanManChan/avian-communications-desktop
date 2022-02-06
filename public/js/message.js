const selectedUsers = []

$("#userSearchTextbox").keydown(e => {
  clearTimeout(timer)
  const textbox = $(e.target)
  
  if (textbox.val() == "" && e.keycode == 8) {
    // remove user from selection
    return
  }

  timer = setTimeout(() => {
    const value = textbox.val().trim()
    if (value == "") {
      $(".resultsContainer").html("")
    } else {
      searchUsers(value)
    }
  }, 1000)
})

function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, results => {
    outputSelectableUsers(results, $(".resultsContainer"))
  })
}

function outputSelectableUsers(users, container) {
  container.html("")

  users.forEach(user => {
    if (user._id == userLoggedIn._id || selectedUsers.some(selectedUser => selectedUser._id == user._id)) {
      return
    }
    const html = createUserHtml(user)
    const element = $(html)
    element.addClass("clickable")
    element.click(() => userSelected(user))
    container.append(element)
  })
}

function userSelected(user) {
  selectedUsers.push(user)
  $("#userSearchTextbox").val("").focus()
  $(".resultsContainer").html("")
  $("#createChatButton").prop("disabled", false)
}