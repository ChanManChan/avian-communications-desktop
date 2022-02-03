$("#postTextarea, #replyTextarea").keyup(e => {
  const textbox = $(e.target)
  const value = textbox.val().trim()
  const isModal = textbox.parents(".modal").length == 1
  const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton")

  if (submitButton.length != 0) {
    if (value == "") {
      submitButton.prop("disabled", true)
      return
    }
    submitButton.prop("disabled", false)
  }
})

$("#submitPostButton, #submitReplyButton").click(e => {
  const button = $(e.target)
  const isModal = button.parents(".modal").length == 1
  const textbox = isModal ? $("#replyTextarea") : $("#postTextarea")
  const data = {
    content: textbox.val().trim()
  }

  if (isModal) {
    const postId = button.data().id
    data.replyTo = postId
  }

  $.post("/api/posts", data, postData => {
    const html = createPostHtml(postData)
    $(".postsContainer").prepend(html)
    textbox.val("")
    button.prop("disabled", true)
    if (postData.replyTo) {
      $("#replyModal").modal('hide')
    }
  })
})

$("#replyModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)
  $("#submitReplyButton").data("id", postId)
  $.get("/api/posts/" + postId, result => {
    outputPosts([result.postData], $("#originalPostContainer"))
  })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

$("#deletePostModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)
  $("#deletePostButton").data("id", postId)
})

$("#deletePostButton").click(event => {
  const postId = $(event.target).data("id")
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: postData => {
      $(`div[data-id=${postData._id}]`).remove()
      $("#deletePostModal").modal('hide')
    }
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

$(document).on("click", ".repostButton", e => {
  const button = $(e.target)
  const postId = getPostIdFromElement(button)
  if (postId !== undefined) {
    $.ajax({
      url: `/api/posts/${postId}/repost`,
      type: "POST",
      success: postData => {
        button.find("span").text(postData.repostUsers.length || "")
        if (postData.repostUsers.includes(userLoggedIn._id)) {
          button.addClass("active")
        } else {
          button.removeClass("active")
        }
      }
    })
  }
})

$(document).on("click", ".post", e => {
  const element = $(e.target)
  const postId = getPostIdFromElement(element)
  if (postId !== undefined && !element.is("button")) {
    window.location.href = '/posts/' + postId
  }
})

$(document).on("click", ".followButton", e => {
  const button = $(e.target)
  const userId = button.data().id
  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (userData, status, xhr) => {
      if (xhr.status == 404) {
        console.error("User not found")
        return
      }

      let difference = 1
      if (userData.following && userData.following.includes(userId)) {
        button.addClass("following")
        button.text("Following")
      } else {
        button.removeClass("following")
        button.text("Follow")
        difference = -1
      }

      const followersLabel = $("#followersValue")
      if (followersLabel.length != 0) {
        const followersCount = Number(followersLabel.text())
        followersLabel.text(followersCount + difference)
      }
    }
  })
})

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post")
  const rootElement = isRoot ? element : element.closest(".post")
  const postId = rootElement.data().id
  if (postId === undefined) return console.error("PostId undefined")
  return postId
}

function createPostHtml(postData, largeFont = false) {
  const isRepost = 'repostData' in postData
  const repostedBy = isRepost ? postData.postedBy.username : null
  const repostData = isRepost ? postData.repostData : null
  const postedBy = isRepost ? repostData.postedBy : postData.postedBy

  if (postedBy._id === undefined) {
    return console.error("User object not populated")
  }

  const displayName = postedBy.firstName + ' ' + postedBy.lastName
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
  const repostButtonActiveClass = postData.repostUsers.includes(userLoggedIn._id) ? "active" : ""
  const largeFontClass = largeFont ? "largeFont" : ""
  let repostText = ''
  let replyFlag = ''
  let deleteButton = ''

  if (isRepost) {
    repostText = `
        <span>
          <i class='fas fa-retweet'></i>
          Reposted by <a href='/profile/${repostedBy}'>@${repostedBy}</a>
        </span>`
  }

  if (postData.replyTo && postData.replyTo._id) {

    if (!postData.replyTo.postedBy._id) {
      return console.error("postedBy is not populated")
    }

    const replyToUsername = postData.replyTo.postedBy.username
    replyFlag = `<div class='replyFlag'>
                  Replying to <a href='/profile/${replyToUsername}}'>@${replyToUsername}</a>
                 </div>`
  }

  if (postedBy._id == userLoggedIn._id) {
    deleteButton = `<button class='deletePostIcon' data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                      <i class='fas fa-times'></i>
                    </button>`
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
              ${repostText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${deleteButton}
                </div>
                ${replyFlag}
                <div class='postBody'>
                  <span>${isRepost ? repostData?.content ?? 'Original post was deleted' : postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button data-toggle="modal" data-target="#replyModal">
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='repostButton ${repostButtonActiveClass}'>
                      <i class='fas fa-retweet'></i>
                      <span>${postData.repostUsers.length || ""}</span>
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

function outputPostWithReplies(result, container) {
  container.html("")

  if (result.replyTo && result.replyTo._id !== undefined) {
    const html = createPostHtml(result.replyTo)
    container.append(html)
  }

  const mainPostHtml = createPostHtml(result.postData, true)
  container.append(mainPostHtml)

  result.replies.forEach(reply => {
    const html = createPostHtml(reply)
    container.append(html)
  })
}