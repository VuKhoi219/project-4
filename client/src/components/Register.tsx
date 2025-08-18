import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Giao diện này sử dụng cùng một tệp CSS với trang Login
import '../styles/Auth.css';

interface RegisterForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIC GIỮ NGUYÊN ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      if (res.data?.success) {
        navigate('/login');
      } else {
        setError(res.data?.message || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  // --- KẾT THÚC PHẦN LOGIC ---

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-placeholder">Your logo</div>
        <h1>Create Account</h1>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName-input">Full Name</label>
          <input
            id="fullName-input"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="username-input">Username</label>
          <input
            id="username-input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />

          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>

          {/* Thông báo lỗi hiển thị ngay dưới nút */}
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="register-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;