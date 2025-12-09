import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

// SVG Icons
const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
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

const Trash2Icon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

interface SettingsPageProps {
  renderNotificationBell: () => React.ReactNode
}

export default function SettingsPage({
  renderNotificationBell
}: SettingsPageProps) {
  const { user } = useAuth()

  const [settingsForm, setSettingsForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: ''
  })

  useEffect(() => {
    if (user) {
      setSettingsForm({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        entreprise: user.entreprise || ''
      })
    }
  }, [user])

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettingsForm(prev => ({ ...prev, [name]: value }))
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <motion.div
      key="settings"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-[30px]">
        <div>
          <h1 className="text-[1.8rem] text-[#0f172a] mb-1 font-bold tracking-tight">Parametres</h1>
          <p className="text-[#64748b]">Gerez votre compte et vos preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {renderNotificationBell()}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-[1.1rem] text-[#0f172a] mb-5 font-semibold">Informations personnelles</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-prenom" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Prenom
                  </label>
                  <input
                    type="text"
                    id="settings-prenom"
                    name="prenom"
                    autoComplete="given-name"
                    value={settingsForm.prenom}
                    onChange={handleSettingsChange}
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  />
                </div>
                <div>
                  <label htmlFor="settings-nom" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="settings-nom"
                    name="nom"
                    autoComplete="family-name"
                    value={settingsForm.nom}
                    onChange={handleSettingsChange}
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="settings-email" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="settings-email"
                  name="email"
                  autoComplete="email"
                  value={settingsForm.email}
                  onChange={handleSettingsChange}
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] bg-[#f1f5f9] text-[#64748b] cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="settings-telephone" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Telephone
                </label>
                <input
                  type="tel"
                  id="settings-telephone"
                  name="telephone"
                  autoComplete="tel"
                  value={settingsForm.telephone}
                  onChange={handleSettingsChange}
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                />
              </div>
              <div>
                <label htmlFor="settings-entreprise" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  id="settings-entreprise"
                  name="entreprise"
                  autoComplete="organization"
                  value={settingsForm.entreprise}
                  onChange={handleSettingsChange}
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#0f172a] text-white border-none rounded-[10px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#1e293b] hover:-translate-y-px hover:shadow-[0_5px_20px_rgba(15,23,42,0.2)] mt-2">
                <SaveIcon className="w-4 h-4" />
                Sauvegarder les modifications
              </button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-[1.1rem] text-[#0f172a] mb-5 font-semibold">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#f1f5f9]">
                <div>
                  <div className="font-medium text-[#0f172a]">Notifications par email</div>
                  <p className="text-sm text-[#64748b]">Recevoir un email a chaque RDV confirme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#f1f5f9]">
                <div>
                  <div className="font-medium text-[#0f172a]">Notifications SMS</div>
                  <p className="text-sm text-[#64748b]">Recevoir un SMS pour les appels urgents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#f1f5f9]">
                <div>
                  <div className="font-medium text-[#0f172a]">Rappels automatiques</div>
                  <p className="text-sm text-[#64748b]">Recevoir un rappel 24h avant un RDV</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-[#0f172a]">Resume hebdomadaire</div>
                  <p className="text-sm text-[#64748b]">Recevoir un resume de vos appels chaque semaine</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-[1.1rem] text-[#0f172a] mb-5 font-semibold">Securite</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="current-password" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="current-password"
                  name="current-password"
                  autoComplete="current-password"
                  placeholder="********"
                  className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-password" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="Nouveau mot de passe"
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-[0.9rem] font-medium text-[#374151] mb-2">
                    Confirmer
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    autoComplete="new-password"
                    placeholder="Confirmer"
                    className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[10px] text-[0.95rem] transition-all duration-200 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-[#94a3b8]"
                  />
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#475569] text-white border-none rounded-[10px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#334155]">
                <LockIcon className="w-4 h-4" />
                Changer le mot de passe
              </button>
            </div>
          </motion.div>

          {/* Subscription */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-[1.1rem] text-[#0f172a] mb-5 font-semibold">Abonnement</h3>
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-[#f0f9ff] to-[#ecfdf5] rounded-xl border border-[#e2e8f0] mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[1.2rem] font-bold text-[#0f172a] capitalize">{user?.plan}</span>
                <span className="text-[0.9rem] text-[#64748b]">{user?.creditsAppels} credits restants</span>
              </div>
              <button className="py-2.5 px-5 bg-[#0f172a] text-white border-none rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-[#1e293b]">
                Changer de forfait
              </button>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#10b981] text-white border-none rounded-xl font-medium cursor-pointer transition-all duration-200 hover:bg-[#059669]">
                <PlusIcon className="w-4 h-4" />
                Acheter des credits
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#374151] border border-[#e2e8f0] rounded-xl font-medium cursor-pointer transition-all duration-200 hover:bg-[#f8fafc]">
                <FileTextIcon className="w-4 h-4" />
                Voir les factures
              </button>
            </div>
          </motion.div>
        </div>

        {/* Data Export */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-[1.1rem] text-[#0f172a] mb-4 font-semibold">Export des donnees</h3>
          <p className="text-[#64748b] mb-4">
            Telechargez une copie de toutes vos donnees (appels, RDV, transcriptions).
          </p>
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#374151] border border-[#e2e8f0] rounded-xl font-medium cursor-pointer transition-all duration-200 hover:bg-[#f8fafc]">
              <DownloadIcon className="w-4 h-4" />
              Exporter en CSV
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#374151] border border-[#e2e8f0] rounded-xl font-medium cursor-pointer transition-all duration-200 hover:bg-[#f8fafc]">
              <FileTextIcon className="w-4 h-4" />
              Exporter en PDF
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="bg-white rounded-2xl p-6 border border-[#fecaca]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-[1.1rem] text-[#0f172a] mb-4 font-semibold">Zone de danger</h3>
          <div className="flex items-center justify-between p-5 bg-[#fef2f2] rounded-xl border border-[#fecaca]">
            <div>
              <strong className="text-[#dc2626] block mb-1">Supprimer mon compte</strong>
              <p className="text-[0.85rem] text-[#64748b] m-0">Cette action est irreversible. Toutes vos donnees seront supprimees.</p>
            </div>
            <button className="py-2.5 px-5 bg-white text-[#dc2626] border border-[#fecaca] rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626] flex items-center gap-2">
              <Trash2Icon className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
