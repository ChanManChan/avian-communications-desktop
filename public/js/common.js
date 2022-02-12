let cropper
let pinnedPostId
let timer
const pinnedPostIndicator = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>"

$(document).ready(() => {
  refreshMessagesBadge()
  refreshNotificationsBadge()
})

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

$("#confirmPinModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)
  $("#pinPostButton").data("id", postId)
})

$("#unpinModal").on("show.bs.modal", event => {
  const button = $(event.relatedTarget)
  const postId = getPostIdFromElement(button)
  $("#unpinPostButton").data("id", postId)
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

$("#pinPostButton").click(event => {
  const postId = $(event.target).data("id")
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: JSON.stringify({ previousPinned: pinnedPostId, pinned: true }),
    processData: false,
    contentType: 'application/json',
    success: (postData, status, xhr) => {
      if (xhr.status != 200) {
        console.error("could not pin post")
        return
      }

      if (pinnedPostId) {
        removePinnedPost(pinnedPostId)
      }

      pinnedPostId = postData.pinned ? postData._id : ""
      $("#confirmPinModal").modal('hide')
      const thumbtackButton = $(`button.confirmPinIcon[data-id="${postId}"]`)
      thumbtackButton.addClass('active')
      thumbtackButton.attr("data-target", "#unpinModal")
      $(`div.post[data-id="${postId}"] div.pinnedPostText`).html(pinnedPostIndicator)
      if (window.location.pathname.includes("profile")) {
        $(".pinnedPostContainer").show()
        outputPinnedPost(postData, $(".pinnedPostContainer"))
      }
    }
  })
})

$("#unpinPostButton").click(event => {
  const postId = $(event.target).data("id")
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: JSON.stringify({ previousPinned: pinnedPostId, pinned: false }),
    processData: false,
    contentType: 'application/json',
    success: (postData, status, xhr) => {
      if (xhr.status != 200) {
        console.error("could not unpin post")
        return
      }
      pinnedPostId = postData.pinned ? postData._id : ""
      $("#unpinModal").modal('hide')
      removePinnedPost(postId)
      if (window.location.pathname.includes("profile")) {
        $(".pinnedPostContainer div.post").remove()
        $(".pinnedPostContainer").hide()
      }
    }
  })
})

function removePinnedPost(postId) {
  const thumbtackButton = $(`button.confirmPinIcon[data-id="${postId}"]`)
  thumbtackButton.removeClass('active')
  thumbtackButton.attr("data-target", "#confirmPinModal")
  $(`div.post[data-id="${postId}"] div.pinnedPostText`).html("")
}

$("#filePhoto").change(function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader()
    reader.onload = e => {
      const image = document.getElementById("imagePreview")
      image.src = e.target.result
      if (cropper !== undefined) {
        cropper.destroy()
      }

      cropper = new Cropper(image, { 
        aspectRatio: 1 / 1,
        background: false
      })
    }
    reader.readAsDataURL(this.files[0])
  }
})

$("#imageUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas()
  if (!canvas) {
    console.error("Could not upload image. Make sure it is an image file")
    return
  }
  canvas.toBlob(blob => {
    const formData = new FormData()
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/profile-picture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (postData, status, xhr) => {
        if (xhr.status == 200) {
          applyProfilePicture(postData)
        }
      }
    })
  })
})

$("#coverPhotoInput").change(function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader()
    reader.onload = e => {
      const image = document.getElementById("coverPreview")
      image.src = e.target.result
      if (cropper !== undefined) {
        cropper.destroy()
      }

      cropper = new Cropper(image, { 
        aspectRatio: 16 / 9,
        background: false
      })
    }
    reader.readAsDataURL(this.files[0])
  }
})

$("#coverPhotoUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas()
  if (!canvas) {
    console.error("Could not upload image. Make sure it is an image file")
    return
  }
  canvas.toBlob(blob => {
    const formData = new FormData()
    formData.append("croppedImage", blob)

    $.ajax({
      url: "/api/users/cover-picture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: (postData, status, xhr) => {
        if (xhr.status == 200) {
          applyCoverPhoto(postData)  
        }
      }
    })
  })
})

function applyCoverPhoto(postData) {
  $('div.coverPhotoContainer img#coverPhoto').remove()
  const coverPhotoUrl = postData.coverPhoto
  const coverPhoto = `<img id='coverPhoto' src='${coverPhotoUrl}' alt='cover-photo'>`
  $("div.coverPhotoContainer").prepend(coverPhoto)
  $("input#coverPhotoInput").val('')
  $("#coverPhotoUploadModal").modal('hide')
  $("img#coverPreview").removeAttr("src class")
  cropper.destroy()
}

function applyProfilePicture(postData) {
  $('div.userImageContainer img#profilePicture').remove()
  $('div.userImageContainer img#userProfilePicture').remove()
  const profilePictureUrl = postData.profilePic
  const mainProfilePicture = `<img id='profilePicture' src='${profilePictureUrl}' alt='User profile image'>`
  const postProfilePicture = `<img id='userProfilePicture' src='${profilePictureUrl}' alt='User profile image'>`
  $("div.profileHeaderContainer div.userImageContainer").prepend(mainProfilePicture)
  $("div.post div.userImageContainer").prepend(postProfilePicture)
  $("input#filePhoto").val('')
  $("#imageUploadModal").modal('hide')
  $("img#imagePreview").removeAttr("src class")
  cropper.destroy()
}

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
        const originalPostId = postData.repostData._id
        if (postData.repostData.repostUsers.includes(userLoggedIn._id)) {
          button.addClass("active")
          const html = createPostHtml(postData)
          $("div.postsContainer").prepend(html)
          $(`div.post[data-id="${originalPostId}"] button.repostButton.active span#repostCount`).text(postData.repostData.repostUsers.length || "")
        } else {
          const repostId = postData._id
          button.removeClass("active")
          $(`div.post[data-id="${repostId}"]`).remove()
          $(`div.post[data-id="${originalPostId}"] button.repostButton span#repostCount`).text(postData.repostData.repostUsers.length || "")
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

  if (!pinnedPostId) {
    pinnedPostId = postData.pinned ? postData._id: ""  
  }

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
  let buttons = ''
  let pinnedPostText = ''

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
                  Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                 </div>`
  }

  if (postData.pinned) {
    pinnedPostText = pinnedPostIndicator
  }

  if (postedBy._id == userLoggedIn._id) {
    let pinnedClass = ''
    let dataTarget = '#confirmPinModal'

    if (postData.pinned) {
      pinnedClass = 'active'
      dataTarget = '#unpinModal'
    }
    
    buttons = `<button class='confirmPinIcon ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}">
                <i class="fas fa-thumbtack"></i>
               </button>
               <button class='deletePostIcon' data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                <i class='fas fa-times'></i>
               </button>`
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
              ${repostText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img id='userProfilePicture' src='${postedBy.profilePic}' alt='User profile image'>
              </div>
              <div class='postContentContainer'>
                <div class='pinnedPostText'>
                  ${pinnedPostText}
                </div>
                <div class='header'>
                  <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${buttons}
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
                      <span id='repostCount'>${postData.repostUsers.length || ""}</span>
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

function outputPinnedPost(result, container) {
  if (result.length == 0) {
    container.hide()
    return
  }

  container.html("")
  const html = createPostHtml(Array.isArray(result) ? result[0] : result)
  container.append(html)
}

function outputUsers(users, container) {
  container.html("")
  users.forEach(user => {
    const html = createUserHtml(user, true)
    container.append(html)
  })

  if (users.length == 0) {
    container.append("<span class='noResults'>No results found</span>")
  }
}

function createUserHtml(userData, showFollowButton) {
  const name = userData.firstName + ' ' + userData.lastName
  const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
  const text = isFollowing ? "Following" : "Follow"
  const buttonClass = isFollowing ? "followButton following" : "followButton"
  let followButton = ''

  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                      <button class='${buttonClass}' data-id='${userData._id}'>
                        ${text}
                      </button>
                    </div>`
  }

  return `<div class='user'>
            <div class='userImageContainer'>
              <img src='${userData.profilePic}'>
            </div>
            <div class='userDetailsContainer'>
              <div class='header'>
                <a href='/profile/${userData.username}'>${name}</a>
                <span class='username'>@${userData.username}</span>
              </div>
            </div>
            ${followButton}
          </div>`
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

function messageReceived(message) {
  if ($(".chatContainer").length == 0) {
    // show notification
  } else {
    addChatMessageHtml(message)
  }
  refreshMessagesBadge()
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
  if (!callback) callback = (_, __, xhr) => {
    if (xhr.status == 204) {
      const activeNotifications = $(".resultListItem.notification.active")
      if (activeNotifications.length > 0) {
        activeNotifications.removeClass("active")
      }
    }
  }
  const url = notificationId ? `/api/notifications/${notificationId}/opened` : '/api/notifications/opened'
  $.ajax({
    url,
    type: "PUT",
    success: callback
  })
}

function refreshMessagesBadge() {
  $.get("/api/chats", { unreadOnly: true }, data => {
    const results = data.length
    if (results > 0) {
      $("#messagesBadge").text(results).addClass("active")
    } else {
      $("#messagesBadge").text("").removeClass("active")
    }
  })
}

function refreshNotificationsBadge() {
  $.get("/api/notifications", { unreadOnly: true }, data => {
    const results = data.length
    if (results > 0) {
      $("#notificationsBadge").text(results).addClass("active")
    } else {
      $("#notificationsBadge").text("").removeClass("active")
    }
  })
}