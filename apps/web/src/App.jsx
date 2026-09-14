import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PartnersPage from './pages/PartnersPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminProvidersPage from './pages/AdminProvidersPage';
import ProviderSignupPage from './pages/ProviderSignupPage';
import LoginPage from './pages/LoginPage';
import MesRendezVousPage from './pages/MesRendezVousPage';
import AccountPage from './pages/AccountPage';
import ProviderSpacePage from './pages/ProviderSpacePage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ScrollToTop />
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/prestataires" element={<ProvidersPage />} />
                        <Route path="/prestataires/:slug" element={<ProviderDetailPage />} />
                        <Route path="/reservation" element={<BookingPage />} />
                        <Route path="/a-propos" element={<AboutPage />} />
                        <Route path="/partenaires" element={<PartnersPage />} />
                        <Route path="/admin/reservations" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
                        <Route path="/admin/prestataires" element={<AdminRoute><AdminProvidersPage /></AdminRoute>} />
                        <Route path="/devenir-prestataire" element={<ProviderSignupPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/connexion" element={<LoginPage />} />
                        <Route path="/mes-rendez-vous" element={<ProtectedRoute><MesRendezVousPage /></ProtectedRoute>} />
                        <Route path="/mon-compte" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                        <Route path="/espace-prestataire" element={<ProtectedRoute><ProviderSpacePage /></ProtectedRoute>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
