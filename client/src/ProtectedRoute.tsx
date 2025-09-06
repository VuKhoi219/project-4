import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token"); // hoặc tên bạn đang lưu
  const location = useLocation();

  if (!token) {
    // Hiện thông báo trước khi chuyển hướng
    const confirmLogin = window.confirm("Vui lòng đăng nhập để chơi!");
    if (confirmLogin) {
      localStorage.setItem("redirectAfterLogin", location.pathname);
      return <Navigate to="/login" replace />;
    } else {
      // Nếu bấm Cancel thì quay về trang chủ (hoặc trang khác tuỳ bạn)
      return <Navigate to="/" replace />;
    }
  }

  // ✅ Đảm bảo luôn trả về ReactElement
    return <>{children}</>;
};

export default ProtectedRoute;
