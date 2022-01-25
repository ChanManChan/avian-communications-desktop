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