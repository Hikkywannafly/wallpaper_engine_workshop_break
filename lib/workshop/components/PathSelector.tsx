interface PathSelectorProps {
    savePath: string
    onPathSelect: () => void
}

const PathSelector = ({ savePath, onPathSelect }: PathSelectorProps) => {
    return (
        <div
            className=" flex flex-col"

        >
            <button
                className="w-full text-white py-3 px-2 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                onClick={onPathSelect}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Select Wallpaper Engine Path's
            </button>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-700 break-words">
                    <span className="font-medium ">Current path:</span> {savePath}
                </p>
            </div>
        </div>
    )
}

export default PathSelector