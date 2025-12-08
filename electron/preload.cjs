const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // 文件操作
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  openFileDialog: (options) => ipcRenderer.invoke('file:openDialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('file:saveDialog', options),
  
  // 监听事件
  on: (channel, callback) => {
    const validChannels = [
      'app:version',
      'window:minimized',
      'window:maximized',
      'file:changed'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback)
    }
  },
  
  // 移除监听器
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  },
  
  
})
