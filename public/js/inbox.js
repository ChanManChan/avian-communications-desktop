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