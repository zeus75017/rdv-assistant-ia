import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

// SVG Icons
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
)

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
)

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
)

interface Stats {
  totalAppels: number
  rdvConfirmes: number
  appelsEnCours: number
  echecs: number
  aRappeler: number
}

interface CreditStats {
  totalUsed: number
  totalAdded: number
  totalCalls: number
  currentBalance: number
}

interface Call {
  id: string
  client_prenom?: string
  client_nom?: string
  clientPrenom?: string
  clientNom?: string
  entreprise: string
  status: string
  created_at?: string
  createdAt?: string
}

interface CreditsPageProps {
  stats: Stats | null
  creditStats: CreditStats | null
  calls: Call[]
  onNewCall: () => void
  renderNotificationBell: () => React.ReactNode
}

export default function CreditsPage({
  stats,
  creditStats,
  calls,
  onNewCall,
  renderNotificationBell
}: CreditsPageProps) {
  const { user } = useAuth()

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
      en_cours: { label: 'En cours', className: 'bg-[#fef3c7] text-[#d97706]' },
      succes: { label: 'RDV confirme', className: 'bg-[#ecfdf5] text-[#059669]' },
      echec: { label: 'Echec', className: 'bg-[#fef2f2] text-[#dc2626]' },
      rappeler: { label: 'A rappeler', className: 'bg-[#fff7ed] text-[#ea580c]' },
      confirme: { label: 'Confirme', className: 'bg-[#ecfdf5] text-[#059669]' }
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
      key="credits"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Historique des credits</h1>
          <p className="text-[#64748b]">Suivez votre consommation de credits</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {renderNotificationBell()}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-[30px]">
        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-purple-100 rounded-[14px] flex items-center justify-center text-purple-600">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{creditStats?.currentBalance || user?.creditsAppels}</div>
            <div className="text-[#64748b] text-[0.9rem]">Credits restants</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#fef2f2] rounded-[14px] flex items-center justify-center text-[#dc2626]">
            <ArrowUpIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{calls.filter(c => c.status !== 'en_cours').length}</div>
            <div className="text-[#64748b] text-[0.9rem]">Credits utilises</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#ecfdf5] rounded-[14px] flex items-center justify-center text-[#10b981]">
            <ArrowDownIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{creditStats?.totalAdded || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">Credits ajoutes</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#f0f9ff] rounded-[14px] flex items-center justify-center text-[#3b82f6]">
            <PhoneIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{stats?.totalAppels || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">Appels effectues</div>
          </div>
        </motion.div>
      </div>

      {/* Transactions History */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-[1.2rem] text-[#0f172a] mb-5 font-semibold">Historique des transactions</h2>
        {calls.length === 0 ? (
          <div className="text-center py-[60px] text-[#64748b]">
            <ClockIcon className="w-12 h-12 mx-auto mb-5 opacity-40" />
            <p className="mb-5">Aucune transaction pour le moment</p>
            <button
              onClick={onNewCall}
              className="py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#1e293b]"
            >
              Lancer un appel
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Type</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Client</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden sm:table-cell">Entreprise</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Credits</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call, index) => (
                  <motion.tr
                    key={call.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        call.status === 'completed' || call.status === 'succes' || call.status === 'echec'
                          ? 'bg-[#fef2f2] text-[#dc2626]'
                          : 'bg-[#fef3c7] text-[#d97706]'
                      }`}>
                        {call.status === 'completed' || call.status === 'succes' || call.status === 'echec' ? 'Utilise' : 'En cours'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-[#0f172a] border-b border-[#f1f5f9]">
                      {call.client_prenom || call.clientPrenom} {call.client_nom || call.clientNom}
                    </td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden sm:table-cell">{call.entreprise || '-'}</td>
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">{getStatusBadge(call.status)}</td>
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">
                      <span className={`font-semibold ${call.status === 'en_cours' ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                        {call.status === 'en_cours' ? '0' : '-1'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden md:table-cell">
                      {formatDate(call.created_at || call.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
