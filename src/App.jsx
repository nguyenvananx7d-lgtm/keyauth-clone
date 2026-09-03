import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ApplicationsPage from './pages/dashboard/ApplicationsPage'
import LicensesPage from './pages/dashboard/LicensesPage'
import UsersPage from './pages/dashboard/UsersPage'
import SubscriptionsPage from './pages/dashboard/SubscriptionsPage'
import VariablesPage from './pages/dashboard/VariablesPage'
import WebhooksPage from './pages/dashboard/WebhooksPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/applications" replace />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="variables" element={<VariablesPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
