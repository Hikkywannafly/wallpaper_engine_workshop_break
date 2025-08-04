import { ipcRenderer } from 'electron'

const api = {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func)
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
}

export default api
