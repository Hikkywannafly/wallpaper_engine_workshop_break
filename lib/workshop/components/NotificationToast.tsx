import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface Notification {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
}

interface NotificationToastProps {
    notification: Notification | null
    onClose: () => void
}

const NotificationToast = ({ notification, onClose }: NotificationToastProps) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose()
            }, notification.duration || 4000)

            return () => clearTimeout(timer)
        }
    }, [notification, onClose])

    const getToastStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            case 'warning':
                return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            case 'info':
                return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
            default:
                return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                )
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            default:
                return null
        }
    }

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    className="fixed top-4 right-4 z-50"
                >
                    <div className={`rounded-lg shadow-lg p-4 max-w-sm min-w-[300px] ${getToastStyles(notification.type)}`}>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium break-words">{notification.message}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default NotificationToast