import { motion } from 'framer-motion'

// SVG Icons
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

interface Call {
  id: string
  client_prenom?: string
  client_nom?: string
  clientPrenom?: string
  clientNom?: string
  entreprise: string
  numero_entreprise?: string
  numeroEntreprise?: string
  motif: string
  status: string
  rdv_details?: string
  rdvDetails?: string
  created_at?: string
  createdAt?: string
}

interface CallsHistoryProps {
  calls: Call[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
  onNewCall: () => void
  onViewTranscription: (call: Call) => void
  renderNotificationBell: () => React.ReactNode
}

export default function CallsHistory({
  calls,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onNewCall,
  onViewTranscription,
  renderNotificationBell
}: CallsHistoryProps) {
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
      key="calls"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Historique des appels</h1>
          <p className="text-[#64748b]">Consultez tous vos appels passes</p>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex-1 flex items-center gap-2.5 py-3 px-4 bg-white border border-[#e2e8f0] rounded-[10px]">
          <SearchIcon className="w-5 h-5 text-[#94a3b8]" />
          <input
            type="search"
            placeholder="Rechercher par nom, entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none outline-none text-[0.95rem] text-[#0f172a] placeholder:text-[#94a3b8] bg-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-3 px-4 border border-[#e2e8f0] rounded-[10px] bg-white text-[0.95rem] text-[#0f172a] cursor-pointer min-w-[180px] focus:outline-none focus:border-[#3b82f6]"
        >
          <option value="all">Tous les statuts</option>
          <option value="en_cours">En cours</option>
          <option value="succes">Succes</option>
          <option value="echec">Echec</option>
          <option value="rappeler">A rappeler</option>
        </select>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0]">
        {calls.length === 0 ? (
          <div className="text-center py-[60px] text-[#64748b]">
            <PhoneIcon className="w-12 h-12 mx-auto mb-5 opacity-40" />
            <p className="mb-5">Aucun appel trouve</p>
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
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden md:table-cell">Numero</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden lg:table-cell">Motif</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden xl:table-cell">RDV</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="text-left py-3 px-3 text-[#64748b] font-medium text-[0.85rem] border-b border-[#e2e8f0] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
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
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden md:table-cell">{call.numero_entreprise || call.numeroEntreprise || '-'}</td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden lg:table-cell">{call.motif}</td>
                    <td className="py-4 px-3 border-b border-[#f1f5f9]">{getStatusBadge(call.status)}</td>
                    <td className="py-4 px-3 text-[#374151] border-b border-[#f1f5f9] hidden xl:table-cell max-w-[200px] truncate">
                      {call.rdv_details || call.rdvDetails || '-'}
                    </td>
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
      </div>
    </motion.div>
  )
}
