$(document).ready(() => {
  $.get("/api/chats", (chatList, status, xhr) => {
    if (xhr.status === 400) {
      console.error("Could not get chat list")
      return
    }
    outputChatList(chatList, $(".resultsContainer"))
  })
})

function outputChatList(chatList, container) {
  chatList.forEach(chat => {
    const html = createChatHtml(chat)
    container.append(html)
  })

  if (chatList.length == 0) {
    container.append("<span class='noResults'>No Results</span>")
  }
}

function createChatHtml(chat) {
  const chatName = getChatName(chat)
  const chatImage = getChatImageElements(chat)
  const latestMessage = "This is the latest message"

  return `<a href="/messages/${chat._id}" class='resultListItem'>
            ${chatImage}
            <div class='resultsDetailsContainer ellipsis'>
              <span class='heading ellipsis'>${chatName}</span>
              <span class='subText ellipsis'>${latestMessage}</span>
            </div>
          </a>`
}

function getChatName(chatData) {
  let chatName = chatData.chatName

  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chatData.users)
    const usernames = otherChatUsers.map(user => user.firstName + " " + user.lastName)
    chatName = usernames.join(", ")
  }
  return chatName
}

function getOtherChatUsers(users) {
  if (users.length == 1) {
    return users
  }

  return users.filter(user => user._id != userLoggedIn._id)
}

function getChatImageElements(chatData) {
  const otherChatUsers = getOtherChatUsers(chatData.users)
  let groupChatClass = ""
  let chatImage = getUserChatImageElement(otherChatUsers[0])

  if (otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage"
    chatImage += getUserChatImageElement(otherChatUsers[1])
  }

  return `<div class="resultsImageContainer ${groupChatClass}">
            ${chatImage}
          </div>`
}

function getUserChatImageElement(user) {
  if (!user) {
    return console.error("User data is required to create chat image element")
  }
  return `<img src='${user.profilePic}' alt='User's profile pic' >`
}