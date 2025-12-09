import { Route, Switch, Redirect, useLocation } from 'wouter'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

// Page wrapper component for transitions
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const [, setLocation] = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <motion.div
          className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!token) {
    setLocation('/login')
    return null
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const [, setLocation] = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <motion.div
          className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (token) {
    setLocation('/dashboard')
    return null
  }

  return <>{children}</>
}

function AppRoutes() {
  const [location] = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/">
          <PageWrapper>
            <Home />
          </PageWrapper>
        </Route>
        <Route path="/login">
          <PublicRoute>
            <PageWrapper>
              <Login />
            </PageWrapper>
          </PublicRoute>
        </Route>
        <Route path="/register">
          <PublicRoute>
            <PageWrapper>
              <Register />
            </PageWrapper>
          </PublicRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          </ProtectedRoute>
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
