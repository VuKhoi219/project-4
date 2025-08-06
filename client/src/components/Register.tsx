import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);

      if (response.data?.success) {
        navigate('/login'); // Đăng ký thành công → chuyển đến trang đăng nhập
      } else {
        setError(response.data?.message || 'Đăng ký thất bại');
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Lỗi đăng ký:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
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
            <Link to="/login">
              <button className="create-quiz-btn">Đăng nhập</button>
            </Link>
          </div>
        </div>
      </header>

      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <h2 className="section-title">Đăng ký</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
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
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </div>
            </form>
            <p className="auth-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
