import { motion } from 'framer-motion'
import { useState } from 'react'

interface LinkInputProps {
    links: string
    isDownloading: boolean
    onLinksChange: (value: string) => void
}

const LinkInput = ({ links, isDownloading, onLinksChange }: LinkInputProps) => {
    const [isFocused, setIsFocused] = useState(false)
    const linkCount = links.split('\n').filter(link => link.trim()).length

    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
        >
            <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Workshop Links
                </label>
                {linkCount > 0 && (
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {linkCount} item{linkCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <motion.textarea
                className={`w-full p-4 min-h-[150px] border-2 rounded-xl text-gray-700 bg-white transition-all duration-300 resize-y shadow-sm ${isFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={links}
                onChange={(e) => onLinksChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isDownloading}
                placeholder="Enter workshop links or IDs here...&#10;Example:&#10;https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890&#10;1234567890&#10;https://steamcommunity.com/sharedfiles/filedetails/?id=0987654321"
                whileFocus={{ scale: 1.01 }}
            />

            <div className="mt-3 text-xs text-gray-500 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p>Enter one workshop link or ID per line.</p>
                    <p>Supports full Steam URLs or just the numeric ID.</p>
                </div>
            </div>
        </motion.div>
    )
}

export default LinkInput