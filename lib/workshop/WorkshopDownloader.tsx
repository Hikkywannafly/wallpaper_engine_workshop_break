import { useState, useEffect } from 'react'
import { Account } from './types'

interface WorkshopPreview {
    id: string
    title: string
    preview_url: string
    description: string
    creator: string
}

const accounts: Account[] = [
    { username: 'ruiiixx', displayName: 'Account 1', password: 'UzY3R0JUQjgzRDNZ' },
    { username: 'premexilmenledgconis', displayName: 'Account 2', password: 'M3BYYkhaSmxEYg==' },
    { username: 'vAbuDy', displayName: 'Account 3', password: 'Qm9vbHE4dmlw' },
    { username: 'adgjl1182', displayName: 'Account 4', password: 'UUVUVU85OTk5OQ==' },
    { username: 'gobjj16182', displayName: 'Account 5', password: 'enVvYmlhbzgyMjI=' },
    { username: '787109690', displayName: 'Account 6', password: 'SHVjVXhZTVFpZzE1' },
];

interface WorkshopDownloaderProps {
    onDownloadStart?: () => void
    onDownloadComplete?: () => void
}

const WorkshopDownloader = ({ onDownloadStart, onDownloadComplete }: WorkshopDownloaderProps) => {
    const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0])
    const [savePath, setSavePath] = useState<string>('Not set')
    const [links, setLinks] = useState<string>('')

    // Load saved path on component mount
    useEffect(() => {
        const loadSavedPath = async () => {
            try {
                const savedPath = await window.api.invoke('get-last-save-location')
                if (savedPath && savedPath !== 'Not set') {
                    setSavePath(savedPath)
                }
            } catch (error) {
                console.log('No saved path found or error loading:', error)
            }
        }

        loadSavedPath()

        // Check .NET runtime status
        const checkDotNet = async () => {
            try {
                const result = await window.api.invoke('check-dotnet-runtime')
                setDotNetStatus(result.hasDotNet ? 'available' : 'missing')
            } catch (error) {
                console.error('Failed to check .NET runtime:', error)
                setDotNetStatus('missing')
            }
        }
        checkDotNet()
    }, [])
    const [isDownloading, setIsDownloading] = useState(false)
    const [currentItem, setCurrentItem] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [progressMessage, setProgressMessage] = useState<string>('')
    const [previews, setPreviews] = useState<WorkshopPreview[]>([])
    const [currentProgress, setCurrentProgress] = useState(0)
    const [detailedProgress, setDetailedProgress] = useState<string>('')
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false)
    const [dotNetStatus, setDotNetStatus] = useState<'checking' | 'available' | 'missing'>('checking')

    const showNotification = (message: string) => {
        alert(message)
    }

    const extractWorkshopId = (input: string): string | null => {
        // Extract ID from Steam Community URLs
        const steamUrlMatch = input.match(/[?&]id=(\d+)/i)
        if (steamUrlMatch) {
            return steamUrlMatch[1]
        }

        // Extract standalone ID numbers
        const idMatch = input.match(/\b\d{8,10}\b/)
        if (idMatch) {
            return idMatch[0]
        }

        return null
    }

    const fetchWorkshopPreview = async (id: string): Promise<WorkshopPreview | null> => {
        try {
            console.log('Renderer requesting preview for ID:', id)

            // Call main process to fetch preview (bypasses CSP)
            const preview = await window.api.invoke('fetch-workshop-preview', id)

            if (preview && preview.preview_url) {
                console.log('Preview received from main process:', preview)

                // Convert image URL to base64 to bypass CSP
                try {
                    const base64Image = await window.api.invoke('fetch-image-as-base64', preview.preview_url)
                    if (base64Image) {
                        console.log('Image converted to base64 successfully')
                        return {
                            ...preview,
                            preview_url: base64Image
                        }
                    }
                } catch (imgError) {
                    console.log('Failed to convert image to base64:', imgError)
                }

                return preview
            } else {
                console.log('No preview returned from main process for ID:', id)
            }

        } catch (error) {
            console.error('Failed to fetch workshop preview:', error)
        }
        return null
    }

    useEffect(() => {
        const loadPreviews = async () => {
            const workshopLinks = links.split('\n').filter(link => link.trim())
            if (workshopLinks.length === 0) {
                setPreviews([])
                setIsLoadingPreviews(false)
                return
            }

            setIsLoadingPreviews(true)
            const newPreviews: WorkshopPreview[] = []

            for (const link of workshopLinks) {
                const workshopId = extractWorkshopId(link.trim())
                if (workshopId) {
                    console.log('Fetching preview for ID:', workshopId)
                    const preview = await fetchWorkshopPreview(workshopId)
                    if (preview) {
                        console.log('Preview loaded:', preview)
                        newPreviews.push(preview)
                    } else {
                        console.log('Failed to load preview for ID:', workshopId)
                    }
                }
            }

            console.log('Setting previews:', newPreviews)
            setPreviews(newPreviews)
            setIsLoadingPreviews(false)
        }

        if (links.trim()) {
            const timeoutId = setTimeout(loadPreviews, 1000) // Increased debounce
            return () => clearTimeout(timeoutId)
        } else {
            setPreviews([])
            setIsLoadingPreviews(false)
        }
    }, [links])

    useEffect(() => {
        // Listen for real-time download progress
        const handleDownloadProgress = (...args: any[]) => {
            const data = args[0]
            const { progress, message } = data
            setCurrentProgress(progress || 0)
            setDetailedProgress(message || '')
        }

        // Add listener for download progress
        window.api.receive('download-progress', handleDownloadProgress)

        return () => {
            // Cleanup listener when component unmounts
            window.api.removeAllListeners('download-progress')
        }
    }, [])

    const handleDownload = async () => {
        if (savePath === 'Not set') {
            showNotification('Please select a save directory before downloading')
            return
        }

        if (!links.trim()) {
            showNotification('Please enter at least one workshop link')
            return
        }

        const workshopLinks = links.split('\n').filter(link => link.trim())
        setIsDownloading(true)
        setTotalItems(workshopLinks.length)
        setCurrentItem(0)
        setProgressMessage('Preparing download...')

        if (onDownloadStart) onDownloadStart()

        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < workshopLinks.length; i++) {
            const link = workshopLinks[i]
            const workshopId = extractWorkshopId(link.trim())

            setCurrentItem(i + 1)
            setCurrentProgress(0)
            setDetailedProgress('')

            if (workshopId) {
                const pubfileId = workshopId
                setProgressMessage(`Starting download for item ${pubfileId}...`)

                try {
                    await window.api.invoke('download-workshop-item', {
                        pubfileId,
                        username: selectedAccount.username,
                        password: selectedAccount.password,
                        savePath
                    })
                    successCount++
                    setProgressMessage(`Successfully downloaded item ${pubfileId}`)
                    setCurrentProgress(100)
                    setDetailedProgress('Download completed!')
                } catch (error) {
                    errorCount++
                    setProgressMessage(`Failed to download item ${pubfileId}`)
                    setCurrentProgress(0)
                    setDetailedProgress(`Error: ${error}`)
                    showNotification(`Error downloading ${pubfileId}: ${error}`)
                }
            } else {
                errorCount++
                showNotification(`Invalid link format: ${link}`)
            }

            // Brief pause between downloads
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        setIsDownloading(false)
        setCurrentItem(0)
        setTotalItems(0)
        setProgressMessage('')
        setCurrentProgress(0)
        setDetailedProgress('')

        if (onDownloadComplete) onDownloadComplete()

        if (errorCount === 0) {
            showNotification(`All ${successCount} items downloaded successfully!`)
        } else if (successCount > 0) {
            showNotification(`Downloaded ${successCount} items with ${errorCount} errors`)
        } else {
            showNotification(`Download failed - ${errorCount} errors occurred`)
        }
    }

    const handlePathSelect = async () => {
        try {
            const result = await window.api.invoke('select-directory')
            if (result.success) {
                setSavePath(result.path)
                // Save the selected path for future use
                await window.api.invoke('save-last-save-location', result.path)
                showNotification('Directory selected and saved!')
            } else {
                showNotification('Failed to select directory')
            }
        } catch (error) {
            showNotification('Error selecting directory')
        }
    }

    const handleAccountChange = (displayName: string) => {
        const newAccount = accounts.find(acc => (acc.displayName || acc.username) === displayName)
        if (newAccount) {
            setSelectedAccount(newAccount)
        }
    }

    const containerStyle = {
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fce4ec 100%)',
        height: '100vh',
        padding: '12px',
        color: '#2d3748',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'auto'
    }

    const contentStyle = {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        gap: '12px',
        maxWidth: '750px',
        margin: '0 auto'
    }

    const cardStyle = {
        background: 'rgba(255,255,255,0.85)',
        padding: '12px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
    }

    const labelStyle = {
        fontSize: '1rem',
        fontWeight: '600' as const,
        marginBottom: '8px',
        display: 'block' as const,
        color: '#4a5568'
    }

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '0.9rem',
        backgroundColor: '#ffffff',
        color: '#2d3748'
    }

    const buttonStyle = {
        width: '100%',
        padding: '16px',
        background: isDownloading ? '#a0aec0' : 'linear-gradient(45deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.2rem',
        fontWeight: '600' as const,
        cursor: isDownloading ? 'not-allowed' as const : 'pointer' as const,
        boxShadow: isDownloading ? 'none' : '0 4px 6px rgba(0,0,0,0.1)'
    }

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <div style={{ textAlign: 'center' as const }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '6px', color: '#2d3748' }}>
                         WE Downloader - alexjoneso
                    </h1>
                    <p style={{ color: '#718096', fontSize: '0.8rem' }}>
                        Made by alexjoneso • If u have any problem contact me on discord: nekozzuki
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        background: dotNetStatus === 'available' ? 'rgba(34, 197, 94, 0.1)' :
                            dotNetStatus === 'missing' ? 'rgba(239, 68, 68, 0.1)' :
                                'rgba(59, 130, 246, 0.1)',
                        color: dotNetStatus === 'available' ? '#16a34a' :
                            dotNetStatus === 'missing' ? '#dc2626' :
                                '#3b82f6'
                    }}>
                        {dotNetStatus === 'checking' && '⏳ Checking .NET Runtime...'}
                        {dotNetStatus === 'available' && '✅ .NET 9.0 Runtime Available'}
                        {dotNetStatus === 'missing' && '❌ .NET 9.0 Runtime Missing'}
                    </div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                    <div style={cardStyle}>
                        <label style={labelStyle}>👤 Steam Account</label>
                        <select
                            style={inputStyle}
                            value={selectedAccount.displayName || selectedAccount.username}
                            onChange={(e) => handleAccountChange(e.target.value)}
                        >
                            {accounts.map((acc) => (
                                <option key={acc.username} value={acc.displayName || acc.username}>
                                    {acc.displayName || acc.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={cardStyle}>
                        <label style={labelStyle}>📁 Download Directory</label>
                        <button
                            style={{ ...inputStyle, background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', cursor: 'pointer', marginBottom: '12px', border: 'none' }}
                            onClick={handlePathSelect}
                        >
                            📂 Select Directory
                        </button>

                    </div>

                    <div style={cardStyle}>
                        <label style={labelStyle}>🔗 Workshop Links</label>
                        <textarea
                            style={{ ...inputStyle, height: '80px' }}
                            value={links}
                            onChange={(e) => setLinks(e.target.value)}
                            disabled={isDownloading}
                            placeholder="Enter workshop links or IDs here..."
                        />


                        {/* Loading Spinner */}
                        {isLoadingPreviews && (
                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #e2e8f0',
                                    borderTop: '3px solid #667eea',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: '#4a5568' }}>
                                    Loading previews...
                                </span>
                            </div>
                        )}

                        {/* Workshop Previews */}
                        {!isLoadingPreviews && previews.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', maxHeight: '200px', overflowY: 'auto' as const }}>
                                    {previews.map((preview) => (
                                        <div key={preview.id} style={{
                                            display: 'flex',
                                            background: '#f7fafc',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            gap: '12px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {preview.preview_url ? (
                                                <img
                                                    src={preview.preview_url}
                                                    style={{
                                                        width: '80px',
                                                        height: '60px',
                                                        borderRadius: '6px',
                                                        objectFit: 'cover' as const,
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                    alt="Preview"
                                                    onError={(e) => {

                                                        (e.target as HTMLImageElement).style.display = 'none'
                                                    }}
                                                    onLoad={() => {
                                                        console.log('Image loaded successfully!')
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '80px',
                                                    height: '60px',
                                                    background: '#e2e8f0',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    🖼️
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    marginBottom: '4px',
                                                    color: '#2d3748',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap' as const
                                                }}>
                                                    {preview.title || `Workshop Item ${preview.id}`}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '2px' }}>
                                                    👤 {preview.creator}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>
                                                    🆔 {preview.id}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {isDownloading && (
                        <div style={cardStyle}>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>⏳ Download Progress</h3>

                            {/* Overall Progress */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>Overall Progress</span>
                                    <span style={{ fontSize: '0.8rem' }}>{currentItem}/{totalItems}</span>
                                </div>
                                <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '6px' }}>
                                    <div style={{
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        height: '100%',
                                        borderRadius: '10px',
                                        width: `${totalItems > 0 ? (currentItem / totalItems) * 100 : 0}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>

                            {/* Current Item Progress */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>Current Item</span>
                                    <span style={{ fontSize: '0.8rem' }}>{currentProgress.toFixed(1)}%</span>
                                </div>
                                <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px' }}>
                                    <div style={{
                                        background: 'linear-gradient(45deg, #48bb78, #38a169)',
                                        height: '100%',
                                        borderRadius: '10px',
                                        width: `${currentProgress}%`,
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>

                            {/* Status Messages */}
                            <div style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.4' }}>
                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                    {progressMessage}
                                </div>
                                {detailedProgress && (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8, fontStyle: 'italic' }}>
                                        {detailedProgress}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        style={{ ...buttonStyle, padding: '12px' }}
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : '🚀 Start Download'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WorkshopDownloader