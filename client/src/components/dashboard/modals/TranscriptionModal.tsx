import { motion } from 'framer-motion'

// SVG Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const VolumeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)

interface Call {
  id: string
  call_sid?: string
  client_prenom?: string
  client_nom?: string
  clientPrenom?: string
  clientNom?: string
  entreprise: string
  status: string
  rdv_details?: string
  rdvDetails?: string
  transcription?: string
  duree?: number
  recording_url?: string
  recording_sid?: string
}

interface TranscriptionModalProps {
  call: Call | null
  onClose: () => void
}

export default function TranscriptionModal({
  call,
  onClose
}: TranscriptionModalProps) {
  if (!call) return null

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

  return (
    <motion.div
      className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-[20px] w-full max-w-[700px] max-h-[90vh] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
          <h2 className="text-[1.3rem] font-bold text-[#0f172a]">Transcription de l'appel</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Call Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-[0.85rem] text-[#64748b] mb-1">Client</div>
              <div className="font-medium text-[#0f172a]">
                {call.client_prenom || call.clientPrenom} {call.client_nom || call.clientNom}
              </div>
            </div>
            <div>
              <div className="text-[0.85rem] text-[#64748b] mb-1">Entreprise</div>
              <div className="font-medium text-[#0f172a]">{call.entreprise}</div>
            </div>
            <div>
              <div className="text-[0.85rem] text-[#64748b] mb-1">Statut</div>
              {getStatusBadge(call.status)}
            </div>
            {call.duree && (
              <div>
                <div className="text-[0.85rem] text-[#64748b] mb-1">Duree</div>
                <div className="font-medium text-[#0f172a]">{call.duree}s</div>
              </div>
            )}
          </div>

          {/* Audio Player */}
          {call.recording_url && call.call_sid && (
            <div className="mb-6 p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center gap-2 mb-3 text-[#374151]">
                <VolumeIcon className="w-5 h-5" />
                <span className="font-medium">Enregistrement de l'appel</span>
              </div>
              <audio
                controls
                className="w-full"
                src={`/api/recording-audio/${call.call_sid}?token=${localStorage.getItem('token')}`}
              >
                Votre navigateur ne supporte pas l'element audio.
              </audio>
            </div>
          )}

          {/* Transcription */}
          <div>
            <h3 className="text-[0.85rem] font-semibold text-[#64748b] mb-4 uppercase tracking-wider">Transcription</h3>
            <div className="bg-[#f8fafc] rounded-xl p-4 space-y-3 border border-[#e2e8f0]">
              {call.transcription ? (
                call.transcription.split('\n').map((line, i) => {
                  let bgClass = 'bg-white'
                  let textClass = 'text-[#374151]'

                  if (line.startsWith('[IA]')) {
                    bgClass = 'bg-[#f0f9ff]'
                    textClass = 'text-[#1e40af]'
                  } else if (line.startsWith('[Receptionniste]')) {
                    bgClass = 'bg-[#ecfdf5]'
                    textClass = 'text-[#065f46]'
                  }

                  return (
                    <p key={i} className={`p-3 rounded-lg ${bgClass} ${textClass} border border-[#e2e8f0]`}>
                      {line}
                    </p>
                  )
                })
              ) : (
                <p className="text-center text-[#64748b] py-8">
                  Aucune transcription disponible pour cet appel.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-white text-[#374151] border border-[#e2e8f0] rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9]"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
