$(document).ready(() => {
  $.get("/api/notifications", notifications => {
    outputNotificationList(notifications, $(".resultsContainer"))
  })
})

$(document).on("click", ".notification.active", e => {
  const container = $(e.target)
  const notificationId = container.data().id
  const href = container.attr("href")
  e.preventDefault()
  const callback = () => window.location.href = href
  markNotificationsAsOpened(notificationId, callback)
})

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened())

function outputNotificationList(notifications, container) {
  notifications.forEach(notification => {
    const html = createNotificationHtml(notification)
    container.append(html)
  })

  if (notifications.length == 0) {
    container.append('<span class="noResults">Nothing to show</span>')
  }
}