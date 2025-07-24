# 📁 Cấu trúc thư mục dự án React TypeScript

## 🎯 Mục đích tài liệu
Tài liệu này giúp các thành viên trong team hiểu rõ cấu trúc thư mục, quy ước đặt tên và cách tổ chức code trong dự án React TypeScript của chúng ta.

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
├── types/          # TypeScript type definitions
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
│   ├── Button.tsx
│   ├── Button.module.css
│   ├── Button.types.ts
│   └── index.ts
├── Modal/
├── Input/
└── Navigation/
```

**Quy tắc đặt tên**:
- Folder: PascalCase (`Button`, `NavBar`)
- File component: PascalCase (`Button.tsx`)
- Types file: PascalCase (`Button.types.ts`)
- Export default qua `index.ts`

**Ví dụ component**:
```tsx
// components/Button/Button.types.ts
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

// components/Button/Button.tsx
import React from 'react';
import { ButtonProps } from './Button.types';
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick, 
  disabled = false,
  loading = false,
  className = '' 
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;

// components/Button/index.ts
export { default } from './Button';
export type { ButtonProps } from './Button.types';
```

---

### 🔢 `/types`
**Mục đích**: Chứa tất cả TypeScript type definitions

**Nội dung**:
- 🏗️ Global types
- 📊 API response types
- 🔧 Utility types
- 📝 Enum definitions

**Ví dụ cấu trúc**:
```
types/
├── index.ts         # Re-export tất cả types
├── api.types.ts     # API related types
├── user.types.ts    # User related types
├── common.types.ts  # Common/shared types
└── enums.ts         # Enum definitions
```

**Ví dụ types**:
```typescript
// types/common.types.ts
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// types/user.types.ts
import { BaseEntity } from './common.types';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserProfile {
  user: User;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// types/enums.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// types/index.ts
export * from './common.types';
export * from './user.types';
export * from './api.types';
export * from './enums';
```

---

### 🌐 `/context`
**Mục đích**: Quản lý state toàn cục bằng Context API với TypeScript

**Khi nào sử dụng**:
- 🔄 Dữ liệu cần chia sẻ giữa nhiều component
- 👤 Thông tin user authentication
- 🛒 Shopping cart state
- 🌙 Theme/Dark mode

**Ví dụ cấu trúc**:
```
context/
├── AuthContext.tsx
├── ThemeContext.tsx
├── CartContext.tsx
└── index.ts
```

**Ví dụ implementation**:
```tsx
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // API call logic
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    // Clear localStorage, redirect, etc.
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
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
├── constants.ts
├── mockData.ts
├── models/
│   ├── User.ts
│   └── Product.ts
└── config.ts
```

**Ví dụ sử dụng**:
```typescript
// data/constants.ts
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;

// data/mockData.ts
import { User, Product } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
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
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── services/
│   │   └── authService.ts
│   ├── types/
│   │   └── auth.types.ts
│   └── index.ts
├── dashboard/
└── profile/
```

**Ví dụ feature implementation**:
```typescript
// features/authentication/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// features/authentication/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { LoginRequest, AuthResponse } from '../types/auth.types';
import { authService } from '../services/authService';

export const useAuthFeature = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    isLoading,
    error
  };
};
```

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
├── HomePage.tsx
├── AboutPage.tsx
├── ContactPage.tsx
├── ProductPage.tsx
└── NotFoundPage.tsx
```

**Ví dụ page component**:
```tsx
// pages/HomePage.tsx
import React from 'react';
import Hero from '../components/Hero';
import ProductList from '../features/products/components/ProductList';
import Newsletter from '../components/Newsletter';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
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
├── useApi.ts
├── useLocalStorage.ts
├── useDebounce.ts
└── useForm.ts
```

**Ví dụ custom hook**:
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

export const useLocalStorage = <T>(key: string, initialValue: T): [T, SetValue<T>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiStatus } from '../types';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  status: ApiStatus;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(apiFunction: (...args: any[]) => Promise<T>): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    status: ApiStatus.IDLE
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, status: ApiStatus.LOADING, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState({
        data: result,
        error: null,
        status: ApiStatus.SUCCESS
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        error: errorMessage,
        status: ApiStatus.ERROR
      });
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      status: ApiStatus.IDLE
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
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
├── MainLayout.tsx
├── AuthLayout.tsx
├── DashboardLayout.tsx
├── types/
│   └── layout.types.ts
└── components/
    ├── Header.tsx
    ├── Footer.tsx
    └── Sidebar.tsx
```

**Ví dụ layout**:
```tsx
// layouts/types/layout.types.ts
import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

export interface MainLayoutProps extends LayoutProps {
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
}

// layouts/MainLayout.tsx
import React from 'react';
import { MainLayoutProps } from './types/layout.types';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showSidebar = false,
  sidebarCollapsed = false 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        {showSidebar && (
          <Sidebar collapsed={sidebarCollapsed} />
        )}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
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
├── axios.ts
├── validation.ts
├── theme.ts
└── analytics.ts
```

**Ví dụ config**:
```typescript
// lib/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    this.instance = axios.create({
      baseURL: config.baseURL || process.env.REACT_APP_API_URL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
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
│   ├── authApi.ts
│   ├── userApi.ts
│   └── productApi.ts
├── payment/
│   └── stripeService.ts
├── types/
│   └── service.types.ts
└── index.ts
```

**Ví dụ service**:
```typescript
// services/types/service.types.ts
export interface ApiService<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

// services/api/userApi.ts
import { User, ApiResponse, PaginatedResponse, PaginationParams } from '../../types';
import { apiClient } from '../../lib/axios';
import { ApiService } from '../types/service.types';

export class UserApiService implements Partial<ApiService<User>> {
  private readonly basePath = '/users';

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/user/profile');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/user/profile', data);
    return response.data.data;
  }

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(this.basePath, {
      params
    });
    return response.data;
  }

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(this.basePath, userData);
    return response.data.data;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export const userApi = new UserApiService();
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
  
  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-base);
  line-height: var(--line-height-base);
  color: var(--dark-color);
  font-size: var(--font-size-base);
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }
.mb-xl { margin-bottom: var(--spacing-xl); }
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
├── formatters.ts
├── validators.ts
├── helpers.ts
├── constants.ts
└── types.ts
```

**Ví dụ utilities**:
```typescript
// utils/formatters.ts
export const formatDate = (
  date: string | Date, 
  format: string = 'DD/MM/YYYY'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Simple implementation - in real project use date-fns or dayjs
  return dateObj.toLocaleDateString('vi-VN');
};

export const formatCurrency = (
  amount: number, 
  currency: string = 'VND'
): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPhone = (phone: string): string => {
  // Format Vietnamese phone number
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

// utils/validators.ts
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|0)[3-9]\d{8}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// utils/helpers.ts
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// utils/storage.ts
export class LocalStorageService {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
```

---

## 🎯 Quy tắc và Best Practices

### 📝 Naming Conventions
- **Files**: PascalCase cho components (`Button.tsx`), camelCase cho utilities (`formatters.ts`)
- **Folders**: PascalCase cho components, camelCase cho others
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase với suffix thích hợp (`UserProps`, `ApiResponse`)

### 📁 File Organization
```typescript
// ✅ Good
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   ├── Button.module.css
│   └── index.ts

// ❌ Bad
components/
├── button.tsx
├── ButtonComponent.tsx
├── btn.tsx
```

### 🔄 Import/Export Rules
```typescript
// ✅ Good - Absolute imports với path mapping
import Button from 'components/Button';
import { formatDate } from 'utils/formatters';
import { User } from 'types';

// ❌ Bad - Relative imports
import Button from '../../components/Button';
import { formatDate } from '../../../utils/formatters';

// tsconfig.json path mapping
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "components/*": ["components/*"],
      "utils/*": ["utils/*"],
      "types/*": ["types/*"],
      "hooks/*": ["hooks/*"],
      "services/*": ["services/*"]
    }
  }
}
```

### 🏗️ TypeScript Best Practices
```typescript
// ✅ Good - Interface cho props
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}

// ✅ Good - Generic types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ✅ Good - Union types
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ Good - Utility types
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserRequest = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>;

// ❌ Bad - Using any
const handleData = (data: any) => {
  // Logic here
};

// ✅ Good - Proper typing
const handleData = <T>(data: T): T => {
  // Logic here
  return data;
};
```

### 🧹 Component Best Practices
```tsx
// ✅ Good - Proper component structure
import React, { useState, useCallback, useMemo } from 'react';
import { ButtonProps } from './Button.types';
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  loading = false,
  ...rest 
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [disabled, loading, onClick]);

  const buttonClasses = useMemo(() => [
    styles.button,
    styles[variant],
    loading && styles.loading,
    disabled && styles.disabled
  ].filter(Boolean).join(' '), [variant, loading, disabled]);

  return (
    <button 
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      type="button"
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
```

---

## 🚀 Workflow hàng ngày

### 1. Tạo component mới
```bash
# Tạo folder và files
mkdir src/components/NewComponent
touch src/components/NewComponent/NewComponent.tsx
touch src/components/NewComponent/NewComponent.types.ts
touch src/components/NewComponent/NewComponent.module.css
touch src/components/NewComponent/index.ts
```

### 2. Tạo feature mới
```bash
# Tạo cấu trúc feature
mkdir src/features/newFeature
mkdir src/features/newFeature/components
mkdir src/features/newFeature/hooks
mkdir src/features/newFeature/services
mkdir src/features/newFeature/types
touch src/features/newFeature/index.ts
```

### 3. Thêm page mới
```bash
# Tạo page component
touch src/pages/NewPage.tsx
# Thêm route trong App.tsx
```

### 4. Thêm types mới
```bash
# Tạo type definition
touch src/types/newFeature.types.ts
# Update src/types/index.ts để export
```

---

## 📋 TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "components/*": ["components/*"],
      "pages/*": ["pages/*"],
      "utils/*": ["utils/*"],
      "hooks/*": ["hooks/*"],
      "services/*": ["services/*"],
      "types/*": ["types/*"],
      "contexts/*": ["contexts/*"],
      "features/*": ["features/*"],
      "layouts/*": ["layouts/*"],
      "assets/*": ["assets/*"]
    }
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

## 🔧 Development Tools

### ESLint + Prettier Configuration
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## 📞 Hỗ trợ và góp ý

Nếu bạn có câu hỏi về cấu trúc dự án hoặc muốn đề xuất cải tiến, hãy:
1. 💬 Tạo discussion trong team chat
2. 📝 Tạo issue trong repository
3. 🔄 Đề xuất qua pull request

---

## 📚 Tài liệu tham khảo

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [CSS Modules with TypeScript](https://github.com/css-modules/css-modules)

---

*Tài liệu này được cập nhật thường xuyên. Vui lòng check version mới nhất.*
