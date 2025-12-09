import { motion, AnimatePresence } from 'framer-motion'

// SVG Icons
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
)

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  data?: any
  created_at: string
}

interface NotificationBellProps {
  notifications: Notification[]
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
  onMarkAllRead: () => void
}

export default function NotificationBell({
  notifications,
  showNotifications,
  setShowNotifications,
  onMarkAllRead
}: NotificationBellProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rdv_confirmed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
          </div>
        )
      case 'call_failed':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <XIcon className="w-4 h-4 text-red-600" />
          </div>
        )
      case 'recall_needed':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-orange-600" />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <PhoneIcon className="w-4 h-4 text-blue-600" />
          </div>
        )
    }
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 hover:bg-dark-100 rounded-xl transition-colors"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <BellIcon className="w-5 h-5 text-dark-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-dark-200 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-100">
              <h4 className="font-semibold text-dark-900">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="w-10 h-10 text-dark-300 mx-auto mb-3" />
                  <p className="text-dark-500">Aucune notification</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 p-4 border-b border-dark-100 hover:bg-dark-50 transition-colors ${
                      !notif.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-dark-900 text-sm">{notif.title}</div>
                      <p className="text-dark-500 text-sm truncate">{notif.message}</p>
                      <span className="text-xs text-dark-400 mt-1">
                        {formatDate(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
