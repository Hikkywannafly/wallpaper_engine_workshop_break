import { motion } from 'framer-motion'

interface LinkInputProps {
    links: string
    isDownloading: boolean
    onLinksChange: (value: string) => void
}

const LinkInput = ({ links, isDownloading, onLinksChange }: LinkInputProps) => {
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm p-7 rounded-xl shadow-md border border-white/20 flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
        >
            <label className="block text-lg font-semibold text-gray-800 mb-3">
                Enter workshop items (one per line, support link and file id):
            </label>
            <textarea
                className="w-full p-4 min-h-[150px] border-2 border-gray-200 rounded-xl text-gray-700 bg-gray-50 transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:bg-white resize-y"
                value={links}
                onChange={(e) => onLinksChange(e.target.value)}
                disabled={isDownloading}
                placeholder="Enter workshop links or IDs here..."
            />
        </motion.div>
    )
}

export default LinkInput