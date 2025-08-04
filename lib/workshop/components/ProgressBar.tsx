import { motion, AnimatePresence } from 'framer-motion'

interface ProgressBarProps {
    isVisible: boolean
    currentItem: number
    totalItems: number
    currentItemId?: string
    message?: string
}

const ProgressBar = ({ isVisible, currentItem, totalItems, currentItemId, message }: ProgressBarProps) => {
    const progress = totalItems > 0 ? (currentItem / totalItems) * 100 : 0

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="w-full bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Download Progress</h3>
                        <span className="text-sm font-medium text-gray-600">
                            {currentItem}/{totalItems}
                        </span>
                    </div>

                    <div className="relative mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                            </motion.div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Status:</span> {message}
                            </p>
                            {currentItemId && (
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">Item ID:</span> {currentItemId}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ProgressBar