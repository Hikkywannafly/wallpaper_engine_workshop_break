import { motion, AnimatePresence } from 'framer-motion'

interface ConsoleOutputProps {
    consoleOutput: string[]
}

const ConsoleOutput = ({ consoleOutput }: ConsoleOutputProps) => {
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm p-7 rounded-xl shadow-md border border-white/20 flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
        >
            <label className="block text-lg font-semibold text-gray-800 mb-3">Console Output:</label>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-[200px] overflow-y-auto font-mono text-sm">
                <AnimatePresence>
                    {consoleOutput.map((line, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="py-1 border-b border-gray-800 last:border-0"
                        >
                            {line}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default ConsoleOutput