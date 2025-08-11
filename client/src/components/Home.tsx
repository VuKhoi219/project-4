import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Home.css';

// Interface cho quiz
interface QuizCategory {
  id: number;
  title: string;
  description: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎯' },
    { id: 'science', name: 'Khoa học', icon: '🔬' },
    { id: 'history', name: 'Lịch sử', icon: '📚' },
    { id: 'geography', name: 'Địa lý', icon: '🌍' },
    { id: 'sports', name: 'Thể thao', icon: '⚽' },
    { id: 'entertainment', name: 'Giải trí', icon: '🎬' },
    { id: 'art', name: 'Nghệ thuật', icon: '🎨' },
    { id: 'technology', name: 'Công nghệ', icon: '💻' },
    { id: 'literature', name: 'Văn học', icon: '📖' },
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await apiService.fetchQuizzes(page);
        if (response.success) {
          // Ép kiểu response.data.content thành QuizCategory[]
          const quizzesFromApi = response.data.content as unknown as QuizCategory[];
          setQuizzes(prev => [...prev, ...quizzesFromApi]);
          setTotalPages(response.data.totalPages);
        } else {
          setError(response.error || 'Không thể lấy danh sách quiz');
        }
      } catch (err) {
        setError('Lỗi kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [page]);

  const handleQuizClick = (quizId: number) => {
    navigate(`/quiz/${quizId}/join`);
  };

  const handleLoadMore = () => {
    if (page + 1 < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>QUIZ<span>.com</span></h1>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          <div className="header-actions">
            <button className="create-quiz-btn">Tạo quiz</button>
            <button className="login-btn">Đăng nhập</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-card create-quiz">
            <div className="hero-card-content">
              <h2>Tạo một quiz</h2>
              <p>Dễ dàng tạo quiz trong vài phút</p>
              <button className="hero-btn primary">Bắt đầu tạo</button>
            </div>
            <div className="hero-illustration">🎯</div>
          </div>
          <div className="hero-card ai-quiz">
            <div className="hero-card-content">
              <h2>A.I.</h2>
              <p>Tạo quiz với trí tuệ nhân tạo</p>
              <button className="hero-btn secondary">Thử ngay</button>
            </div>
            <div className="hero-illustration">🤖</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Danh mục</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="quizzes-section">
        <div className="container">
          <h2 className="section-title">Quiz nổi bật</h2>
          {loading && <p>Đang tải...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && filteredQuizzes.length === 0 && (
            <p>Không tìm thấy quiz nào</p>
          )}
          <div className="quizzes-grid">
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="quiz-card"
                onClick={() => handleQuizClick(quiz.id)}
              >
                <div className="quiz-image-container">
                  <img
                    src="https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg"
                    alt={quiz.title}
                    className="quiz-image"
                  />
                  <div className="quiz-overlay">
                    <button className="play-btn">▶️ Chơi ngay</button>
                  </div>
                </div>
                <div className="quiz-info">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                </div>
              </div>
            ))}
          </div>
          {!loading && page + 1 < totalPages && (
            <button className="load-more-btn" onClick={handleLoadMore}>
              Tải thêm
            </button>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>QUIZ.com</h3>
              <p>Nền tảng quiz trực tuyến hàng đầu</p>
            </div>
            <div className="footer-section">
              <h4>Sản phẩm</h4>
              <ul>
                <li><a href="#">Tạo quiz</a></li>
                <li><a href="#">Quiz AI</a></li>
                <li><a href="#">Phân tích</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><a href="#">Trung tâm trợ giúp</a></li>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Cộng đồng</h4>
              <ul>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Diễn đàn</a></li>
                <li><a href="#">Sự kiện</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;