import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'wouter'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

// Components
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHome from '../components/dashboard/DashboardHome'
import CallsHistory from '../components/dashboard/CallsHistory'
import Appointments from '../components/dashboard/Appointments'
import CalendarView from '../components/dashboard/CalendarView'
import CreditsPage from '../components/dashboard/CreditsPage'
import SettingsPage from '../components/dashboard/SettingsPage'

// Modals
import CallFormModal from '../components/dashboard/modals/CallFormModal'
import TranscriptionModal from '../components/dashboard/modals/TranscriptionModal'
import NotificationBell from '../components/dashboard/modals/NotificationBell'

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
  rdv_date?: string
  rdvDate?: string
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

interface CreditStats {
  totalUsed: number
  totalAdded: number
  totalCalls: number
  currentBalance: number
}

type ActiveTab = 'dashboard' | 'calls' | 'appointments' | 'calendar' | 'credits' | 'settings'

export default function Dashboard() {
  const { user, logout, token } = useAuth()
  const [, setLocation] = useLocation()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [successRate, setSuccessRate] = useState(0)
  const [calls, setCalls] = useState<Call[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null)
  const [showCallForm, setShowCallForm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTranscription, setShowTranscription] = useState<Call | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Page title based on active tab
  useEffect(() => {
    const titles: Record<ActiveTab, string> = {
      dashboard: 'Rendevo - Dashboard',
      calls: 'Rendevo - Historique des appels',
      appointments: 'Rendevo - Rendez-vous',
      calendar: 'Rendevo - Calendrier',
      credits: 'Rendevo - Credits',
      settings: 'Rendevo - Parametres'
    }
    document.title = titles[activeTab]
  }, [activeTab])

  // Socket.IO connection
  useEffect(() => {
    if (token) {
      const socketUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:3000'
      const newSocket = io(socketUrl)
      setSocket(newSocket)

      newSocket.on('connect', () => {
        console.log('Socket connecte')
        newSocket.emit('authenticate', token)
      })

      newSocket.on('notification', (notification: Notification) => {
        console.log('Nouvelle notification:', notification)
        setNotifications(prev => [notification, ...prev])
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
      const [statsRes, callsRes, appointmentsRes, notifsRes, weeklyRes, rateRes, creditStatsRes] = await Promise.all([
        axios.get('/api/stats', { headers }),
        axios.get(`/api/calls?status=${statusFilter}&search=${searchQuery}`, { headers }),
        axios.get('/api/appointments', { headers }),
        axios.get('/api/notifications', { headers }),
        axios.get('/api/stats/weekly', { headers }),
        axios.get('/api/stats/success-rate', { headers }),
        axios.get('/api/credits/stats', { headers })
      ])
      setStats(statsRes.data)
      setCalls(callsRes.data)
      setAppointments(appointmentsRes.data)
      setNotifications(notifsRes.data)
      setWeeklyStats(weeklyRes.data)
      setSuccessRate(rateRes.data.rate)
      setCreditStats(creditStatsRes.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
    }
  }, [token, statusFilter, searchQuery])

  useEffect(() => {
    if (!token) {
      setLocation('/login')
      return
    }
    fetchData()
  }, [token, setLocation, fetchData])

  const handleLogout = () => {
    logout()
    setLocation('/login')
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

  const renderNotificationBell = () => (
    <NotificationBell
      notifications={notifications}
      showNotifications={showNotifications}
      setShowNotifications={setShowNotifications}
      onMarkAllRead={markAllNotificationsRead}
    />
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            stats={stats}
            weeklyStats={weeklyStats}
            successRate={successRate}
            calls={calls}
            onNewCall={() => setShowCallForm(true)}
            onViewTranscription={setShowTranscription}
            renderNotificationBell={renderNotificationBell}
          />
        )
      case 'calls':
        return (
          <CallsHistory
            calls={calls}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onNewCall={() => setShowCallForm(true)}
            onViewTranscription={setShowTranscription}
            renderNotificationBell={renderNotificationBell}
          />
        )
      case 'appointments':
        return (
          <Appointments
            appointments={appointments}
            onNewCall={() => setShowCallForm(true)}
            renderNotificationBell={renderNotificationBell}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            appointments={appointments}
            renderNotificationBell={renderNotificationBell}
          />
        )
      case 'credits':
        return (
          <CreditsPage
            stats={stats}
            creditStats={creditStats}
            calls={calls}
            onNewCall={() => setShowCallForm(true)}
            renderNotificationBell={renderNotificationBell}
          />
        )
      case 'settings':
        return (
          <SettingsPage
            renderNotificationBell={renderNotificationBell}
          />
        )
      default:
        return null
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        onLogout={handleLogout}
        unreadNotifications={notifications.filter(n => !n.read).length}
        renderNotificationBell={renderNotificationBell}
      />

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-[260px] py-[30px] px-5 lg:px-10 pt-20 lg:pt-[30px]">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Call Form Modal */}
      <AnimatePresence>
        {showCallForm && (
          <CallFormModal
            isOpen={showCallForm}
            onClose={() => setShowCallForm(false)}
            onSuccess={fetchData}
            token={token}
          />
        )}
      </AnimatePresence>

      {/* Transcription Modal */}
      <AnimatePresence>
        {showTranscription && (
          <TranscriptionModal
            call={showTranscription}
            onClose={() => setShowTranscription(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
