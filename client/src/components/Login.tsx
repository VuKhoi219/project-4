import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Hãy đảm bảo bạn đã tạo file Auth.css mới này trong cùng thư mục styles
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const baseApi = process.env.REACT_APP_API_BACKEND || "http://api.quizai.edu.vn"

  // Kiểm tra xem có quiz pending để share không
  const [pendingQuizMessage, setPendingQuizMessage] = useState('');

  useEffect(() => {
    // Kiểm tra xem có quiz đang chờ share không
    const pendingQuizId = localStorage.getItem('pendingShareQuizId');
    const shouldReturnToQuiz = localStorage.getItem('returnToQuizAfterLogin');
    const lastSavedQuizId = localStorage.getItem('lastSavedQuizId');
    
    if ((pendingQuizId && shouldReturnToQuiz === 'true') || lastSavedQuizId) {
      setPendingQuizMessage('Đăng nhập để tiếp tục share quiz của bạn!');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Xóa lỗi cũ khi submit
    
    try {
      const res = await axios.post(
        `${baseApi}/api/auth/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const { data } = res.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username); 
      // Kiểm tra xem có cần redirect về quiz không
      const pendingQuizId = localStorage.getItem('pendingShareQuizId');
      const shouldReturnToQuiz = localStorage.getItem('returnToQuizAfterLogin');
      const lastSavedQuizId = localStorage.getItem('lastSavedQuizId');
      console.log("Pending Quiz ID:", pendingQuizId);
      console.log("Should Return to Quiz:", shouldReturnToQuiz);
      console.log("Last Saved Quiz ID:", lastSavedQuizId);
      if (pendingQuizId && shouldReturnToQuiz === 'true') {
        // Có quiz pending, redirect về trang GenQuiz để tiếp tục share
        navigate('/quiz/generate');
      } else if (lastSavedQuizId) {
        // Có quiz đã lưu, redirect về quiz detail
        navigate(`/quiz/${lastSavedQuizId}`);
      } else {
        // Không có quiz pending, về trang chủ
        navigate('/');
      }
    } catch (err: any) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-placeholder">QUIZ .AI</div>
        <h1>Login</h1>
        
        {/* Hiển thị thông báo về quiz pending nếu có */}
        {pendingQuizMessage && (
          <div className="pending-quiz-message">
            <div className="quiz-icon">📝</div>
            <p>{pendingQuizMessage}</p>
          </div>
        )}

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
            {loading ? 'Signing in...' : pendingQuizMessage ? 'Sign in to continue' : 'Sign in'}
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