$("#postTextarea").keyup(e => {
  const textbox = e.target
  const value = textbox.value.trim()
  const submitButton = $("#submitPostButton")

  if (submitButton.length != 0) {
    if (value == "") {
      submitButton.prop("disabled", true)
      return
    }
    submitButton.prop("disabled", false)
  }
})

$("#submitPostButton").click(e => {
  const button = e.target
  const textbox = $("#postTextarea")
  const data = {
    content: textbox.val().trim()
  }

  $.post("/api/posts", data, postData => {
    const html = createPostHtml(postData)
    $(".postsContainer").prepend(html)
    textbox.val("")
    button.disabled = true
  })
})

$(document).on("click", ".likeButton", e => {
  const button = $(e.target)
  const postId = getPostIdFromElement(button)
  if (postId !== undefined) {
    $.ajax({
      url: `/api/posts/${postId}/like`,
      type: "PUT",
      success: postData => {
        button.find("span").text(postData.likes.length || "")
        if (postData.likes.includes(userLoggedIn._id)) {
          button.addClass("active")
        } else {
          button.removeClass("active")
        }
      }
    })
  }
})

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post")
  const rootElement = isRoot ? element : element.closest(".post")
  const postId = rootElement.data().id
  if (postId === undefined) return console.error("PostId undefined")
  return postId
}

function createPostHtml(postData) {
  const postedBy = postData.postedBy

  if (postedBy._id === undefined) {
    return console.error("User object not populated")
  }

  const displayName = postedBy.firstName + ' ' + postedBy.lastName
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""

  return `<div class='post' data-id='${postData._id}'>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                </div>
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button>
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='repost'>
                      <i class='fas fa-retweet'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer red'>
                    <button class='likeButton ${likeButtonActiveClass}'>
                      <i class='far fa-heart'></i>
                      <span>${postData.likes.length || ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`
}

function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current - previous

  if (elapsed < msPerMinute) {
    const seconds = Math.round(elapsed/1000)
    if (seconds < 30) return 'Just now'
    return seconds + ' seconds ago'
  } else if (elapsed < msPerHour) {
      return Math.round(elapsed/msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' days ago'
  } else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' months ago'
  } else {
      return Math.round(elapsed/msPerYear) + ' years ago'
  }
}