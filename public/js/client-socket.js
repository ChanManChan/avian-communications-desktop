let connected = false
const socket = io("http://localhost:3000")

socket.emit("setup", userLoggedIn)
socket.on("connected", () => connected = true)
socket.on("message received", message => messageReceived(message))
