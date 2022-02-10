$(document).ready(() => {
  $.get("/api/chats/" + chatId, data => $("#chatName").text(getChatName(data)))

  $.get(`/api/chats/${chatId}/messages`, data => {
    const messages = []
    let lastSenderId = ""

    data.forEach((message, index) => {
      const html = createMessageHtml(message, data[index + 1], lastSenderId)
      messages.push(html)
      lastSenderId = message.sender._id
    })
    
    const messagesHtml = messages.join("")
    addMessagesHtmlToPage(messagesHtml)
    scrollToBottom(false)
    $(".loadingSpinnerContainer").remove()
    $(".chatContainer").css("visibility", "visible")
  })
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
    if (xhr.status != 201) {
      console.error("Could not send message")
      $(".inputTextbox").val(content)
      return
    }
    addChatMessageHtml(data)
  })
}

function addChatMessageHtml(message) {
  if (!message || !message._id) {
   console.error("Message is not valid") 
   return
  }
  const messageListItem = createMessageHtml(message, null, "")
  addMessagesHtmlToPage(messageListItem)
  scrollToBottom(true)
}

function addMessagesHtmlToPage(html) {
  $(".chatMessages").append(html)
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  const currentSender = message.sender
  const currentSenderName = currentSender.firstName + " " + currentSender.lastName
  const currentSenderId = currentSender._id
  
  const nextSenderId = nextMessage ? nextMessage.sender._id : null
  const isFirst = lastSenderId != currentSenderId
  const isLast = nextSenderId != currentSenderId

  const isMine = currentSender._id == userLoggedIn._id
  const chatHistoryFeed = nextMessage || lastSenderId
  let liClassName = isMine ? "mine" : "theirs"
  let sentBy = ""

  if (isFirst && chatHistoryFeed) {
    liClassName += " first"
    if (!isMine) {
      sentBy = `<div class='sentBy'>
                  <div class='imageContainer'>
                    <img src='${currentSender.profilePic}' alt='Profile picture'>
                  </div>
                  <span class='senderName'>${currentSenderName}</span>
                </div>`
    }
  }

  if (isLast && chatHistoryFeed) {
    liClassName += " last"
  }

  if (!chatHistoryFeed) {
    liClassName += " live"
  }

  return `<li class='message ${liClassName}'>
            <div class='messageContainer'>
              ${sentBy}
              <span class='messageBody'>
                ${message.content}
              </span>
            </div>
          </li>`
}

function scrollToBottom(animated) {
  const container = $(".chatMessages")
  const scrollHeight = container[0].scrollHeight

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, "slow")
  } else {
    container.scrollTop(scrollHeight)
  }
}