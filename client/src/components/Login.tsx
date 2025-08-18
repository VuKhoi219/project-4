import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Hãy đảm bảo bạn đã tạo file Auth.css mới này trong cùng thư mục styles
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Xóa lỗi cũ khi submit
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      const { data } = res.data;
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-placeholder">Your logo</div>
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="text"
            name="username" // Giữ nguyên 'username' để không thay đổi logic
            value={formData.username}
            onChange={handleChange}
            placeholder="username@gmail.com"
          />

          <label htmlFor="password-input">Password</label>
          <div className="password-wrapper">
            <input
              id="password-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>
          <a href="#" className="forgot-password">Forgot Password?</a>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
           {/* Thông báo lỗi hiển thị ngay dưới nút */}
          {error && <p className="error-message">{error}</p>}
        </form>

        {/* Chức năng đăng nhập bằng mạng xã hội sẽ được thêm sau
        <div className="separator">or continue with</div>*/}

        
        {/* Mạng xã hội – đăng nhập bằng Google/GitHub/Facebook
<div className="social-login">
  <button className="btn-social" aria-label="Log in with Google">
    <img src="/google.png" alt="Google" />
  </button>
  <button className="btn-social" aria-label="Log in with GitHub">
    <img src="https://i.ibb.co/bJC2S1m/github-mark-white.png" alt="GitHub" />
  </button>
  <button className="btn-social" aria-label="Log in with Facebook">
    <img src="/facebook.png" alt="Facebook" />
  </button>
</div>
*/}

        <p className="register-link">
          Don't have an account yet? <Link to="/register">Register for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;