import "./index.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pages with layout */}
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* pages without layout */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
