import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'
import calendarStyles from './Calendar.module.css'

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
  call_sid?: string
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
  transcription?: string
  duree?: number
  recording_url?: string
  recording_sid?: string
  created_at?: string
  createdAt?: string
}

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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  data?: any
  created_at: string
}

type ActiveTab = 'dashboard' | 'calls' | 'appointments' | 'calendar' | 'settings'

export default function Dashboard() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [successRate, setSuccessRate] = useState(0)
  const [calls, setCalls] = useState<Call[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showCallForm, setShowCallForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTranscription, setShowTranscription] = useState<Call | null>(null)
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [settingsForm, setSettingsForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: ''
  })
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

  const unreadNotifications = notifications.filter(n => !n.read).length

  // Connexion Socket.IO
  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:3000')
      setSocket(newSocket)

      newSocket.on('connect', () => {
        console.log('Socket connecte')
        newSocket.emit('authenticate', token)
      })

      newSocket.on('notification', (notification: Notification) => {
        console.log('Nouvelle notification:', notification)
        setNotifications(prev => [notification, ...prev])
        // Rafraichir les donnees
        fetchData()
      })

      newSocket.on('call_update', (callData: any) => {
        console.log('Mise a jour appel:', callData)
        fetchData()
      })

      return () => {
        newSocket.close()
      }
    }
  }, [token])

  const fetchData = useCallback(async () => {
    if (!token) return
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [statsRes, callsRes, appointmentsRes, notifsRes, weeklyRes, rateRes] = await Promise.all([
        axios.get('/api/stats', { headers }),
        axios.get(`/api/calls?status=${statusFilter}&search=${searchQuery}`, { headers }),
        axios.get('/api/appointments', { headers }),
        axios.get('/api/notifications', { headers }),
        axios.get('/api/stats/weekly', { headers }),
        axios.get('/api/stats/success-rate', { headers })
      ])
      setStats(statsRes.data)
      setCalls(callsRes.data)
      setAppointments(appointmentsRes.data)
      setNotifications(notifsRes.data)
      setWeeklyStats(weeklyRes.data)
      setSuccessRate(rateRes.data.rate)
    } catch (error) {
      console.error('Erreur chargement:', error)
    }
  }, [token, statusFilter, searchQuery])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [token, navigate, fetchData])

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

  const handleCallFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCallForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettingsForm(prev => ({ ...prev, [name]: value }))
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
        setShowCallForm(false)
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
        fetchData()
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors du lancement de l\'appel')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markAllNotificationsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      en_cours: { label: 'En cours', className: styles.statusPending },
      succes: { label: 'RDV confirme', className: styles.statusSuccess },
      echec: { label: 'Echec', className: styles.statusError },
      rappeler: { label: 'A rappeler', className: styles.statusWarning },
      confirme: { label: 'Confirme', className: styles.statusSuccess }
    }
    const { label, className } = statusMap[status] || { label: status, className: '' }
    return <span className={`${styles.statusBadge} ${className}`}>{label}</span>
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rdv_confirmed':
        return (
          <div className={`${styles.notifIcon} ${styles.notifIconSuccess}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )
      case 'call_failed':
        return (
          <div className={`${styles.notifIcon} ${styles.notifIconError}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        )
      case 'recall_needed':
        return (
          <div className={`${styles.notifIcon} ${styles.notifIconWarning}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className={styles.notifIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </div>
        )
    }
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']

  const pieData = stats ? [
    { name: 'Succes', value: stats.rdvConfirmes },
    { name: 'Echecs', value: stats.echecs },
    { name: 'A rappeler', value: stats.aRappeler },
    { name: 'En cours', value: stats.appelsEnCours }
  ].filter(d => d.value > 0) : []

  if (!user) return null

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const renderNotificationBell = () => (
    <div className={styles.notificationBell}>
      <button
        className={styles.bellBtn}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadNotifications > 0 && (
          <span className={styles.notificationBadge}>{unreadNotifications}</span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className={styles.notificationDropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={styles.notificationHeader}>
              <h4>Notifications</h4>
              {unreadNotifications > 0 && (
                <button onClick={markAllNotificationsRead}>Tout marquer lu</button>
              )}
            </div>
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <p className={styles.noNotifications}>Aucune notification</p>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
                  >
                    {getNotificationIcon(notif.type)}
                    <div className={styles.notificationContent}>
                      <strong>{notif.title}</strong>
                      <p>{notif.message}</p>
                      <span className={styles.notificationTime}>
                        {formatDate(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Next month days
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
      const rdvDetails = apt.rdv_details || apt.rdvDetails || ''
      // Try to parse date from rdv_details (format: "Lundi 15 janvier a 14h30" or similar)
      const dateStr = rdvDetails.toLowerCase()
      const dayOfMonth = date.getDate()
      const monthNames = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']
      const currentMonth = monthNames[date.getMonth()]

      // Check if the rdv details contain the day number and month
      if (dateStr.includes(String(dayOfMonth)) && dateStr.includes(currentMonth)) {
        return true
      }

      // Also check created_at date as fallback
      const createdAt = apt.created_at || apt.createdAt
      if (createdAt) {
        const aptDate = new Date(createdAt)
        return aptDate.toDateString() === date.toDateString()
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
      const createdAt = apt.created_at || apt.createdAt
      if (createdAt) {
        const aptDate = new Date(createdAt)
        return aptDate >= today
      }
      return false
    }).slice(0, 5)
  }

  const getThisMonthAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => {
      const createdAt = apt.created_at || apt.createdAt
      if (createdAt) {
        const aptDate = new Date(createdAt)
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
      }
      return false
    }).length
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <header className={styles.header}>
              <div>
                <h1>Bonjour, {user.prenom} !</h1>
                <p>Voici un apercu de votre activite</p>
              </div>
              <div className={styles.headerActions}>
                <button onClick={() => setShowCallForm(true)} className={styles.newCallBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Nouvel appel
                </button>
                {renderNotificationBell()}
              </div>
            </header>

            <div className={styles.statsGrid}>
              <motion.div
                className={styles.statCard}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={styles.statIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats?.totalAppels || 0}</div>
                  <div className={styles.statLabel}>Total appels</div>
                </div>
              </motion.div>
              <motion.div
                className={styles.statCard}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats?.rdvConfirmes || 0}</div>
                  <div className={styles.statLabel}>RDV confirmes</div>
                </div>
              </motion.div>
              <motion.div
                className={styles.statCard}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{stats?.aRappeler || 0}</div>
                  <div className={styles.statLabel}>A rappeler</div>
                </div>
              </motion.div>
              <motion.div
                className={styles.statCard}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`${styles.statIcon} ${styles.statIconInfo}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statNumber}>{user.creditsAppels}</div>
                  <div className={styles.statLabel}>Credits restants</div>
                </div>
              </motion.div>
            </div>

            {/* Graphiques */}
            <div className={styles.chartsGrid}>
              <motion.div
                className={styles.chartCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Appels cette semaine</h3>
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
                className={styles.chartCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>Taux de succes</h3>
                <div className={styles.successRateContainer}>
                  <div className={styles.successRateCircle}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                      <path
                        className={styles.circleBg}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={styles.circle}
                        strokeDasharray={`${successRate}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className={styles.successRateText}>{successRate}%</div>
                  </div>
                  <p>de RDV confirmes</p>
                  <div className={styles.statsLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#10b981' }}></span>
                      <span>Succes: {stats?.rdvConfirmes || 0}</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#ef4444' }}></span>
                      <span>Echecs: {stats?.echecs || 0}</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: '#f59e0b' }}></span>
                      <span>A rappeler: {stats?.aRappeler || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className={styles.recentCalls}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2>Appels recents</h2>
              {calls.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                  <p>Aucun appel pour le moment</p>
                  <button onClick={() => setShowCallForm(true)} className={styles.emptyStateBtn}>
                    Lancer mon premier appel
                  </button>
                </div>
              ) : (
                <table className={styles.callsTable}>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Entreprise</th>
                      <th>Motif</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.slice(0, 5).map(call => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: '#f8fafc' }}
                      >
                        <td>{call.client_prenom || call.clientPrenom} {call.client_nom || call.clientNom}</td>
                        <td>{call.entreprise || '-'}</td>
                        <td>{call.motif}</td>
                        <td>{getStatusBadge(call.status)}</td>
                        <td>{formatDate(call.created_at || call.createdAt)}</td>
                        <td>
                          <button
                            className={styles.viewTranscriptionBtn}
                            onClick={() => setShowTranscription(call)}
                            title="Voir la transcription"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </motion.div>
        )

      case 'calls':
        return (
          <motion.div
            key="calls"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <header className={styles.header}>
              <div>
                <h1>Historique des appels</h1>
                <p>Consultez tous vos appels passes</p>
              </div>
              <div className={styles.headerActions}>
                <button onClick={() => setShowCallForm(true)} className={styles.newCallBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Nouvel appel
                </button>
                {renderNotificationBell()}
              </div>
            </header>

            {/* Filtres */}
            <div className={styles.filtersBar}>
              <div className={styles.searchBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom, entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.statusFilter}
              >
                <option value="all">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="succes">Succes</option>
                <option value="echec">Echec</option>
                <option value="rappeler">A rappeler</option>
              </select>
            </div>

            <div className={styles.recentCalls}>
              {calls.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                  <p>Aucun appel trouve</p>
                  <button onClick={() => setShowCallForm(true)} className={styles.emptyStateBtn}>
                    Lancer mon premier appel
                  </button>
                </div>
              ) : (
                <table className={styles.callsTable}>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Entreprise</th>
                      <th>Numero</th>
                      <th>Motif</th>
                      <th>Statut</th>
                      <th>RDV</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map(call => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: '#f8fafc' }}
                      >
                        <td>{call.client_prenom || call.clientPrenom} {call.client_nom || call.clientNom}</td>
                        <td>{call.entreprise || '-'}</td>
                        <td>{call.numero_entreprise || call.numeroEntreprise || '-'}</td>
                        <td>{call.motif}</td>
                        <td>{getStatusBadge(call.status)}</td>
                        <td>{call.rdv_details || call.rdvDetails || '-'}</td>
                        <td>{formatDate(call.created_at || call.createdAt)}</td>
                        <td>
                          <button
                            className={styles.viewTranscriptionBtn}
                            onClick={() => setShowTranscription(call)}
                            title="Voir la transcription"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )

      case 'appointments':
        return (
          <motion.div
            key="appointments"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <header className={styles.header}>
              <div>
                <h1>Mes rendez-vous</h1>
                <p>Tous vos rendez-vous confirmes</p>
              </div>
              <div className={styles.headerActions}>
                {renderNotificationBell()}
              </div>
            </header>

            <div className={styles.recentCalls}>
              {appointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p>Aucun rendez-vous pour le moment</p>
                  <button onClick={() => setShowCallForm(true)} className={styles.emptyStateBtn}>
                    Planifier un rendez-vous
                  </button>
                </div>
              ) : (
                <div className={styles.appointmentsGrid}>
                  {appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      className={styles.appointmentCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className={styles.appointmentHeader}>
                        <div className={styles.appointmentIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      <h3>{apt.client_prenom || apt.clientPrenom} {apt.client_nom || apt.clientNom}</h3>
                      <p className={styles.appointmentEntreprise}>{apt.entreprise}</p>
                      <div className={styles.appointmentDetails}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{apt.rdv_details || apt.rdvDetails || 'Horaire a confirmer'}</span>
                      </div>
                      <div className={styles.appointmentDate}>
                        Cree le {formatDate(apt.created_at || apt.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'calendar':
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
            <header className={styles.header}>
              <div>
                <h1>Calendrier</h1>
                <p>Vos rendez-vous confirmes par l'IA</p>
              </div>
              <div className={styles.headerActions}>
                {renderNotificationBell()}
              </div>
            </header>

            {/* Stats */}
            <div className={calendarStyles.calendarStats}>
              <div className={calendarStyles.calendarStatCard}>
                <div className={`${calendarStyles.calendarStatIcon} ${calendarStyles.calendarStatIconGreen}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div>
                  <div className={calendarStyles.calendarStatNumber}>{appointments.length}</div>
                  <div className={calendarStyles.calendarStatLabel}>Total RDV confirmes</div>
                </div>
              </div>
              <div className={calendarStyles.calendarStatCard}>
                <div className={`${calendarStyles.calendarStatIcon} ${calendarStyles.calendarStatIconBlue}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className={calendarStyles.calendarStatNumber}>{getThisMonthAppointments()}</div>
                  <div className={calendarStyles.calendarStatLabel}>Ce mois-ci</div>
                </div>
              </div>
              <div className={calendarStyles.calendarStatCard}>
                <div className={`${calendarStyles.calendarStatIcon} ${calendarStyles.calendarStatIconOrange}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className={calendarStyles.calendarStatNumber}>{getUpcomingAppointments().length}</div>
                  <div className={calendarStyles.calendarStatLabel}>A venir</div>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className={calendarStyles.calendarContainer}>
              <div className={calendarStyles.calendarHeader}>
                <div className={calendarStyles.calendarNav}>
                  <button className={calendarStyles.navBtn} onClick={() => navigateMonth(-1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <span className={calendarStyles.currentMonth}>{formatMonthYear(currentDate)}</span>
                  <button className={calendarStyles.navBtn} onClick={() => navigateMonth(1)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
                <button className={calendarStyles.todayBtn} onClick={goToToday}>
                  Aujourd'hui
                </button>
              </div>

              <div className={calendarStyles.calendarGrid}>
                {weekDays.map(day => (
                  <div key={day} className={calendarStyles.weekDay}>{day}</div>
                ))}

                {calendarDays.map((day, index) => {
                  const dayAppointments = getAppointmentsForDate(day.date)
                  const hasEvents = dayAppointments.length > 0

                  return (
                    <div
                      key={index}
                      className={`${calendarStyles.dayCell} ${!day.isCurrentMonth ? calendarStyles.otherMonth : ''} ${isToday(day.date) ? calendarStyles.today : ''} ${hasEvents ? calendarStyles.hasEvents : ''}`}
                      onClick={() => hasEvents && setSelectedDay(day.date)}
                    >
                      <div className={calendarStyles.dayNumber}>{day.date.getDate()}</div>
                      <div className={calendarStyles.dayEvents}>
                        {dayAppointments.slice(0, 2).map((apt, i) => (
                          <div
                            key={i}
                            className={calendarStyles.eventItem}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedAppointment(apt)
                            }}
                          >
                            {apt.client_prenom || apt.clientPrenom} {apt.client_nom || apt.clientNom}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className={calendarStyles.moreEvents}>
                            +{dayAppointments.length - 2} autres
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={calendarStyles.legend}>
                <div className={calendarStyles.legendItem}>
                  <div className={`${calendarStyles.legendDot} ${calendarStyles.legendDotSuccess}`}></div>
                  <span>RDV confirme</span>
                </div>
                <div className={calendarStyles.legendItem}>
                  <div className={`${calendarStyles.legendDot} ${calendarStyles.legendDotToday}`}></div>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>

            {/* Day Detail Modal */}
            <AnimatePresence>
              {selectedDay && (
                <motion.div
                  className={calendarStyles.dayModal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedDay(null)}
                >
                  <motion.div
                    className={calendarStyles.dayModalContent}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={calendarStyles.dayModalHeader}>
                      <h3>{formatFullDate(selectedDay)}</h3>
                      <button className={calendarStyles.closeBtn} onClick={() => setSelectedDay(null)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div className={calendarStyles.dayEventsList}>
                      {getAppointmentsForDate(selectedDay).length === 0 ? (
                        <div className={calendarStyles.noEvents}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <p>Aucun rendez-vous ce jour</p>
                        </div>
                      ) : (
                        getAppointmentsForDate(selectedDay).map((apt, index) => (
                          <div
                            key={index}
                            className={calendarStyles.dayEventItem}
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setSelectedDay(null)
                            }}
                          >
                            <div className={calendarStyles.eventIcon}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                              </svg>
                            </div>
                            <div className={calendarStyles.eventInfo}>
                              <h4>{apt.client_prenom || apt.clientPrenom} {apt.client_nom || apt.clientNom}</h4>
                              <p>{apt.entreprise} - {apt.rdv_details || apt.rdvDetails || 'Horaire a confirmer'}</p>
                            </div>
                          </div>
                        ))
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
                  className={calendarStyles.eventModal}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAppointment(null)}
                >
                  <motion.div
                    className={calendarStyles.eventModalContent}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={calendarStyles.eventModalHeader}>
                      <h3>Details du rendez-vous</h3>
                      <button className={calendarStyles.closeBtn} onClick={() => setSelectedAppointment(null)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div className={calendarStyles.eventModalBody}>
                      <div className={calendarStyles.eventDetail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <div>
                          <div className={calendarStyles.label}>Client</div>
                          <div className={calendarStyles.value}>
                            {selectedAppointment.client_prenom || selectedAppointment.clientPrenom} {selectedAppointment.client_nom || selectedAppointment.clientNom}
                          </div>
                        </div>
                      </div>
                      <div className={calendarStyles.eventDetail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <div>
                          <div className={calendarStyles.label}>Entreprise</div>
                          <div className={calendarStyles.value}>{selectedAppointment.entreprise}</div>
                        </div>
                      </div>
                      <div className={calendarStyles.eventDetail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <div>
                          <div className={calendarStyles.label}>Horaire</div>
                          <div className={calendarStyles.value}>
                            {selectedAppointment.rdv_details || selectedAppointment.rdvDetails || 'A confirmer'}
                          </div>
                        </div>
                      </div>
                      <div className={calendarStyles.eventDetail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <div>
                          <div className={calendarStyles.label}>Statut</div>
                          <div className={calendarStyles.value}>
                            <span className={calendarStyles.statusBadge}>Confirme</span>
                          </div>
                        </div>
                      </div>
                      <div className={calendarStyles.eventDetail}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <div>
                          <div className={calendarStyles.label}>Cree le</div>
                          <div className={calendarStyles.value}>
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

      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <header className={styles.header}>
              <div>
                <h1>Parametres</h1>
                <p>Gerez votre compte et vos preferences</p>
              </div>
              <div className={styles.headerActions}>
                {renderNotificationBell()}
              </div>
            </header>

            <div className={styles.settingsContainer}>
              <motion.div
                className={styles.settingsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3>Informations personnelles</h3>
                <div className={styles.settingsForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Prenom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={settingsForm.prenom}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={settingsForm.nom}
                        onChange={handleSettingsChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settingsForm.email}
                      onChange={handleSettingsChange}
                      disabled
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Telephone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={settingsForm.telephone}
                      onChange={handleSettingsChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Entreprise</label>
                    <input
                      type="text"
                      name="entreprise"
                      value={settingsForm.entreprise}
                      onChange={handleSettingsChange}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className={styles.settingsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Abonnement</h3>
                <div className={styles.planCard}>
                  <div className={styles.planInfo}>
                    <div className={styles.planName}>{user.plan}</div>
                    <div className={styles.planCredits}>{user.creditsAppels} credits restants</div>
                  </div>
                  <button className={styles.upgradePlanBtn}>
                    Changer de forfait
                  </button>
                </div>
              </motion.div>

              <motion.div
                className={styles.settingsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>Zone de danger</h3>
                <div className={styles.dangerZone}>
                  <div>
                    <strong>Supprimer mon compte</strong>
                    <p>Cette action est irreversible. Toutes vos donnees seront supprimees.</p>
                  </div>
                  <button className={styles.deleteAccountBtn}>
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className={styles.container}>
      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </>
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </div>
            <span className={styles.logoText}>Rendevo</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Tableau de bord
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('calls'); setMobileMenuOpen(false); }}
            className={`${styles.navItem} ${activeTab === 'calls' ? styles.navItemActive : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
            Historique appels
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('appointments'); setMobileMenuOpen(false); }}
            className={`${styles.navItem} ${activeTab === 'appointments' ? styles.navItemActive : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Rendez-vous
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('calendar'); setMobileMenuOpen(false); }}
            className={`${styles.navItem} ${activeTab === 'calendar' ? styles.navItemActive : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14l2 2 4-4"/>
            </svg>
            Calendrier
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Parametres
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user.prenom[0]}{user.nom[0]}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.prenom} {user.nom}</div>
              <div className={styles.userPlan}>{user.plan}</div>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Call Form Modal */}
      <AnimatePresence>
        {showCallForm && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h2>Nouvel appel</h2>
                <button onClick={() => setShowCallForm(false)} className={styles.closeBtn}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitCall}>
                <div className={styles.formSection}>
                  <h3>Informations client</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Prenom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={callForm.prenom}
                        onChange={handleCallFormChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={callForm.nom}
                        onChange={handleCallFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Telephone du client</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={callForm.telephone}
                      onChange={handleCallFormChange}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Etablissement a appeler</h3>
                  <div className={styles.formGroup}>
                    <label>Nom de l'etablissement</label>
                    <input
                      type="text"
                      name="entreprise"
                      value={callForm.entreprise}
                      onChange={handleCallFormChange}
                      placeholder="Cabinet dentaire, etc."
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Numero de telephone</label>
                    <input
                      type="tel"
                      name="numero_entreprise"
                      value={callForm.numero_entreprise}
                      onChange={handleCallFormChange}
                      placeholder="01 23 45 67 89"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Details du rendez-vous</h3>
                  <div className={styles.formGroup}>
                    <label>Motif</label>
                    <select
                      name="motif"
                      value={callForm.motif}
                      onChange={handleCallFormChange}
                    >
                      <option value="consultation">Consultation</option>
                      <option value="suivi">Visite de suivi</option>
                      <option value="urgence">Urgence</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Details supplementaires</label>
                    <textarea
                      name="details"
                      value={callForm.details}
                      onChange={handleCallFormChange}
                      placeholder="Informations complementaires..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Disponibilites</label>
                    <input
                      type="text"
                      name="disponibilites"
                      value={callForm.disponibilites}
                      onChange={handleCallFormChange}
                      placeholder="Lundi matin, mardi apres-midi..."
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setShowCallForm(false)} className={styles.cancelBtn}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Lancement...' : 'Lancer l\'appel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcription Modal */}
      <AnimatePresence>
        {showTranscription && (
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTranscription(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Transcription de l'appel</h2>
                <button onClick={() => setShowTranscription(null)} className={styles.closeBtn}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className={styles.transcriptionInfo}>
                <p><strong>Client:</strong> {showTranscription.client_prenom || showTranscription.clientPrenom} {showTranscription.client_nom || showTranscription.clientNom}</p>
                <p><strong>Entreprise:</strong> {showTranscription.entreprise}</p>
                <p><strong>Statut:</strong> {getStatusBadge(showTranscription.status)}</p>
                {showTranscription.duree && <p><strong>Duree:</strong> {showTranscription.duree}s</p>}
              </div>

              {/* Lecteur Audio */}
              {showTranscription.recording_url && (
                <div className={styles.audioPlayerContainer}>
                  <div className={styles.audioPlayerHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                    <span>Enregistrement de l'appel</span>
                  </div>
                  <audio
                    controls
                    className={styles.audioPlayer}
                    src={showTranscription.recording_url + '.mp3'}
                  >
                    Votre navigateur ne supporte pas l'element audio.
                  </audio>
                </div>
              )}

              <div className={styles.transcriptionContent}>
                {showTranscription.transcription ? (
                  showTranscription.transcription.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('[IA]') ? styles.iaLine : line.startsWith('[Receptionniste]') ? styles.receptLine : styles.systemLine}>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className={styles.noTranscription}>Aucune transcription disponible pour cet appel.</p>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setShowTranscription(null)} className={styles.cancelBtn}>
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
