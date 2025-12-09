import { motion } from 'framer-motion'

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
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
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
  status: string
  created_at?: string
  createdAt?: string
}

interface AppointmentsProps {
  appointments: Appointment[]
  onNewCall: () => void
  renderNotificationBell: () => React.ReactNode
}

export default function Appointments({
  appointments,
  onNewCall,
  renderNotificationBell
}: AppointmentsProps) {
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      confirme: { label: 'Confirme', className: 'bg-[#ecfdf5] text-[#059669]' },
      succes: { label: 'Confirme', className: 'bg-[#ecfdf5] text-[#059669]' },
      en_attente: { label: 'En attente', className: 'bg-[#fef3c7] text-[#d97706]' }
    }
    const { label, className } = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' }
    return <span className={`px-3 py-1 rounded-full text-[0.8rem] font-medium ${className}`}>{label}</span>
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <motion.div
      key="appointments"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Mes rendez-vous</h1>
          <p className="text-[#64748b]">Tous vos rendez-vous confirmes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {renderNotificationBell()}
          </div>
        </div>
      </header>

      {/* Appointments Grid */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] text-center py-[60px] text-[#64748b]">
          <CalendarIcon className="w-12 h-12 mx-auto mb-5 opacity-40" />
          <p className="mb-5">Aucun rendez-vous pour le moment</p>
          <button
            onClick={onNewCall}
            className="py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#1e293b]"
          >
            Planifier un rendez-vous
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-5 transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)] cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#f0f9ff] rounded-[10px] flex items-center justify-center text-[#3b82f6]">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                {getStatusBadge(apt.status)}
              </div>

              <h3 className="text-[1.1rem] text-[#0f172a] mb-1 font-semibold">
                {apt.client_prenom || apt.clientPrenom} {apt.client_nom || apt.clientNom}
              </h3>
              <p className="text-[#64748b] text-[0.9rem] mb-4">{apt.entreprise}</p>

              <div className="flex items-center gap-2 text-[#3b82f6] text-[0.9rem] font-medium mb-3">
                <ClockIcon className="w-4 h-4" />
                <span>{apt.rdv_details || apt.rdvDetails || 'Horaire a confirmer'}</span>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] text-[0.8rem] text-[#94a3b8]">
                Cree le {formatDate(apt.created_at || apt.createdAt)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
