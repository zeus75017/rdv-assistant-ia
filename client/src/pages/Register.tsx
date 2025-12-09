import { useState } from 'react'
import { Link, useLocation, useSearch } from 'wouter'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

// Animation variants
const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export default function Register() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  const defaultPlan = params.get('plan') || 'pro'

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    password: '',
    plan: defaultPlan
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const [, setLocation] = useLocation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 10)
    let formatted = ''
    for (let i = 0; i < numbers.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += ' '
      formatted += numbers[i]
    }
    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, telephone: formatPhone(e.target.value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      await register({
        ...formData,
        telephone: formData.telephone.replace(/\s/g, '')
      })
      setLocation('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    { id: 'starter', name: 'Starter', price: '9' },
    { id: 'pro', name: 'Pro', price: '29' },
    { id: 'business', name: 'Business', price: '99' }
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Dark */}
      <motion.div
        className="hidden lg:flex flex-1 bg-[#0f172a] p-[60px] items-center justify-center relative overflow-hidden"
        variants={fadeInLeft}
        initial="hidden"
        animate="visible"
      >
        {/* Background gradient effects */}
        <div className="absolute inset-0" style={{background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'}}></div>

        <motion.div
          className="relative z-10 text-white max-w-[420px]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-[2.5rem] font-bold mb-5 tracking-[-0.02em] whitespace-nowrap"
            variants={fadeInUp}
          >
            Rejoignez Rendevo 🚀
          </motion.h1>
          <motion.p
            className="text-[1.1rem] text-slate-400 leading-[1.7] mb-10"
            variants={fadeInUp}
          >
            Plus de 2 500 professionnels font confiance à notre IA pour automatiser leurs prises de rendez-vous.
          </motion.p>

          <motion.div className="flex flex-col gap-5" variants={staggerContainer}>
            <motion.div
              className="flex items-center gap-4 text-slate-300"
              variants={fadeInUp}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <div className="w-11 h-11 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <span>Configuration en 5 minutes</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4 text-slate-300"
              variants={fadeInUp}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <div className="w-11 h-11 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Données sécurisées et chiffrées</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4 text-slate-300"
              variants={fadeInUp}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <div className="w-11 h-11 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <span>Essai gratuit 14 jours</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4 text-slate-300"
              variants={fadeInUp}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <div className="w-11 h-11 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
              <span>Support client 7j/7</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4 mt-[50px]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="bg-white/5 border border-white/10 rounded-xl p-5"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <div className="text-[2rem] font-bold text-white mb-1">+2500</div>
              <div className="text-slate-500 text-[0.85rem]">Utilisateurs actifs</div>
            </motion.div>
            <motion.div
              className="bg-white/5 border border-white/10 rounded-xl p-5"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <div className="text-[2rem] font-bold text-white mb-1">50k+</div>
              <div className="text-slate-500 text-[0.85rem]">RDV pris ce mois</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Light */}
      <motion.div
        className="flex-1 p-8 lg:py-10 lg:px-[60px] flex flex-col overflow-y-auto bg-[#fafbfc]"
        variants={fadeInRight}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-2.5 mb-10 no-underline">
            <div className="w-[42px] h-[42px] bg-[#0f172a] rounded-[10px] flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </div>
            <span className="text-[1.5rem] font-bold text-[#0f172a]">Rendevo</span>
          </Link>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center max-w-[420px]">
          <motion.h2
            className="text-[1.8rem] text-[#0f172a] mb-2.5 font-bold tracking-[-0.02em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Créer votre compte
          </motion.h2>
          <motion.p
            className="text-slate-500 mb-[30px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Commencez votre essai gratuit de 14 jours
          </motion.p>

          {error && (
            <motion.div
              className="bg-red-50 text-red-600 px-4 py-3 rounded-[10px] mb-5 text-[0.9rem] border border-red-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex gap-4 mb-4" variants={fadeInUp}>
              <div className="flex-1">
                <label htmlFor="prenom" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="nom" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                  required
                />
              </div>
            </motion.div>

            <motion.div className="mb-4" variants={fadeInUp}>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                Email professionnel
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean@entreprise.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                required
              />
            </motion.div>

            <motion.div className="mb-4" variants={fadeInUp}>
              <label htmlFor="telephone" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handlePhoneChange}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                required
              />
            </motion.div>

            <motion.div className="mb-4" variants={fadeInUp}>
              <label htmlFor="entreprise" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                id="entreprise"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                placeholder="Ma Société"
                className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                required
              />
            </motion.div>

            <motion.div className="mb-4" variants={fadeInUp}>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-[0.9rem]">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8 caractères minimum"
                className="w-full px-4 py-3 border border-slate-200 rounded-[10px] text-[0.95rem] transition-all bg-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-slate-400"
                required
              />
            </motion.div>

            <motion.div className="mb-6" variants={fadeInUp}>
              <label className="block text-gray-700 font-medium mb-3 text-[0.9rem]">
                Choisissez votre forfait
              </label>
              <div className="flex gap-2.5">
                {plans.map((plan, index) => (
                  <motion.label
                    key={plan.id}
                    className={`flex-1 py-4 px-3 border rounded-xl cursor-pointer transition-all text-center bg-white ${
                      formData.plan === plan.id
                        ? 'border-blue-500 bg-[#f0f9ff] shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                        : 'border-slate-200 hover:border-blue-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                      className="hidden"
                    />
                    <div className="font-semibold text-[#0f172a] mb-1 text-[0.95rem]">{plan.name}</div>
                    <div className="text-blue-500 font-bold text-[1.1rem]">
                      {plan.price}€<span className="text-[0.8rem] font-normal text-slate-500">/mois</span>
                    </div>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full py-4 bg-[#0f172a] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all flex items-center justify-center min-h-[54px] hover:bg-slate-800 hover:shadow-[0_10px_30px_rgba(15,23,42,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Créer mon compte gratuitement'}
            </motion.button>
          </motion.form>

          <motion.div
            className="flex items-center my-[25px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-slate-400 text-[0.9rem]">ou</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </motion.div>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              type="button"
              className="flex-1 py-3.5 border border-slate-200 rounded-[10px] bg-white cursor-pointer flex items-center justify-center gap-2.5 text-[0.95rem] font-medium text-gray-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </motion.button>
            <motion.button
              type="button"
              className="flex-1 py-3.5 border border-slate-200 rounded-[10px] bg-white cursor-pointer flex items-center justify-center gap-2.5 text-[0.95rem] font-medium text-gray-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </motion.button>
          </motion.div>

          <motion.p
            className="text-center mt-[25px] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-500 font-semibold no-underline hover:underline">
              Se connecter
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
