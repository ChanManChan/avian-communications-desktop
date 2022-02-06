$(document).ready(() => {
  if (selectedTab === "followers") {
    loadFollowers()
  } else {
    loadFollowing()
  }
})

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, user => {
    outputUsers(user.followers, $(".resultsContainer"))
  })
}

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, user => {
    outputUsers(user.following, $(".resultsContainer"))
  })
}