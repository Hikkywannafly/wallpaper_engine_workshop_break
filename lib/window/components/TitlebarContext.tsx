import { createContext, useContext, useState } from 'react'

interface TitlebarContextProps {
  activeMenuIndex: number | null
  setActiveMenuIndex: (index: number | null) => void
  menusVisible: boolean
  setMenusVisible: (visible: boolean) => void
  closeActiveMenu: () => void
}

const TitlebarContext = createContext<TitlebarContextProps | undefined>(undefined)

export const TitlebarContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null)
  const [menusVisible, setMenusVisible] = useState(false)
  const closeActiveMenu = () => setActiveMenuIndex(null)

  return (
    <TitlebarContext value={{ activeMenuIndex, setActiveMenuIndex, menusVisible, setMenusVisible, closeActiveMenu }}>
      {children}
    </TitlebarContext>
  )
}

export const useTitlebarContext = () => {
  const context = useContext(TitlebarContext)
  if (context === undefined) {
    throw new Error('useTitlebarContext must be used within a TitlebarContext')
  }
  return context
}
