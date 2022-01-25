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
    button.prop("disabled", true)
  })
})

function createPostHtml(postData) {
  const postedBy = postData.postedBy
  const displayName = postedBy.firstName + ' ' + postedBy.lastName
  const timestamp = postData.createdAt
  return `<div class='post'>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${postedBy.username}'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                </div>
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                </div>
              </div>
            </div>
          </div>`
}