import '../styles/app.css'
import '../styles/tailwind.css'
import '@/lib/workshop/workshop.css'
import { useState } from 'react'
import { Account } from '@/lib/workshop/types'
import AccountSelector from '@/lib/workshop/components/AccountSelector'
import PathSelector from '@/lib/workshop/components/PathSelector'
import LinkInput from '@/lib/workshop/components/LinkInput'

export default function App() {
  return <WorkshopDownloader />
}

const accounts: Account[] = [
  { username: 'ruiiixx', password: atob('UzY3R0JUQjgzRDNZ') },
  { username: 'premexilmenledgconis', password: atob('M3BYYkhaSmxEYg==') },
  { username: 'vAbuDy', password: atob('Qm9vbHE4dmlw') },
  { username: 'adgjl1182', password: atob('UUVUVU85OTk5OQ==') },
  { username: 'gobjj16182', password: atob('enVvYmlhbzgyMjI=') },
  { username: '787109690', password: atob('SHVjVXhZTVFpZzE1') }
]

interface WorkshopDownloaderProps {
  onDownloadStart?: () => void
  onDownloadComplete?: () => void
  [key: string]: any
}

const WorkshopDownloader = ({ onDownloadStart, onDownloadComplete }: WorkshopDownloaderProps) => {
  const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0])
  const [savePath, setSavePath] = useState<string>('Not set')
  const [links, setLinks] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)

  const showAlert = async (message: string, type: 'error' | 'success' = 'error') => {
    await window.api.invoke('show-message-box', { message, type })
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
    if (onDownloadStart) onDownloadStart()

    const workshopLinks = links.split('\n').filter(link => link.trim())

    for (const link of workshopLinks) {
      const match = link.match(/\b\d{8,10}\b/)
      if (match) {
        const pubfileId = match[0]

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
    if (onDownloadComplete) onDownloadComplete()
    showAlert('Download completed', 'success')
  }

  const handleAccountChange = (username: string) => {
    const newAccount = accounts.find(acc => acc.username === username)
    if (newAccount) {
      setSelectedAccount(newAccount)
    }
  }

  return (
    <div className="flex flex-col items-center p-6 space-y-6 w-full max-w-4xl mx-auto rounded-xl shadow-lg ">
      <h1 className="text-3xl text-center  bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
        Tool Wallpaper Engine Workshop Downloader By alexjoneso
      </h1>
      <h1 className="text-3xl text-center  bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
        This tool use steam depot downloader utilizing from  https://github.com/SteamAutoCracks/DepotDownloaderMod
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

      {/* <ConsoleOutput consoleOutput={consoleOutput} /> */}

      <button
        className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white  s hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
    </div>
  )
}
