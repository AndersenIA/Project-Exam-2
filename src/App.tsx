import "./index.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import { VenueDetail } from "./pages/VenueDetail";
import { Venues } from "./pages/Venues";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pages with layout */}
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
        </Route>

        {/* pages without layout */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
