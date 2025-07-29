import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

// Export để tránh lỗi isolatedModules
// export {};

interface QuizCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  questionCount: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎯' },
    { id: 'science', name: 'Khoa học', icon: '🔬' },
    { id: 'history', name: 'Lịch sử', icon: '📚' },
    { id: 'geography', name: 'Địa lý', icon: '🌍' },
    { id: 'sports', name: 'Thể thao', icon: '⚽' },
    { id: 'entertainment', name: 'Giải trí', icon: '🎬' },
    { id: 'art', name: 'Nghệ thuật', icon: '🎨' },
    { id: 'technology', name: 'Công nghệ', icon: '💻' },
    { id: 'literature', name: 'Văn học', icon: '📖' }
  ];

  const featuredQuizzes: QuizCategory[] = [
    {
      id: 'science-basics',
      title: 'Khoa học cơ bản',
      description: 'Kiểm tra kiến thức khoa học tổng quát của bạn',
      image: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg',
      category: 'science',
      difficulty: 'Trung bình',
      questionCount: 15
    },
    {
      id: 'world-history',
      title: 'Lịch sử thế giới',
      description: 'Khám phá những sự kiện lịch sử quan trọng',
      image: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg',
      category: 'history',
      difficulty: 'Khó',
      questionCount: 20
    },
    {
      id: 'world-capitals',
      title: 'Thủ đô các nước',
      description: 'Bạn biết bao nhiêu thủ đô trên thế giới?',
      image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg',
      category: 'geography',
      difficulty: 'Dễ',
      questionCount: 25
    },
    {
      id: 'football-legends',
      title: 'Huyền thoại bóng đá',
      description: 'Câu hỏi về những huyền thoại bóng đá thế giới',
      image: 'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg',
      category: 'sports',
      difficulty: 'Trung bình',
      questionCount: 18
    },
    {
      id: 'movie-classics',
      title: 'Phim kinh điển',
      description: 'Thử thách về những bộ phim nổi tiếng',
      image: 'https://images.pexels.com/photos/918281/pexels-photo-918281.jpeg',
      category: 'entertainment',
      difficulty: 'Trung bình',
      questionCount: 22
    },
    {
      id: 'famous-paintings',
      title: 'Tranh nổi tiếng',
      description: 'Nhận biết các tác phẩm nghệ thuật kinh điển',
      image: 'https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg',
      category: 'art',
      difficulty: 'Khó',
      questionCount: 16
    },
    {
id: 'programming-basics',
      title: 'Lập trình cơ bản',
      description: 'Kiến thức cơ bản về lập trình máy tính',
      image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
      category: 'technology',
      difficulty: 'Trung bình',
      questionCount: 20
    },
    {
      id: 'classic-literature',
      title: 'Văn học kinh điển',
      description: 'Những tác phẩm văn học bất hủ',
      image: 'https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg',
      category: 'literature',
      difficulty: 'Khó',
      questionCount: 19
    },
    {
      id: 'space-exploration',
      title: 'Khám phá vũ trụ',
      description: 'Hành trình khám phá không gian vũ trụ',
      image: 'https://images.pexels.com/photos/2156/sky-earth-space-working.jpg',
      category: 'science',
      difficulty: 'Khó',
      questionCount: 24
    }
  ];

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}/join`);
  };

  const filteredQuizzes = featuredQuizzes.filter(quiz => {
    const matchesCategory = activeCategory === 'all' || quiz.category === activeCategory;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return '#4ade80';
      case 'Trung bình': return '#f59e0b';
      case 'Khó': return '#ef4444';
      default: return '#6b7280';
    }
  };

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
          <h2 className="section-title">
            {activeCategory === 'all' ? 'Quiz nổi bật' : `Quiz ${categories.find(c => c.id === activeCategory)?.name}`}
          </h2>
          <div className="quizzes-grid">
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="quiz-card"
                onClick={() => handleQuizClick(quiz.id)}
              >
                <div className="quiz-image-container">
                  <img src={quiz.image} alt={quiz.title} className="quiz-image" />
                  <div className="quiz-overlay">
                    <button className="play-btn">▶️ Chơi ngay</button>
                  </div>
                </div>
                <div className="quiz-info">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <p className="quiz-description">{quiz.description}</p>
                  <div className="quiz-meta">
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                    >
                      {quiz.difficulty}
                    </span>
                    <span className="question-count">{quiz.questionCount} câu hỏi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1,234</div>
              <div className="stat-label">Quiz đã tạo</div>
            </div>
            <div className="stat-item">
<div className="stat-number">56,789</div>
              <div className="stat-label">Lượt chơi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">12,345</div>
              <div className="stat-label">Người chơi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
          <div className="footer-bottom">
            <p>&copy; 2024 QUIZ.com. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;