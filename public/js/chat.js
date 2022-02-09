$(document).ready(() => {
  $.get("/api/chats/" + chatId, data => $("#chatName").text(getChatName(data)))
})

$("#chatNameButton").click(e => {
  const chatName = $("#chatNameTextbox").val().trim()

  $.ajax({
    url: "/api/chats/" + chatId,
    type: "PUT",
    data: { chatName },
    success: (data, status, xhr) => {
      if (xhr.status != 200) {
        console.error("Could not update chat name")
        return
      }
      const updatedChatName = data.chatName
      $("#chatNameModal").modal('hide')
      $("span#chatName").text(updatedChatName)
    }
  })
})

$(".sendMessageButton").click(() => {
  messageSubmitted()
})

$(".inputTextbox").keydown(e => {
  if ((e.which === 13 || e.keyCode === 13) && !e.shiftKey) {
    messageSubmitted()
    return false
  }
})

function messageSubmitted() {
  const content = $(".inputTextbox").val().trim()
  if (content) {
    sendMessage(content)
    $(".inputTextbox").val("")
  }
}

function sendMessage(content) {
  $.post("/api/messages", { content, chatId }, (data, status, xhr) => {
    console.log(data)
  })
}