import "./index.css";
import { useEffect } from "react";
import { Route, Routes, BrowserRouter, Navigate, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import { VenueDetail } from "./pages/VenueDetail";
import { Venues } from "./pages/Venues";
import { ProfilePage } from "./pages/ProfilePage";
import { AuthProvider } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* pages with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* pages without layout */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
