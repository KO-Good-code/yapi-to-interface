import Content from "./lib/content"

const content = new Content()

document.addEventListener('DOMContentLoaded', function (e) {
  content.contentLoad(e)
})

export default content




