const electron = require('electron')
const { ipcRenderer } = electron

ipcRenderer.on('todo:add', (_, todo) => {
  const li = document.createElement('li')
  const text = document.createTextNode(todo)

  li.appendChild(text)
  document.querySelector('ul').appendChild(li)
})

ipcRenderer.on('todo:clear', () => {
  document.querySelector('ul').innerHTML = ''
})
