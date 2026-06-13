import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import PropertyListPage from '@/pages/properties/PropertyListPage'
import PropertyFormPage from '@/pages/properties/PropertyFormPage'
import PropertyDetailPage from '@/pages/properties/PropertyDetailPage'
import RoomFormPage from '@/pages/rooms/RoomFormPage'
import RoomListPage from '@/pages/rooms/RoomListPage'
import AvailabilityPage from '@/pages/availability/AvailabilityPage'
import ReservationListPage from '@/pages/reservations/ReservationListPage'
import ReservationFormPage from '@/pages/reservations/ReservationFormPage'
import ReservationDetailPage from '@/pages/reservations/ReservationDetailPage'
import GuestListPage from '@/pages/guests/GuestListPage'
import GuestFormPage from '@/pages/guests/GuestFormPage'
import GuestDetailPage from '@/pages/guests/GuestDetailPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import WalletPage from '@/pages/wallet/WalletPage'
import TransactionFormPage from '@/pages/wallet/TransactionFormPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/reservations" replace />} />

          {/* Properties */}
          <Route path="properties" element={<PropertyListPage />} />
          <Route path="properties/new" element={<PropertyFormPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
          <Route path="properties/:id/edit" element={<PropertyFormPage />} />
          <Route path="properties/:propertyId/rooms/new" element={<RoomFormPage />} />

          {/* Rooms */}
          <Route path="rooms" element={<RoomListPage />} />
          <Route path="rooms/:propertyId/:roomId/edit" element={<RoomFormPage />} />

          {/* Availability */}
          <Route path="availability" element={<AvailabilityPage />} />

          {/* Reservations */}
          <Route path="reservations" element={<ReservationListPage />} />
          <Route path="reservations/new" element={<ReservationFormPage />} />
          <Route path="reservations/:id" element={<ReservationDetailPage />} />

          {/* Guests */}
          <Route path="guests" element={<GuestListPage />} />
          <Route path="guests/new" element={<GuestFormPage />} />
          <Route path="guests/:id" element={<GuestDetailPage />} />
          <Route path="guests/:id/edit" element={<GuestFormPage />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Wallet */}
          <Route path="wallet" element={<WalletPage />} />
          <Route path="wallet/new" element={<TransactionFormPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
