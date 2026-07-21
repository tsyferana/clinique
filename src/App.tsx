import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';

// Patient Pages
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage.js';
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage.js';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage.js';
import { MyTicketsPage } from './pages/patient/MyTicketsPage.js';
import { MedicalHistoryPage } from './pages/patient/MedicalHistoryPage.js';
import { ProfilePage } from './pages/patient/ProfilePage.js';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage.js';
import { AppointmentRequestsPage } from './pages/staff/AppointmentRequestsPage.js';
import { ReceptionQueuePage } from './pages/staff/ReceptionQueuePage.js';
import { WalkInRegisterPage } from './pages/staff/WalkInRegisterPage.js';
import { PatientDirectoryPage } from './pages/staff/PatientDirectoryPage.js';
import { DoctorCalendarPage } from './pages/staff/DoctorCalendarPage.js';

// Doctor Pages
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage.js';
import { DoctorAgendaPage } from './pages/doctor/DoctorAgendaPage.js';
import { DoctorQueuePage } from './pages/doctor/DoctorQueuePage.js';
import { ConsultationFormPage } from './pages/doctor/ConsultationFormPage.js';
import { DoctorPrescriptionsPage } from './pages/doctor/DoctorPrescriptionsPage.js';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage.js';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { UserManagementPage } from './pages/admin/UserManagementPage.js';
import { ServicesManagementPage } from './pages/admin/ServicesManagementPage.js';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-200 selection:text-teal-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10 transform translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none -z-10 transform -translate-x-1/3 translate-y-1/3" />

      <Header />
      <div className="flex flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative z-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto rounded-3xl bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium text-sm">
        Chargement de la session médicale...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default home based on role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'PATIENT':
      return <Navigate to="/patient/dashboard" replace />;
    case 'STAFF':
      return <Navigate to="/staff/dashboard" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Main Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Patient Routes */}
              <Route element={<ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']} />}>
                <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
                <Route path="/patient/book" element={<BookAppointmentPage />} />
                <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
                <Route path="/patient/tickets" element={<MyTicketsPage />} />
                <Route path="/patient/medical-history" element={<MedicalHistoryPage />} />
                <Route path="/patient/profile" element={<ProfilePage />} />
              </Route>

              {/* Staff / Reception Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'DOCTOR']} />}>
                <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
                <Route path="/staff/calendar" element={<DoctorCalendarPage />} />
                <Route path="/staff/requests" element={<AppointmentRequestsPage />} />
                <Route path="/staff/queue" element={<ReceptionQueuePage />} />
                <Route path="/staff/walk-in" element={<WalkInRegisterPage />} />
                <Route path="/staff/patients" element={<PatientDirectoryPage />} />
              </Route>

              {/* Doctor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                <Route path="/doctor/agenda" element={<DoctorAgendaPage />} />
                <Route path="/doctor/queue" element={<DoctorQueuePage />} />
                <Route path="/doctor/consultation" element={<ConsultationFormPage />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
                <Route path="/doctor/profile" element={<DoctorProfilePage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/services" element={<ServicesManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
