import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./animations.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPreferences from "./pages/UserPreferences";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import SavedPGs from "./pages/SavedPGs";
import Compare from "./pages/Compare";
import Bookings from "./pages/Bookings";
import Reviews from "./pages/Reviews";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const location = useLocation();
  return (
    <AuthProvider>
      <div className="app">
        <ScrollToTop />
        <Navbar />
        <main>
          <div className="route-view" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/preferences" element={<ProtectedRoute><UserPreferences /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedPGs /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/owner/add-pg" element={<ProtectedRoute role="owner"><OwnerDashboard initialTab="add-pg" /></ProtectedRoute>} />
            <Route path="/owner/manage-pg" element={<ProtectedRoute role="owner"><OwnerDashboard initialTab="pgs" /></ProtectedRoute>} />
          </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
