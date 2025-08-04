import { motion } from 'framer-motion'

interface PathSelectorProps {
    savePath: string
    onPathSelect: () => void
}

const PathSelector = ({ savePath, onPathSelect }: PathSelectorProps) => {
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
        >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
                Wallpaper Engine Directory
            </label>

            <motion.button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                onClick={onPathSelect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Select Directory
            </motion.button>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">Selected Path:</span>
                </div>
                <p className="text-gray-700 break-words text-sm bg-white p-2 rounded border">
                    {savePath === 'Not set' ? (
                        <span className="text-orange-500 italic">No directory selected</span>
                    ) : (
                        savePath
                    )}
                </p>
            </div>
        </motion.div>
    )
}

export default PathSelector