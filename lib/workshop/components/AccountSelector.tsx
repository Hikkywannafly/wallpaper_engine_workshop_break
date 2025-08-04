import { motion } from 'framer-motion'
import { Account } from '../types'

interface AccountSelectorProps {
    accounts: Account[]
    selectedAccount: Account
    onAccountChange: (displayName: string) => void
}

const AccountSelector = ({ accounts, selectedAccount, onAccountChange }: AccountSelectorProps) => {
    return (
        <motion.div
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.01 }}
        >
            <label className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Steam Account
            </label>
            <div className="relative">
                <select
                    className="w-full p-4 text-base border-2 border-gray-200 rounded-xl text-gray-700 bg-white transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-300 appearance-none cursor-pointer shadow-sm"
                    value={selectedAccount.displayName || selectedAccount.username}
                    onChange={(e) => onAccountChange(e.target.value)}
                >
                    {accounts.map((acc) => (
                        <option key={acc.username} value={acc.displayName || acc.username} className="py-2">
                            {acc.displayName || acc.username}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
                Select a Steam account for downloading workshop items
            </p>
        </motion.div>
    )
}

export default AccountSelector