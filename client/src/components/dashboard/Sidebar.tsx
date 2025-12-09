import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

// SVG Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
)

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const CalendarCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <polyline points="9 16 12 19 16 14"/>
  </svg>
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  showProfileMenu: boolean
  setShowProfileMenu: (show: boolean) => void
  onLogout: () => void
  unreadNotifications: number
  renderNotificationBell: () => React.ReactNode
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  showProfileMenu,
  setShowProfileMenu,
  onLogout,
  renderNotificationBell
}: SidebarProps) {
  const { user } = useAuth()

  if (!user) return null

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: HomeIcon },
    { id: 'calls', label: 'Historique appels', icon: PhoneIcon },
    { id: 'appointments', label: 'Rendez-vous', icon: CalendarIcon },
    { id: 'calendar', label: 'Calendrier', icon: CalendarCheckIcon },
    { id: 'credits', label: 'Credits', icon: ClockIcon },
    { id: 'settings', label: 'Parametres', icon: SettingsIcon },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-5 left-5 z-[1001] p-2.5 bg-[#0f172a] border-none rounded-[10px] text-white cursor-pointer"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>

      {/* Mobile Notification Bell */}
      <div className="lg:hidden fixed top-5 right-5 z-[1001]">
        {renderNotificationBell()}
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[999]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-[260px] bg-[#0f172a] flex flex-col fixed h-screen z-[1000]
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Header */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center text-[#0f172a]">
              <PhoneIcon className="w-5 h-5" />
            </div>
            <span className="text-[1.4rem] font-bold text-white">Rendevo</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-[10px] mb-1 text-[0.95rem] transition-all duration-200
                  ${isActive
                    ? 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-5 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#10b981] rounded-[10px] flex items-center justify-center text-white font-semibold text-[0.9rem]">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-white text-[0.9rem]">{user.prenom} {user.nom}</span>
                <span className="text-[0.75rem] text-[#64748b] capitalize">{user.plan}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-transparent border-none text-[#64748b] cursor-pointer rounded-lg transition-all duration-200 hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-20 left-3 right-3 bg-white rounded-xl border border-[#e2e8f0] shadow-lg overflow-hidden"
              >
                <div className="p-4 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#10b981] rounded-[10px] flex items-center justify-center text-white font-semibold text-lg">
                      {user.prenom[0]}{user.nom[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0f172a]">{user.prenom} {user.nom}</div>
                      <div className="text-sm text-[#64748b]">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-[#64748b]">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">{user.creditsAppels} credits restants</span>
                  </div>
                </div>

                <div className="border-t border-[#e2e8f0] p-2">
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f1f5f9] text-[#374151] transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span className="text-sm">Parametres</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('credits')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f1f5f9] text-[#374151] transition-colors"
                  >
                    <CreditCardIcon className="w-4 h-4" />
                    <span className="text-sm">Gerer mes credits</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f1f5f9] text-[#374151] transition-colors">
                    <HelpCircleIcon className="w-4 h-4" />
                    <span className="text-sm">Aide et support</span>
                  </button>
                </div>

                <div className="border-t border-[#e2e8f0] p-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-[#dc2626] transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span className="text-sm">Deconnexion</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  )
}
