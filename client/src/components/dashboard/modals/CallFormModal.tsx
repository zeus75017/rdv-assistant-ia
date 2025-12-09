import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

// SVG Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

interface CallFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  token: string | null
}

export default function CallFormModal({
  isOpen,
  onClose,
  onSuccess,
  token
}: CallFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [callForm, setCallForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    entreprise: '',
    numero_entreprise: '',
    motif: 'consultation',
    details: '',
    disponibilites: ''
  })

  const handleCallFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCallForm(prev => ({ ...prev, [name]: value }))
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.startsWith('0')) {
      return '+33' + numbers.slice(1)
    }
    return numbers.startsWith('+') ? value : '+33' + numbers
  }

  const handleSubmitCall = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/make-call', {
        ...callForm,
        numero_entreprise: formatPhone(callForm.numero_entreprise)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setCallForm({
          prenom: '',
          nom: '',
          telephone: '',
          entreprise: '',
          numero_entreprise: '',
          motif: 'consultation',
          details: '',
          disponibilites: ''
        })
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors du lancement de l\'appel')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-[20px] w-full max-w-[600px] max-h-[90vh] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0]">
          <h2 className="text-[1.3rem] font-bold text-[#0f172a]">Nouvel appel</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        <form onSubmit={handleSubmitCall} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Client Info */}
          <div className="mb-6">
            <h3 className="text-[0.85rem] font-semibold text-[#64748b] mb-4 uppercase tracking-wider">Informations client</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="call-prenom" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Prenom
                  </label>
                  <input
                    type="text"
                    id="call-prenom"
                    name="prenom"
                    autoComplete="off"
                    value={callForm.prenom}
                    onChange={handleCallFormChange}
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="call-nom" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="call-nom"
                    name="nom"
                    autoComplete="off"
                    value={callForm.nom}
                    onChange={handleCallFormChange}
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="call-telephone" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Telephone du client
                </label>
                <input
                  type="tel"
                  id="call-telephone"
                  name="telephone"
                  autoComplete="off"
                  value={callForm.telephone}
                  onChange={handleCallFormChange}
                  placeholder="06 12 34 56 78"
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                />
              </div>
            </div>
          </div>

          {/* Establishment Info */}
          <div className="mb-6">
            <h3 className="text-[0.85rem] font-semibold text-[#64748b] mb-4 uppercase tracking-wider">Etablissement a appeler</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="call-entreprise" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Nom de l'etablissement
                </label>
                <input
                  type="text"
                  id="call-entreprise"
                  name="entreprise"
                  autoComplete="off"
                  value={callForm.entreprise}
                  onChange={handleCallFormChange}
                  placeholder="Cabinet dentaire, etc."
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                  required
                />
              </div>
              <div>
                <label htmlFor="call-numero" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Numero de telephone
                </label>
                <input
                  type="tel"
                  id="call-numero"
                  name="numero_entreprise"
                  autoComplete="off"
                  value={callForm.numero_entreprise}
                  onChange={handleCallFormChange}
                  placeholder="01 23 45 67 89"
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mb-6">
            <h3 className="text-[0.85rem] font-semibold text-[#64748b] mb-4 uppercase tracking-wider">Details du rendez-vous</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="call-motif" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Motif
                </label>
                <select
                  id="call-motif"
                  name="motif"
                  value={callForm.motif}
                  onChange={handleCallFormChange}
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] bg-white cursor-pointer"
                >
                  <option value="consultation">Consultation</option>
                  <option value="suivi">Visite de suivi</option>
                  <option value="urgence">Urgence</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="call-details" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Details supplementaires
                </label>
                <textarea
                  id="call-details"
                  name="details"
                  value={callForm.details}
                  onChange={handleCallFormChange}
                  placeholder="Informations complementaires..."
                  rows={3}
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8] resize-none"
                />
              </div>
              <div>
                <label htmlFor="call-disponibilites" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Disponibilites
                </label>
                <input
                  type="text"
                  id="call-disponibilites"
                  name="disponibilites"
                  autoComplete="off"
                  value={callForm.disponibilites}
                  onChange={handleCallFormChange}
                  placeholder="Lundi matin, mardi apres-midi..."
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                  required
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex gap-3 p-6 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-white text-[#374151] border border-[#e2e8f0] rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9]"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmitCall}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Lancer l\'appel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
