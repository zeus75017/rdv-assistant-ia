import { useEffect } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function Home() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Rendevo - Assistant IA de prise de RDV'
  }, [])

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Navigation */}
      <motion.nav
        className="flex items-center justify-between px-5 md:px-12 py-4 bg-white border-b border-[#e8eaed] sticky top-0 z-[100]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[38px] h-[38px] bg-[#0f172a] rounded-[10px] flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <span className="text-[1.4rem] font-bold text-[#0f172a]">Rendevo</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-500 text-[0.95rem] font-medium no-underline hover:text-[#0f172a] transition-colors">Fonctionnalités</a>
          <a href="#how" className="text-slate-500 text-[0.95rem] font-medium no-underline hover:text-[#0f172a] transition-colors">Comment ça marche</a>
          <a href="#pricing" className="text-slate-500 text-[0.95rem] font-medium no-underline hover:text-[#0f172a] transition-colors">Tarifs</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard" className="px-5 py-2.5 bg-[#0f172a] text-white font-medium no-underline rounded-lg hover:bg-slate-800 transition-all">
                Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login" className="hidden sm:block px-5 py-2.5 text-[#0f172a] font-medium no-underline rounded-lg hover:bg-slate-100 transition-colors">Se connecter</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register" className="px-5 py-2.5 bg-[#0f172a] text-white font-medium no-underline rounded-lg hover:bg-slate-800 transition-all">
                  Commencer gratuitement
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] py-[80px] px-5 md:px-12 max-w-[1400px] mx-auto items-center">
        {/* Hero Content */}
        <motion.div
          className="max-w-[560px]"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-[14px] py-1.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-[100px] text-[#059669] text-[0.85rem] font-medium mb-6"
            variants={fadeInUp}
          >
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
            Nouveau : IA conversationnelle avancée
          </motion.div>
          <motion.h1
            className="text-[3.2rem] font-bold leading-[1.15] text-[#0f172a] mb-5 tracking-[-0.02em]"
            variants={fadeInUp}
          >
            L'assistant qui prend vos{' '}
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#10b981] bg-clip-text text-transparent">rendez-vous</span>
            {' '}à votre place
          </motion.h1>
          <motion.p
            className="text-[1.15rem] text-[#64748b] leading-[1.7] mb-8"
            variants={fadeInUp}
          >
            Rendevo appelle les professionnels pour vous et négocie le meilleur créneau.
            Gagnez des heures chaque semaine.
          </motion.p>
          <motion.div className="flex gap-4 mb-10" variants={fadeInUp}>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="inline-flex items-center gap-2 px-7 py-[14px] bg-[#0f172a] text-white font-semibold no-underline rounded-[10px] hover:bg-[#1e293b] hover:shadow-[0_10px_30px_rgba(15,23,42,0.2)] transition-all">
                Essayer gratuitement
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </motion.div>
            <motion.button
              className="inline-flex items-center gap-2 px-7 py-[14px] bg-white text-[#0f172a] font-semibold border border-[#e2e8f0] rounded-[10px] cursor-pointer hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Voir la démo
            </motion.button>
          </motion.div>
          <motion.div className="flex items-center gap-3" variants={fadeInUp}>
            <div className="flex">
              <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-[0.75rem] font-semibold border-2 border-white">JD</div>
              <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-white text-[0.75rem] font-semibold border-2 border-white -ml-2.5">ML</div>
              <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-[0.75rem] font-semibold border-2 border-white -ml-2.5">AS</div>
              <div className="w-9 h-9 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-[0.75rem] font-semibold border-2 border-white -ml-2.5">PK</div>
            </div>
            <span className="text-[#64748b] text-[0.9rem]">+2,500 professionnels nous font confiance</span>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Dashboard Preview */}
        <motion.div
          className="relative w-full"
          initial="hidden"
          animate="visible"
          variants={fadeInRight}
        >
          <div className="bg-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Dashboard Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-slate-500 text-[0.85rem] font-medium">Dashboard Rendevo</span>
            </div>

            {/* Dashboard Content */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="text-[0.8rem] text-slate-500 font-medium uppercase tracking-wider mb-2">Appels ce mois</div>
                <div className="text-[2rem] font-bold text-[#0f172a]">47</div>
                <div className="flex items-center gap-1 text-emerald-500 text-[0.85rem] font-medium mt-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M23 6l-9.5 9.5-5-5L1 18"/>
                  </svg>
                  +23%
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <div className="text-[0.8rem] text-slate-500 font-medium uppercase tracking-wider mb-2">Taux de succès</div>
                <div className="text-[2rem] font-bold text-[#0f172a]">94%</div>
                <div className="h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{width: '94%'}}></div>
                </div>
              </div>

              <div className="sm:col-span-2 bg-slate-50 rounded-xl p-5">
                <div className="text-[0.8rem] text-slate-500 font-medium uppercase tracking-wider mb-3">Derniers appels</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium text-[#0f172a] text-[0.9rem]">Dr. Martin</div>
                      <div className="text-slate-400 text-[0.8rem]">Il y a 2 min</div>
                    </div>
                    <span className="bg-[#ecfdf5] text-[#059669] px-2.5 py-1 rounded-full text-xs font-medium">Confirmé</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium text-[#0f172a] text-[0.9rem]">Cabinet Durand</div>
                      <div className="text-slate-400 text-[0.8rem]">Il y a 15 min</div>
                    </div>
                    <span className="bg-[#ecfdf5] text-[#059669] px-2.5 py-1 rounded-full text-xs font-medium">Confirmé</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <div className="font-medium text-[#0f172a] text-[0.9rem]">Clinique St-Jean</div>
                      <div className="text-slate-400 text-[0.8rem]">Il y a 1h</div>
                    </div>
                    <span className="bg-[#fef3c7] text-[#d97706] px-2.5 py-1 rounded-full text-xs font-medium">En attente</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <div className="text-[0.8rem] text-slate-500 font-medium uppercase tracking-wider mb-2">Temps économisé</div>
                <div className="text-[2rem] font-bold text-[#0f172a]">12h</div>
                <div className="text-slate-400 text-[0.85rem] mt-1">cette semaine</div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <motion.div
            className="absolute -top-4 right-2.5 lg:-right-10 bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-4 py-3 flex items-center gap-2.5"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="text-[0.9rem] font-medium text-[#0f172a]">RDV confirmé pour 14h</span>
          </motion.div>
          <motion.div
            className="absolute -bottom-5 left-2.5 lg:-left-12 bg-white rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-4 py-3 flex items-center gap-2.5"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
            <span className="text-[0.9rem] font-medium text-[#0f172a]">Appel en cours...</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Logos Section */}
      <motion.section
        className="px-5 md:px-12 py-10 text-center border-t border-b border-[#e8eaed] bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <p className="text-slate-400 text-[0.9rem] mb-6">Ils utilisent Rendevo pour leurs rendez-vous</p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-[60px]">
          <div className="text-slate-300 font-semibold text-[1.2rem]">TechCorp</div>
          <div className="text-slate-300 font-semibold text-[1.2rem]">MediGroup</div>
          <div className="text-slate-300 font-semibold text-[1.2rem]">LegalPro</div>
          <div className="text-slate-300 font-semibold text-[1.2rem]">FinanceHub</div>
          <div className="text-slate-300 font-semibold text-[1.2rem]">ConsultCo</div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="px-5 md:px-12 py-16 md:py-[100px] max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-[60px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <span className="inline-block px-3.5 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[0.85rem] font-medium mb-4">Fonctionnalités</span>
          <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#0f172a] mb-4 tracking-[-0.02em]">Tout ce qu'il vous faut pour gagner du temps</h2>
          <p className="text-slate-500 text-[1.1rem] max-w-[600px] mx-auto">Une solution complète qui automatise vos prises de rendez-vous de A à Z</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">Configuration simple</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">Entrez les informations du rendez-vous souhaité et laissez l'IA faire le reste.</p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">Disponible 24h/24</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">Programmez vos demandes à tout moment, l'IA appelle aux heures d'ouverture.</p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">Conversation naturelle</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">L'IA parle français parfaitement et s'adapte à chaque interlocuteur.</p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">Synchronisation agenda</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">Vos rendez-vous sont automatiquement ajoutés à votre calendrier.</p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">Notifications temps réel</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">Soyez informé instantanément du résultat de chaque appel.</p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl border border-[#e8eaed] transition-all duration-300 hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1"
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-500 mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2.5">100% sécurisé</h3>
            <p className="text-slate-500 text-[0.95rem] leading-relaxed">Vos données sont chiffrées et protégées selon les normes RGPD.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="px-5 md:px-12 py-16 md:py-[100px] bg-white">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center mb-[60px]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <span className="inline-block px-3.5 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[0.85rem] font-medium mb-4">Comment ça marche</span>
            <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#0f172a] tracking-[-0.02em]">3 étapes pour ne plus jamais attendre au téléphone</h2>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-5">
            {/* Step 1 */}
            <motion.div
              className="flex-1 max-w-[320px] text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <div className="w-12 h-12 bg-[#0f172a] text-white rounded-full flex items-center justify-center text-[1.2rem] font-bold mx-auto mb-5">1</div>
              <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2">Renseignez les détails</h3>
              <p className="text-slate-500 text-[0.9rem] mb-5">Indiquez le nom du professionnel, le numéro et vos disponibilités.</p>
              <div className="bg-slate-50 rounded-xl p-5 min-h-[140px] flex items-center justify-center">
                <div className="w-full space-y-2">
                  <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 text-[0.85rem] text-slate-500 text-left">Dentiste Dr. Martin</div>
                  <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 text-[0.85rem] text-slate-500 text-left">01 23 45 67 89</div>
                  <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 text-[0.85rem] text-slate-500 text-left">Lundi ou Mardi matin</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="text-slate-300 rotate-90 lg:rotate-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="flex-1 max-w-[320px] text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-[#0f172a] text-white rounded-full flex items-center justify-center text-[1.2rem] font-bold mx-auto mb-5">2</div>
              <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2">L'IA passe l'appel</h3>
              <p className="text-slate-500 text-[0.9rem] mb-5">Notre assistant intelligent appelle et négocie le meilleur créneau pour vous.</p>
              <div className="bg-slate-50 rounded-xl p-5 min-h-[140px] flex items-center justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div className="w-[60px] h-[60px] bg-blue-500 rounded-full flex items-center justify-center text-white relative z-10">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="text-slate-300 rotate-90 lg:rotate-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="flex-1 max-w-[320px] text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-[#0f172a] text-white rounded-full flex items-center justify-center text-[1.2rem] font-bold mx-auto mb-5">3</div>
              <h3 className="text-[1.1rem] font-semibold text-[#0f172a] mb-2">RDV confirmé !</h3>
              <p className="text-slate-500 text-[0.9rem] mb-5">Recevez une notification avec tous les détails de votre rendez-vous.</p>
              <div className="bg-slate-50 rounded-xl p-5 min-h-[140px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-[60px] h-[60px] bg-[#ecfdf5] rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="font-semibold text-[#0f172a]">Mardi 14h - Dr. Martin</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-5 md:px-12 py-16 md:py-[100px] max-w-[1100px] mx-auto">
        <motion.div
          className="text-center mb-[60px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <span className="inline-block px-3.5 py-1.5 bg-slate-100 rounded-full text-slate-500 text-[0.85rem] font-medium mb-4">Tarifs</span>
          <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#0f172a] mb-4 tracking-[-0.02em]">Un prix adapté à chaque besoin</h2>
          <p className="text-slate-500 text-[1.1rem]">Sans engagement, annulez à tout moment</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Starter */}
          <motion.div
            className="bg-white border border-[#e8eaed] rounded-2xl p-8"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <h3 className="text-[1.3rem] font-semibold text-[#0f172a] mb-1">Starter</h3>
            <p className="text-slate-400 text-[0.9rem] mb-5">Pour les particuliers</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[3rem] font-bold text-[#0f172a]">9</span>
              <span className="text-[1.2rem] font-semibold text-[#0f172a]">€</span>
              <span className="text-slate-400">/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['20 appels par mois', 'Tableau de bord', 'Notifications email', 'Support email'].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-slate-600 text-[0.95rem]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register?plan=starter" className="block w-full text-center py-3.5 bg-slate-100 text-[#0f172a] font-semibold rounded-[10px] no-underline hover:bg-slate-200 transition-all">
                Commencer
              </Link>
            </motion.div>
          </motion.div>

          {/* Pro */}
          <motion.div
            className="bg-white border-2 border-blue-500 rounded-2xl p-8 relative shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-[0.8rem] font-semibold">
              Populaire
            </div>
            <h3 className="text-[1.3rem] font-semibold text-[#0f172a] mb-1">Pro</h3>
            <p className="text-slate-400 text-[0.9rem] mb-5">Pour les professionnels</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[3rem] font-bold text-[#0f172a]">29</span>
              <span className="text-[1.2rem] font-semibold text-[#0f172a]">€</span>
              <span className="text-slate-400">/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['100 appels par mois', 'Tableau de bord avancé', 'Notifications SMS + email', 'Historique complet', 'Support prioritaire'].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-slate-600 text-[0.95rem]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register?plan=pro" className="block w-full text-center py-3.5 bg-[#0f172a] text-white font-semibold rounded-[10px] no-underline hover:bg-slate-800 transition-all">
                Essai gratuit 14 jours
              </Link>
            </motion.div>
          </motion.div>

          {/* Business */}
          <motion.div
            className="bg-white border border-[#e8eaed] rounded-2xl p-8"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <h3 className="text-[1.3rem] font-semibold text-[#0f172a] mb-1">Business</h3>
            <p className="text-slate-400 text-[0.9rem] mb-5">Pour les équipes</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[3rem] font-bold text-[#0f172a]">99</span>
              <span className="text-[1.2rem] font-semibold text-[#0f172a]">€</span>
              <span className="text-slate-400">/mois</span>
            </div>
            <ul className="space-y-3 mb-6">
              {['500 appels par mois', 'Multi-utilisateurs', 'Accès API', 'Intégrations CRM', 'Account manager'].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-slate-600 text-[0.95rem]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register?plan=business" className="block w-full text-center py-3.5 bg-slate-100 text-[#0f172a] font-semibold rounded-[10px] no-underline hover:bg-slate-200 transition-all">
                Nous contacter
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="px-5 md:px-12 py-20 bg-[#0f172a]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-white mb-4">Prêt à gagner du temps ?</h2>
          <p className="text-slate-400 text-[1.1rem] mb-8">Rejoignez les milliers de professionnels qui automatisent leurs prises de rendez-vous.</p>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0f172a] font-semibold rounded-[10px] no-underline hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all">
              Commencer gratuitement
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-5 md:px-12 pt-[60px] pb-8 bg-[#0f172a] border-t border-slate-800">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10 pb-10 border-b border-slate-800">
            <div className="max-w-[280px]">
              <Link href="/" className="flex items-center gap-2.5 no-underline mb-4">
                <div className="w-[38px] h-[38px] bg-white rounded-[10px] flex items-center justify-center text-[#0f172a]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                </div>
                <span className="text-[1.4rem] font-bold text-white">Rendevo</span>
              </Link>
              <p className="text-slate-500 text-[0.9rem] leading-relaxed">L'assistant IA qui révolutionne la prise de rendez-vous.</p>
            </div>
            <div className="flex flex-wrap gap-8 lg:gap-20">
              <div>
                <h4 className="text-white font-semibold mb-4 text-[0.9rem]">Produit</h4>
                <div className="space-y-2.5">
                  <a href="#features" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Fonctionnalités</a>
                  <a href="#pricing" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Tarifs</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">API</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Changelog</a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-[0.9rem]">Entreprise</h4>
                <div className="space-y-2.5">
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">À propos</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Blog</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Carrières</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Contact</a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4 text-[0.9rem]">Légal</h4>
                <div className="space-y-2.5">
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">CGU</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">Confidentialité</a>
                  <a href="#" className="block text-slate-500 text-[0.9rem] no-underline hover:text-white transition-colors">RGPD</a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-5 pt-8">
            <p className="text-slate-600 text-[0.85rem]">© 2024 Rendevo. Tous droits réservés.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
