import { useState } from 'react'
import { motion } from 'framer-motion'
import { Account } from './types'
import AccountSelector from './components/AccountSelector'
import PathSelector from './components/PathSelector'
import LinkInput from './components/LinkInput'
// import ConsoleOutput from './components/ConsoleOutput'


const accounts: Account[] = Array.from({ length: 6 }, (_, i) => ({
    username: process.env[`ACCOUNT_${i + 1}_USERNAME`] || '',
    displayName: `Account ${i + 1}`,
    password: atob(process.env[`ACCOUNT_${i + 1}_PASSWORD`] || '')
}))

interface WorkshopDownloaderProps {
    onDownloadStart?: () => void
    onDownloadComplete?: () => void
    [key: string]: any
}

const WorkshopDownloader = ({ onDownloadStart, onDownloadComplete, ...props }: WorkshopDownloaderProps) => {
    const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0])
    const [savePath, setSavePath] = useState<string>('Not set')
    const [links, setLinks] = useState<string>('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<string>('')

    const showAlert = async (message: string, type: 'error' | 'success' = 'error') => {
        await window.api.invoke('show-message-box', { message, type })
    }

    // Update handleDownload function
    const handleDownload = async () => {
        if (savePath === 'Not set') {
            showAlert('Please select a save directory before downloading')
            return
        }

        if (!links.trim()) {
            showAlert('Please enter at least one workshop link')
            return
        }

        setIsDownloading(true)
        setDownloadProgress('')
        if (onDownloadStart) onDownloadStart()

        const workshopLinks = links.split('\n').filter(link => link.trim())
        const totalItems = workshopLinks.length

        for (let i = 0; i < workshopLinks.length; i++) {
            const link = workshopLinks[i]
            const match = link.match(/\b\d{8,10}\b/)
            if (match) {
                const pubfileId = match[0]
                setDownloadProgress(`Downloading item ${i + 1}/${totalItems}: ${pubfileId}`)

                try {
                    await window.api.invoke('download-workshop-item', {
                        pubfileId,
                        username: selectedAccount.username,
                        password: selectedAccount.password,
                        savePath
                    })
                } catch (error) {
                    showAlert(`Error downloading ${pubfileId}: ${error}`)
                }
            } else {
                showAlert(`Invalid link: ${link}`)
            }
        }

        setIsDownloading(false)
        setDownloadProgress('')
        if (onDownloadComplete) onDownloadComplete()
        showAlert('Download completed', 'success')
    }

    const handlePathSelect = async () => {
        try {
            const result = await window.api.invoke('select-directory')
            if (result.success) {
                setSavePath(result.path)
                window.api.send('save-last-location', result.path)
            } else {
                showAlert('Error selecting directory')
            }
        } catch (error) {
            showAlert('Error selecting directory')
        }
    }

    const handleAccountChange = (displayName: string) => {
        const newAccount = accounts.find(acc => acc.displayName === displayName)
        if (newAccount) {
            setSelectedAccount(newAccount)
        }
    }

    return (
        <div className="flex flex-col items-center p-6 space-y-6 w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
            <h1 className="text-3xl text-yellow-500 font-bold text-center  bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                Wallpaper Engine Workshop Downloader
            </h1>

            <AccountSelector
                accounts={accounts}
                selectedAccount={selectedAccount}
                onAccountChange={handleAccountChange}
            />

            <PathSelector
                savePath={savePath}
                onPathSelect={handlePathSelect}
            />

            <LinkInput
                links={links}
                isDownloading={isDownloading}
                onLinksChange={setLinks}
            />

            {downloadProgress && (
                <div className="text-blue-600 font-medium">
                    {downloadProgress}
                </div>
            )}

            <motion.button
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDownload}
                disabled={isDownloading}
                whileHover={!isDownloading ? { scale: 1.02 } : {}}
                whileTap={!isDownloading ? { scale: 0.98 } : {}}
            >
                {isDownloading ? 'Downloading...' : 'Download'}
            </motion.button>
        </div>
    )
}

export default WorkshopDownloader