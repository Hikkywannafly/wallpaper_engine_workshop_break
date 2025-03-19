import { Account } from '../types'

interface AccountSelectorProps {
    accounts: Account[]
    selectedAccount: Account
    onAccountChange: (username: string) => void
}

const AccountSelector = ({ accounts, selectedAccount, onAccountChange }: AccountSelectorProps) => {
    return (
        <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm p-7 rounded-2xl shadow-lg border border-white/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <label className="block text-xl font-bold text-gray-800 mb-4 bg-clip-text">Select Account:</label>
            <div className="relative">
                <select
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl text-gray-700  duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 hover:bg-white appearance-none cursor-pointer"
                    value={selectedAccount.username}
                    onChange={(e) => onAccountChange(e.target.value)}
                >
                    {accounts.map((acc, i) => (
                        <option key={acc.username} value={acc.username} className="py-2">
                            {`Account ${i + 1}`}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default AccountSelector