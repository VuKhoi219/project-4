# 📁 Cấu trúc thư mục dự án React

## 🎯 Mục đích tài liệu
Tài liệu này giúp các thành viên trong team hiểu rõ cấu trúc thư mục, quy ước đặt tên và cách tổ chức code trong dự án React của chúng ta.

## 🏗️ Tổng quan cấu trúc

```
src/
├── assets/          # Tài nguyên tĩnh
├── components/      # Component tái sử dụng
├── context/         # Quản lý state toàn cục
├── data/           # Dữ liệu tĩnh và models
├── features/       # Tính năng theo module
├── pages/          # Các trang chính
├── hooks/          # Custom hooks
├── layouts/        # Layout components
├── lib/            # Thư viện bên ngoài
├── services/       # API và dịch vụ
├── styles/         # CSS/SCSS toàn cục
└── utils/          # Hàm tiện ích
```

---

## 📂 Chi tiết từng thư mục

### 🎨 `/assets`
**Mục đích**: Lưu trữ tài nguyên tĩnh không thay đổi

**Nội dung**:
- 🖼️ Hình ảnh (logo, icons, banners)
- 🔤 Font chữ custom
- 🎵 Audio/Video files
- 📄 Tài liệu PDF

**Ví dụ cấu trúc**:
```
assets/
├── images/
│   ├── logo.png
│   ├── icons/
│   └── banners/
├── fonts/
│   └── custom-font.woff2
└── videos/
    └── intro.mp4
```

**Quy tắc**:
- Tên file sử dụng kebab-case: `main-logo.png`
- Tối ưu hóa kích thước file trước khi commit
- Sử dụng format phù hợp (PNG cho logo, JPG cho ảnh)

---

### 🧩 `/components`
**Mục đích**: Chứa các component có thể tái sử dụng trong toàn bộ ứng dụng

**Đặc điểm**:
- ✅ Độc lập, không phụ thuộc vào business logic
- ✅ Có thể sử dụng ở nhiều nơi
- ✅ Tập trung vào UI/UX

**Ví dụ cấu trúc**:
```
components/
├── Button/
│   ├── Button.jsx
│   ├── Button.module.css
│   └── index.js
├── Modal/
├── Input/
└── Navigation/
```

**Quy tắc đặt tên**:
- Folder: PascalCase (`Button`, `NavBar`)
- File component: PascalCase (`Button.jsx`)
- Export default qua `index.js`

**Ví dụ component**:
```jsx
// components/Button/Button.jsx
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', onClick }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

---

### 🌐 `/context`
**Mục đích**: Quản lý state toàn cục bằng Context API

**Khi nào sử dụng**:
- 🔄 Dữ liệu cần chia sẻ giữa nhiều component
- 👤 Thông tin user authentication
- 🛒 Shopping cart state
- 🌙 Theme/Dark mode

**Ví dụ cấu trúc**:
```
context/
├── AuthContext.js
├── ThemeContext.js
├── CartContext.js
└── index.js
```

**Ví dụ implementation**:
```jsx
// context/AuthContext.js
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials) => {
    // Logic đăng nhập
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

### 💾 `/data`
**Mục đích**: Chứa dữ liệu tĩnh và data models

**Nội dung**:
- 📊 Mock data cho development
- 🏗️ Data models/schemas
- ⚙️ Config constants
- 🗂️ Static data lists

**Ví dụ cấu trúc**:
```
data/
├── constants.js
├── mockData.js
├── models/
│   ├── User.js
│   └── Product.js
└── config.js
```

**Ví dụ sử dụng**:
```javascript
// data/constants.js
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

// data/mockData.js
export const MOCK_USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
```

---

### 🎯 `/features`
**Mục đích**: Tổ chức code theo tính năng (feature-based architecture)

**Ưu điểm**:
- 📁 Dễ tìm kiếm và bảo trì
- 🔄 Tái sử dụng code tốt hơn
- 👥 Phân chia công việc team hiệu quả

**Ví dụ cấu trúc**:
```
features/
├── authentication/
│   ├── components/
│   │   ├── LoginForm.jsx
│   │   └── SignupForm.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── services/
│   │   └── authService.js
│   └── index.js
├── dashboard/
└── profile/
```

**Quy tắc**:
- Mỗi feature là một module độc lập
- Export public API qua `index.js`
- Không import trực tiếp từ feature khác

---

### 📄 `/pages`
**Mục đích**: Chứa các page components cho routing

**Đặc điểm**:
- 🗺️ Tương ứng với routes trong ứng dụng
- 🏗️ Kết hợp nhiều components/features
- 📱 Responsive design

**Ví dụ cấu trúc**:
```
pages/
├── HomePage.jsx
├── AboutPage.jsx
├── ContactPage.jsx
├── ProductPage.jsx
└── NotFoundPage.jsx
```

**Ví dụ page component**:
```jsx
// pages/HomePage.jsx
import Hero from '../components/Hero';
import ProductList from '../features/products/components/ProductList';
import Newsletter from '../components/Newsletter';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <ProductList />
      <Newsletter />
    </div>
  );
};

export default HomePage;
```

---

### 🎣 `/hooks`
**Mục đích**: Custom hooks để tái sử dụng logic

**Lợi ích**:
- 🔄 Tái sử dụng stateful logic
- 🧹 Code cleaner và dễ test
- 📦 Đóng gói logic phức tạp

**Ví dụ cấu trúc**:
```
hooks/
├── useApi.js
├── useLocalStorage.js
├── useDebounce.js
└── useForm.js
```

**Ví dụ custom hook**:
```javascript
// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
```

---

### 🏠 `/layouts`
**Mục đích**: Chứa layout components cho cấu trúc trang

**Nội dung**:
- 🎯 Header/Footer chung
- 📱 Sidebar navigation
- 🖼️ Page wrappers
- 📐 Grid layouts

**Ví dụ cấu trúc**:
```
layouts/
├── MainLayout.jsx
├── AuthLayout.jsx
├── DashboardLayout.jsx
└── components/
    ├── Header.jsx
    ├── Footer.jsx
    └── Sidebar.jsx
```

**Ví dụ layout**:
```jsx
// layouts/MainLayout.jsx
import Header from './components/Header';
import Footer from './components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
```

---

### 📚 `/lib`
**Mục đích**: Thư viện bên ngoài và utilities

**Nội dung**:
- ⚙️ Config cho thư viện 3rd party
- 🔧 Setup tools (axios, validation)
- 🎨 Theme configuration
- 📊 Analytics setup

**Ví dụ cấu trúc**:
```
lib/
├── axios.js
├── validation.js
├── theme.js
└── analytics.js
```

**Ví dụ config**:
```javascript
// lib/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

---

### 🌐 `/services`
**Mục đích**: Quản lý API calls và external services

**Nội dung**:
- 🔗 API endpoints
- 🔐 Authentication services
- 💳 Payment integration
- 📧 Email services

**Ví dụ cấu trúc**:
```
services/
├── api/
│   ├── authApi.js
│   ├── userApi.js
│   └── productApi.js
├── payment/
│   └── stripeService.js
└── index.js
```

**Ví dụ service**:
```javascript
// services/api/userApi.js
import apiClient from '../lib/axios';

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getAllUsers: () => apiClient.get('/users'),
  deleteUser: (id) => apiClient.delete(`/users/${id}`)
};
```

---

### 🎨 `/styles`
**Mục đích**: CSS/SCSS global và theme

**Nội dung**:
- 🌍 Global styles
- 🎨 Theme variables
- 📱 Responsive breakpoints
- 🎭 CSS modules

**Ví dụ cấu trúc**:
```
styles/
├── globals.css
├── variables.scss
├── components/
│   └── Button.module.scss
└── themes/
    ├── light.scss
    └── dark.scss
```

**Ví dụ global styles**:
```scss
// styles/globals.css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
}
```

---

### 🛠️ `/utils`
**Mục đích**: Hàm tiện ích và helpers

**Nội dung**:
- 📅 Date/time formatting
- 🔤 String manipulation
- 🔢 Number formatting
- ✅ Validation helpers

**Ví dụ cấu trúc**:
```
utils/
├── formatters.js
├── validators.js
├── helpers.js
└── constants.js
```

**Ví dụ utilities**:
```javascript
// utils/formatters.js
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  // Implementation
};

export const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPhone = (phone) => {
  // Format phone number
};

// utils/validators.js
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|0)[3-9]\d{8}$/;
  return phoneRegex.test(phone);
};
```

---

## 🎯 Quy tắc và Best Practices

### 📝 Naming Conventions
- **Files**: PascalCase cho components, camelCase cho utilities
- **Folders**: PascalCase cho components, camelCase cho others
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### 📁 File Organization
```javascript
// ✅ Good
components/
├── Button/
│   ├── Button.jsx
│   ├── Button.test.js
│   ├── Button.stories.js
│   ├── Button.module.css
│   └── index.js

// ❌ Bad
components/
├── button.jsx
├── ButtonComponent.jsx
├── btn.jsx
```

### 🔄 Import/Export Rules
```javascript
// ✅ Good - Absolute imports
import Button from 'components/Button';
import { formatDate } from 'utils/formatters';

// ❌ Bad - Relative imports
import Button from '../../components/Button';
import { formatDate } from '../../../utils/formatters';
```

### 🧹 Code Organization
```javascript
// ✅ Good - Component structure
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

const Button = ({ children, variant, onClick, disabled }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};

Button.defaultProps = {
  variant: 'primary',
  disabled: false
};

export default Button;
```

---

## 🚀 Workflow hàng ngày

### 1. Tạo component mới
```bash
# Tạo folder và files
mkdir src/components/NewComponent
touch src/components/NewComponent/NewComponent.jsx
touch src/components/NewComponent/NewComponent.module.css
touch src/components/NewComponent/index.js
```

### 2. Tạo feature mới
```bash
# Tạo cấu trúc feature
mkdir src/features/newFeature
mkdir src/features/newFeature/components
mkdir src/features/newFeature/hooks
mkdir src/features/newFeature/services
touch src/features/newFeature/index.js
```

### 3. Thêm page mới
```bash
# Tạo page component
touch src/pages/NewPage.jsx
# Thêm route trong App.js
```

---

## 📞 Hỗ trợ và góp ý

Nếu bạn có câu hỏi về cấu trúc dự án hoặc muốn đề xuất cải tiến, hãy:
1. 💬 Tạo discussion trong team chat
2. 📝 Tạo issue trong repository
3. 🔄 Đề xuất qua pull request

---

## 📚 Tài liệu tham khảo

- [React Best Practices](https://react.dev/learn)
- [React Router Documentation](https://reactrouter.com/)
- [CSS Modules Guide](https://github.com/css-modules/css-modules)
- [ESLint React Rules](https://github.com/jsx-eslint/eslint-plugin-react)

---

*Tài liệu này được cập nhật thường xuyên. Vui lòng check version mới nhất.*