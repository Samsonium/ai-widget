import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('core', {
    focus: (state: boolean) => ipcRenderer.invoke('win:focus', state),
})
