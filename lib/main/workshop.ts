import { app, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'

// Function to check if .NET 9.0 Runtime is installed
async function checkDotNetRuntime(): Promise<boolean> {
    try {
        const execAsync = promisify(exec)

        // Try to run dotnet --list-runtimes
        const { stdout } = await execAsync('dotnet --list-runtimes')

        // Check if .NET 9.0 is in the list
        if (stdout.includes('Microsoft.NETCore.App 9.0.')) {
            console.log('.NET 9.0 Runtime found')
            return true
        }

        console.log('.NET 9.0 Runtime not found in dotnet --list-runtimes')
        return false
    } catch (error) {
        console.log('Error checking .NET runtime:', error)
        return false
    }
}

export function setupWorkshopHandlers() {
    let lastSaveLocation = ''
    const settingsPath = join(app.getPath('userData'), 'settings.json')

    // Load saved settings on startup
    try {
        if (existsSync(settingsPath)) {
            const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
            lastSaveLocation = settings.lastSaveLocation || ''
        }
    } catch (error) {
        console.log('No saved settings found or error loading:', error)
    }

    ipcMain.handle('show-message-box', async (_, args) => {
        const { message, type } = args
        const options = {
            type: type || 'info',
            title: 'WE Downloader - alexjoneso',
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

    ipcMain.handle('save-last-save-location', async (_, path: string) => {
        lastSaveLocation = path
        try {
            const settings = { lastSaveLocation: path }
            writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
            console.log('Saved last save location:', path)
        } catch (error) {
            console.error('Failed to save settings:', error)
        }
    })

    ipcMain.handle('get-last-save-location', async () => {
        return lastSaveLocation || 'Not set'
    })

    // Check .NET runtime availability
    ipcMain.handle('check-dotnet-runtime', async () => {
        const hasDotNet = await checkDotNetRuntime()
        return { hasDotNet }
    })

    ipcMain.handle('fetch-workshop-preview', async (_, id: string) => {
        try {
            console.log('Main process fetching preview for ID:', id)

            // Try Steam API first
            const response = await fetch(`https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `itemcount=1&publishedfileids[0]=${id}`
            })

            const data = await response.json()
            console.log('Steam API response:', data)

            const item = data.response?.publishedfiledetails?.[0]

            if (item && item.result === 1) {
                console.log('Found item via Steam API:', item)
                return {
                    id,
                    title: item.title || 'Unknown Title',
                    preview_url: item.preview_url || '',
                    description: item.description || '',
                    creator: item.creator || 'Unknown Creator'
                }
            }

            console.log('Steam API failed, trying fallback...')

            // Fallback: Create a basic preview with Steam CDN image
            const steamCdnUrl = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/431960/${id}.jpg`

            // Test if image exists
            try {
                const imgResponse = await fetch(steamCdnUrl, { method: 'HEAD' })
                if (imgResponse.ok) {
                    console.log('Found Steam CDN image:', steamCdnUrl)
                    return {
                        id,
                        title: `Workshop Item ${id}`,
                        preview_url: steamCdnUrl,
                        description: '',
                        creator: 'Unknown Creator'
                    }
                }
            } catch (imgError) {
                console.log('Steam CDN image not found:', imgError)
            }

            // Final fallback: Try different Steam CDN patterns
            const alternativeUrls = [
                `https://steamcdn-a.akamaihd.net/steam/apps/431960/workshop/${id}.jpg`,
                `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/431960/${id}_preview.jpg`,
                `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/items/431960/${id}_header.jpg`
            ]

            for (const url of alternativeUrls) {
                try {
                    const testResponse = await fetch(url, { method: 'HEAD' })
                    if (testResponse.ok) {
                        console.log('Found alternative Steam CDN image:', url)
                        return {
                            id,
                            title: `Workshop Item ${id}`,
                            preview_url: url,
                            description: '',
                            creator: 'Unknown Creator'
                        }
                    }
                } catch (error) {
                    console.log('Alternative URL failed:', url, error)
                }
            }

            console.log('All preview methods failed for ID:', id)
            return null

        } catch (error) {
            console.error('Failed to fetch workshop preview:', error)
            return null
        }
    })

    ipcMain.handle('fetch-image-as-base64', async (_, imageUrl: string) => {
        try {
            console.log('Fetching image as base64:', imageUrl)
            const response = await fetch(imageUrl)
            const buffer = await response.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const mimeType = response.headers.get('content-type') || 'image/jpeg'
            return `data:${mimeType};base64,${base64}`
        } catch (error) {
            console.error('Failed to fetch image:', error)
            return null
        }
    })

    ipcMain.handle('download-workshop-item', async (event, args) => {
        const { pubfileId, username, password, savePath } = args

        // Check .NET runtime first
        const hasDotNet = await checkDotNetRuntime()
        if (!hasDotNet) {
            const result = await dialog.showMessageBox({
                type: 'error',
                title: 'WE Downloader - alexjoneso',
                message: '.NET 9.0 Runtime Required',
                detail: 'This application requires .NET 9.0 Runtime to function properly.\n\nWould you like to download and install .NET 9.0 Runtime now?',
                buttons: ['Download .NET 9.0', 'Cancel'],
                defaultId: 0
            })

            if (result.response === 0) {
                // Open .NET download page
                const { shell } = require('electron')
                shell.openExternal('https://dotnet.microsoft.com/download/dotnet/thank-you/runtime-9.0.0-windows-x64-installer')
            }

            throw new Error('.NET 9.0 Runtime is required. Please install it and try again.')
        }

        // Decode base64 password if needed
        let decodedPassword = password
        try {
            decodedPassword = Buffer.from(password, 'base64').toString('utf-8')
        } catch (e) {
            // If decode fails, use original password
            decodedPassword = password
        }
        const targetDirectory = join(savePath, pubfileId)
        const depotDownloaderPath = process.env.NODE_ENV === 'development'
            ? join(app.getAppPath(), 'DepotDownloaderMod', 'DepotDownloaderMod.exe')
            : join(process.resourcesPath, 'DepotDownloaderMod', 'DepotDownloaderMod.exe')

        if (!existsSync(depotDownloaderPath)) {
            throw new Error('DepotDownloader not found. Please reinstall the application.')
        }

        return new Promise((resolve, reject) => {
            const process = spawn(depotDownloaderPath, [
                '-app', '431960',
                '-pubfile', pubfileId,
                '-verify-all',
                '-username', username,
                '-password', decodedPassword,
                '-dir', targetDirectory
            ], {
                windowsHide: true
            })

            let currentStep = 'Initializing...'
            let currentProgress = 0

            process.stdout.on('data', (data) => {
                const output = data.toString()
                console.log(output)

                // Parse progress from DepotDownloader output
                const lines = output.split('\n')
                lines.forEach(line => {
                    line = line.trim()

                    // Parse percentage lines like " 03.49% filename"
                    const progressMatch = line.match(/^\s*(\d+\.\d+)%\s+(.+)$/)
                    if (progressMatch) {
                        currentProgress = parseFloat(progressMatch[1])
                        const filename = progressMatch[2].split('\\').pop() || progressMatch[2]
                        currentStep = `Downloading ${filename}...`

                        // Send progress update to renderer
                        event.sender.send('download-progress', {
                            pubfileId,
                            progress: currentProgress,
                            message: currentStep
                        })
                    }

                    // Parse status messages
                    else if (line.includes('Processing depot')) {
                        currentStep = 'Processing depot...'
                        event.sender.send('download-progress', {
                            pubfileId,
                            progress: 0,
                            message: currentStep
                        })
                    }
                    else if (line.includes('Downloading depot')) {
                        currentStep = 'Starting download...'
                        event.sender.send('download-progress', {
                            pubfileId,
                            progress: 0,
                            message: currentStep
                        })
                    }
                    else if (line.includes('Validating')) {
                        const filename = line.split('\\').pop() || line.split(' ').pop()
                        currentStep = `Validating ${filename}...`
                        event.sender.send('download-progress', {
                            pubfileId,
                            progress: currentProgress,
                            message: currentStep
                        })
                    }
                    else if (line.includes('Downloaded') && line.includes('bytes')) {
                        currentStep = 'Download completed!'
                        event.sender.send('download-progress', {
                            pubfileId,
                            progress: 100,
                            message: currentStep
                        })
                    }
                })
            })

            process.stderr.on('data', (data) => {
                const output = data.toString()
                console.error(output)

                // Send error updates
                if (output.includes('Authentication failed')) {
                    event.sender.send('download-progress', {
                        pubfileId,
                        progress: 0,
                        message: 'Authentication failed - check username/password'
                    })
                }
            })

            process.on('close', (code) => {
                if (code === 0) {
                    event.sender.send('download-progress', {
                        pubfileId,
                        progress: 100,
                        message: 'Download completed successfully!'
                    })
                    resolve(true)
                } else {
                    event.sender.send('download-progress', {
                        pubfileId,
                        progress: 0,
                        message: `Download failed (exit code ${code})`
                    })
                    reject(new Error(`Process exited with code ${code}`))
                }
            })

            process.on('error', (err) => {
                event.sender.send('download-progress', {
                    pubfileId,
                    progress: 0,
                    message: `Process error: ${err.message}`
                })
                reject(err)
            })
        })
    })

    app.on('before-quit', () => {
        // Kill any running DepotDownloader processes
        spawn('taskkill', ['/f', '/im', 'DepotDownloaderMod.exe'], { windowsHide: true })
    })
}