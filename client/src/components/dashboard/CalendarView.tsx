import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Icons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

interface Appointment {
  id: string
  client_prenom?: string
  client_nom?: string
  clientPrenom?: string
  clientNom?: string
  entreprise: string
  rdv_details?: string
  rdvDetails?: string
  rdv_date?: string
  rdvDate?: string
  status: string
  created_at?: string
  createdAt?: string
}

interface CalendarViewProps {
  appointments: Appointment[]
  renderNotificationBell: () => React.ReactNode
}

export default function CalendarView({
  appointments,
  renderNotificationBell
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const rdvDate = apt.rdv_date || apt.rdvDate
      if (rdvDate) {
        const aptDate = new Date(rdvDate)
        return aptDate.toDateString() === date.toDateString()
      }

      const rdvDetails = apt.rdv_details || apt.rdvDetails || ''
      const dateStr = rdvDetails.toLowerCase()
      const dayOfMonth = date.getDate()
      const monthNames = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']
      const currentMonth = monthNames[date.getMonth()]

      if (dateStr.includes(String(dayOfMonth)) && dateStr.includes(currentMonth)) {
        return true
      }

      return false
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

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

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointments.filter(apt => {
      const dateStr = apt.rdv_date || apt.rdvDate || apt.created_at || apt.createdAt
      if (dateStr) {
        const aptDate = new Date(dateStr)
        return aptDate >= today
      }
      return false
    }).sort((a, b) => {
      const dateA = new Date(a.rdv_date || a.rdvDate || a.created_at || a.createdAt || '')
      const dateB = new Date(b.rdv_date || b.rdvDate || b.created_at || b.createdAt || '')
      return dateA.getTime() - dateB.getTime()
    }).slice(0, 5)
  }

  const getThisMonthAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => {
      const dateStr = apt.rdv_date || apt.rdvDate || apt.created_at || apt.createdAt
      if (dateStr) {
        const aptDate = new Date(dateStr)
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
      }
      return false
    }).length
  }

  const calendarDays = getDaysInMonth(currentDate)
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <motion.div
      key="calendar"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Calendrier</h1>
          <p className="text-[#64748b]">Vos rendez-vous confirmes par l'IA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {renderNotificationBell()}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-[30px]">
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#ecfdf5] rounded-xl flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0f172a]">{appointments.length}</div>
            <div className="text-[#64748b] text-sm">Total RDV confirmes</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#f0f9ff] rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0f172a]">{getThisMonthAppointments()}</div>
            <div className="text-[#64748b] text-sm">Ce mois-ci</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#fef3c7] rounded-xl flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-[#f59e0b]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0f172a]">{getUpcomingAppointments().length}</div>
            <div className="text-[#64748b] text-sm">A venir</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-[#64748b]" />
            </button>
            <span className="text-lg font-semibold text-[#0f172a] capitalize min-w-[180px] text-center">
              {formatMonthYear(currentDate)}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-[#64748b]" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg text-[#374151] text-sm font-medium transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center py-2 text-sm font-medium text-[#64748b]">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date)
            const hasEvents = dayAppointments.length > 0

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors
                  ${!day.isCurrentMonth ? 'text-[#cbd5e1] bg-[#f8fafc]' : 'hover:bg-[#f1f5f9]'}
                  ${isToday(day.date) ? 'bg-[#f0f9ff] border-2 border-[#3b82f6]' : 'border border-[#f1f5f9]'}
                  ${hasEvents ? 'bg-[#ecfdf5]' : ''}
                `}
                onClick={() => hasEvents && setSelectedDay(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday(day.date) ? 'text-[#3b82f6]' : ''}`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt, i) => (
                    <div
                      key={i}
                      className="text-xs bg-[#10b981] text-white px-1 py-0.5 rounded truncate"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAppointment(apt)
                      }}
                    >
                      {apt.client_prenom || apt.clientPrenom}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-[#64748b]">
                      +{dayAppointments.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
            <span className="text-sm text-[#64748b]">RDV confirme</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
            <span className="text-sm text-[#64748b]">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              className="bg-white rounded-[20px] w-full max-w-md max-h-[90vh] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
                <h3 className="text-[1.3rem] font-bold text-[#0f172a] capitalize">{formatFullDate(selectedDay)}</h3>
                <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                  <XIcon className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {getAppointmentsForDate(selectedDay).length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
                    <p className="text-[#64748b]">Aucun rendez-vous ce jour</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getAppointmentsForDate(selectedDay).map((apt, index) => (
                      <div
                        key={index}
                        className="p-4 bg-[#f8fafc] rounded-xl cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setSelectedDay(null)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#ecfdf5] rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-5 h-5 text-[#10b981]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#0f172a]">
                              {apt.client_prenom || apt.clientPrenom} {apt.client_nom || apt.clientNom}
                            </div>
                            <div className="text-sm text-[#64748b]">
                              {apt.entreprise} - {apt.rdv_details || apt.rdvDetails || 'Horaire a confirmer'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAppointment(null)}
          >
            <motion.div
              className="bg-white rounded-[20px] w-full max-w-md overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
                <h3 className="text-[1.3rem] font-bold text-[#0f172a]">Details du rendez-vous</h3>
                <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                  <XIcon className="w-5 h-5 text-[#64748b]" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <UserIcon className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <div className="text-sm text-[#64748b]">Client</div>
                    <div className="font-medium text-[#0f172a]">
                      {selectedAppointment.client_prenom || selectedAppointment.clientPrenom} {selectedAppointment.client_nom || selectedAppointment.clientNom}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPinIcon className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <div className="text-sm text-[#64748b]">Entreprise</div>
                    <div className="font-medium text-[#0f172a]">{selectedAppointment.entreprise}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ClockIcon className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <div className="text-sm text-[#64748b]">Horaire</div>
                    <div className="font-medium text-[#0f172a]">
                      {selectedAppointment.rdv_details || selectedAppointment.rdvDetails || 'A confirmer'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircleIcon className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <div className="text-sm text-[#64748b]">Statut</div>
                    <span className="px-3 py-1 bg-[#ecfdf5] text-[#059669] rounded-full text-xs font-medium">
                      Confirme
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CalendarIcon className="w-5 h-5 text-[#94a3b8]" />
                  <div>
                    <div className="text-sm text-[#64748b]">Cree le</div>
                    <div className="font-medium text-[#0f172a]">
                      {formatDate(selectedAppointment.created_at || selectedAppointment.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
