const selectedUsers = []

$("#userSearchTextbox").keydown(e => {
  clearTimeout(timer)
  const textbox = $(e.target)
  
  if (textbox.val() == "" && (e.which == 8 || e.keyCode == 8)) {
    selectedUsers.pop()
    updateSelectedUsersHtml()
    $(".resultsContainer").html("")

    if (selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true)
    }

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

$("#createChatButton").click(() => {
  const data = JSON.stringify(selectedUsers)
  $.post("/api/chats", { users: data }, chat => {
    window.location.href = `/messages/${chat._id}`
  })
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
  updateSelectedUsersHtml()
  $("#userSearchTextbox").val("").focus()
  $(".resultsContainer").html("")
  $("#createChatButton").prop("disabled", false)
}

function updateSelectedUsersHtml() {
  const elements = []
  selectedUsers.forEach(user => {
    const fullName = user.firstName + " " + user.lastName
    const userElement = $(`<span class='selectedUser'>${fullName}</span>`)
    elements.push(userElement)
  })

  $(".selectedUser").remove()
  $("#selectedUsers").prepend(elements)
}