import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'

// SVG Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

interface Stats {
  totalAppels: number
  rdvConfirmes: number
  appelsEnCours: number
  echecs: number
  aRappeler: number
}

interface WeeklyStats {
  name: string
  date: string
  total: number
  succes: number
  echecs: number
}

interface Call {
  id: string
  client_prenom?: string
  client_nom?: string
  clientPrenom?: string
  clientNom?: string
  entreprise: string
  motif: string
  status: string
  created_at?: string
  createdAt?: string
}

interface DashboardHomeProps {
  stats: Stats | null
  weeklyStats: WeeklyStats[]
  successRate: number
  calls: Call[]
  onNewCall: () => void
  onViewTranscription: (call: Call) => void
  renderNotificationBell: () => React.ReactNode
}

export default function DashboardHome({
  stats,
  weeklyStats,
  successRate,
  calls,
  onNewCall,
  onViewTranscription,
  renderNotificationBell
}: DashboardHomeProps) {
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
      key="dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Bonjour, {user?.prenom} !</h1>
          <p className="text-[#64748b]">Voici un apercu de votre activite</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onNewCall}
            className="flex items-center gap-2 py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#1e293b] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.2)]"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvel appel
          </button>
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
          <div className="w-14 h-14 bg-[#f1f5f9] rounded-[14px] flex items-center justify-center text-[#3b82f6]">
            <PhoneIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{stats?.totalAppels || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">Total appels</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#ecfdf5] rounded-[14px] flex items-center justify-center text-[#10b981]">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{stats?.rdvConfirmes || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">RDV confirmes</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#fef3c7] rounded-[14px] flex items-center justify-center text-[#f59e0b]">
            <AlertTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{stats?.aRappeler || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">A rappeler</div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-[#e2e8f0] transition-all duration-200 hover:border-[#3b82f6] hover:shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-14 h-14 bg-[#f0f9ff] rounded-[14px] flex items-center justify-center text-[#0ea5e9]">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[2rem] font-bold text-[#0f172a]">{user?.creditsAppels || 0}</div>
            <div className="text-[#64748b] text-[0.9rem]">Credits restants</div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-[30px]">
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-[1rem] text-[#0f172a] mb-5 font-semibold">Appels cette semaine</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="succes" fill="#10b981" radius={[4, 4, 0, 0]} name="Succes" />
              <Bar dataKey="echecs" fill="#ef4444" radius={[4, 4, 0, 0]} name="Echecs" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-[1rem] text-[#0f172a] mb-5 font-semibold">Taux de succes</h3>
          <div className="text-center mb-5">
            <div className="relative w-[120px] h-[120px] mx-auto mb-2.5">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${successRate}, 100`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[1.8rem] font-bold text-[#0f172a]">{successRate}%</span>
              </div>
            </div>
            <p className="text-[#64748b] text-[0.9rem]">de RDV confirmes</p>
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
              <span className="text-sm text-[#374151]">Succes: {stats?.rdvConfirmes || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
              <span className="text-sm text-[#374151]">Echecs: {stats?.echecs || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Calls */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-[1.2rem] text-[#0f172a] mb-5 font-semibold">Appels recents</h2>
        {calls.length === 0 ? (
          <div className="text-center py-[60px] text-[#64748b]">
            <PhoneIcon className="w-12 h-12 mx-auto mb-5 opacity-40" />
            <p className="mb-5">Aucun appel pour le moment</p>
            <button
              onClick={onNewCall}
              className="py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#1e293b]"
            >
              Lancer mon premier appel
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Client</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden sm:table-cell">Entreprise</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden md:table-cell">Motif</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.slice(0, 5).map(call => (
                  <motion.tr
                    key={call.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9]">
                      {call.client_prenom || call.clientPrenom} {call.client_nom || call.clientNom}
                    </td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden sm:table-cell">{call.entreprise || '-'}</td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden md:table-cell">{call.motif}</td>
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">{getStatusBadge(call.status)}</td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden lg:table-cell">{formatDate(call.created_at || call.createdAt)}</td>
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">
                      <button
                        onClick={() => onViewTranscription(call)}
                        className="p-2 bg-[#f1f5f9] border-none rounded-lg text-[#64748b] cursor-pointer transition-all duration-200 hover:bg-[#3b82f6] hover:text-white"
                        title="Voir la transcription"
                      >
                        <FileTextIcon className="w-4 h-4" />
                      </button>
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
