// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import StorefrontPage from "./pages/StorefrontPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      {/* หน้าแรก = Storefront */}
      <Route path="/" element={<StorefrontPage />} />

      {/* หน้าเข้าระบบ / สมัคร */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* เส้นทางอื่นๆ ส่งกลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
