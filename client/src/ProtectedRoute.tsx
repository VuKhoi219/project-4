// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const token = localStorage.getItem("token"); // hoặc tên bạn đang lưu
//   const location = useLocation();

//   if (!token) {
//     // Hiện thông báo trước khi chuyển hướng
//     const confirmLogin = window.confirm("Vui lòng đăng nhập !");
//     if (confirmLogin) {
//       localStorage.setItem("redirectAfterLogin", location.pathname);
//       return <Navigate to="/login" replace />;
//     } else {
//       // Nếu bấm Cancel thì quay về trang chủ (hoặc trang khác tuỳ bạn)
//       return <Navigate to="/" replace />;
//     }
//   }

//   // ✅ Đảm bảo luôn trả về ReactElement
//     return <>{children}</>;
// };

// export default ProtectedRoute;
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Custom confirm dialog thay thế window.confirm
const customConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    `;

    // Tạo modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: scale(0.95);
      transition: all 0.2s ease-out;
    `;

    // Icon
    const icon = document.createElement('div');
    icon.style.cssText = `
      width: 48px;
      height: 48px;
      background-color: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    `;
    icon.innerHTML = `
      <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
      </svg>
    `;

    // Title
    const title = document.createElement('h3');
    title.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      text-align: center;
      margin: 0 0 8px;
    `;
    title.textContent = 'Yêu cầu đăng nhập';

    // Message
    const messageEl = document.createElement('p');
    messageEl.style.cssText = `
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin: 0 0 24px;
      line-height: 1.5;
    `;
    messageEl.textContent = message;

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = `
      flex: 1;
      padding: 10px 16px;
      background-color: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    cancelBtn.textContent = 'Hủy';
    cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = '#e5e7eb';
    cancelBtn.onmouseout = () => cancelBtn.style.backgroundColor = '#f3f4f6';

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.style.cssText = `
      flex: 1;
      padding: 10px 16px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    confirmBtn.textContent = 'Đăng nhập';
    confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = '#1d4ed8';
    confirmBtn.onmouseout = () => confirmBtn.style.backgroundColor = '#2563eb';

    // Event handlers
    const cleanup = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => document.body.removeChild(overlay), 200);
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };

    confirmBtn.onclick = () => {
      cleanup();
      resolve(true);
    };

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    };

    // ESC key handler
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        resolve(false);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Assemble and show
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(confirmBtn);
    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(messageEl);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);
  });
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Sử dụng custom confirm dialog thay vì window.confirm
    customConfirm("Bạn cần đăng nhập để chơi chung với những người bạn!").then((confirmed) => {
      if (confirmed) {
        localStorage.setItem("redirectAfterLogin", location.pathname);
        window.location.href = "/login";
      } else {
        window.location.href = "/";
      }
    });

    // Return loading state trong khi chờ user chọn
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
