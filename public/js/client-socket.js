let connected = false
const socket = io("http://localhost:3000")

socket.emit("setup", userLoggedIn)
socket.on("connected", () => connected = true)
socket.on("message received", message => messageReceived(message))

socket.on("notification received", () => {
  $.get("/api/notifications/latest", notification => {
    showNotificationPopup(notification)
    refreshNotificationsBadge()
  })
})

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return
  socket.emit("notification received", userId)
}