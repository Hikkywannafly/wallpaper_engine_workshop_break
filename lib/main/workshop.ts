import { app, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { spawn } from 'child_process'

export function setupWorkshopHandlers() {
    let lastSaveLocation = ''

    ipcMain.handle('show-message-box', async (_, args) => {
        const { message, type } = args
        const options = {
            type: type || 'info',
            title: 'Wallpaper Engine Workshop Downloader',
            message: message,
            buttons: ['OK']
        }
        return dialog.showMessageBox(options)
    })

    ipcMain.handle('select-directory', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })

        if (canceled || !filePaths[0]) {
            return { success: false }
        }

        const selectedPath = filePaths[0]
        lastSaveLocation = selectedPath
        return { success: true, path: selectedPath }
    })

    ipcMain.handle('download-workshop-item', async (_, args) => {
        const { pubfileId, username, password, savePath } = args
        const targetDirectory = join(savePath, pubfileId)
        const depotDownloaderPath = process.env.NODE_ENV === 'development'
            ? join(app.getAppPath(), 'DepotDownloaderMod', 'DepotDownloadermod.exe')
            : join(process.resourcesPath, 'DepotDownloaderMod', 'DepotDownloadermod.exe')

        if (!existsSync(depotDownloaderPath)) {
            throw new Error('Không tìm thấy DepotDownloader. Vui lòng kiểm tra lại cài đặt ứng dụng.')
        }

        return new Promise((resolve, reject) => {
            const process = spawn(depotDownloaderPath, [
                '-app', '431960',
                '-pubfile', pubfileId,
                '-verify-all',
                '-username', username,
                '-password', password,
                '-dir', targetDirectory
            ], {
                windowsHide: true
            })

            process.stdout.on('data', (data) => {
                console.log(data.toString())
            })

            process.stderr.on('data', (data) => {
                console.error(data.toString())
            })

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(new Error(`Process exited with code ${code}`))
                }
            })

            process.on('error', (err) => {
                reject(err)
            })
        })
    })

    app.on('before-quit', () => {
        // Kill any running DepotDownloader processes
        spawn('taskkill', ['/f', '/im', 'DepotDownloadermod.exe'], { windowsHide: true })
    })
}