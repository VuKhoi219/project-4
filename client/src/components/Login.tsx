import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: formData.username,
        password: formData.password,
      });

      const { data } = response.data;
      // Assuming the backend returns a token in AuthenticationResponse
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);

      navigate('/'); // Redirect to home page after successful login
    } catch (err: any) {
      setLoading(false);
      if (err.response?.data?.error) {
        setError(err.response.data.message || 'Đăng nhập thất bại');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="auth-page">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>QUIZ<span>.com</span></h1>
          </div>
          <div className="header-actions">
            <Link to="/register">
              <button className="create-quiz-btn">Đăng ký</button>
            </Link>
          </div>
        </div>
      </header>

      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <h2 className="section-title">Đăng nhập</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email hoặc Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập email hoặc tên đăng nhập"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  className="input-field"
                  required
                />
              </div>
              <div className="actions">
                <button
                  type="submit"
                  className={`action-btn submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </div>
            </form>
            <p className="auth-link">
              Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;