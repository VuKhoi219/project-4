import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { Brain, Zap, Users, BarChart3, Download, Smartphone, CheckCircle, Play, Menu, X, Search } from 'lucide-react';
import styles from '../styles/Home.module.css';

interface QuizCategory {
  id: number;
  title: string;
  description: string;
  ascended: true;
  thumbnailUrl?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamePin, setGamePin] = useState('');

  const categories = [
    { id: 'start', name: 'Trang chủ', icon: '🏠' },
    { id: 'art', name: 'Nghệ thuật', icon: '🎨' },
    { id: 'entertainment', name: 'Giải trí', icon: '⭐' },
    { id: 'geography', name: 'Địa lý', icon: '🌍' },
    { id: 'history', name: 'Lịch sử', icon: '🏛️' },
    { id: 'languages', name: 'Ngôn ngữ', icon: '💬' },
    { id: 'science', name: 'Khoa học', icon: '🔬' },
    { id: 'sports', name: 'Thể thao', icon: '🏀' },
    { id: 'trivia', name: 'Tổng hợp', icon: '💡' },
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await apiService.fetchQuizzes(0);
        if (response.success) {
          const quizzesFromApi = response.data.content as unknown as QuizCategory[];
          setQuizzes(quizzesFromApi);
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
  }, [activeCategory]);

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
    <div className={styles['home-container']}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles['logo-text']}>QUIZ</span>.com
        </div>
        <div className={styles['join-game-container']}>
          <strong>Tham gia quiz:</strong>
          <input
            type="text"
            placeholder="Nhập mã PIN"
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            className={styles['pin-input']}
          />
        </div>
        <div className={styles['header-actions']}>
          <button
            className={styles['sign-in-btn']}
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>
          <button
            className={styles['mobile-menu-toggle']}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className={styles['mobile-menu']}>
            <div className={styles['join-game-container']}>
              <strong>Tham gia quiz:</strong>
              <input
                type="text"
                placeholder="Nhập mã PIN"
                value={gamePin}
                onChange={(e) => setGamePin(e.target.value)}
                className={styles['pin-input']}
              />
            </div>
          </div>
        )}
      </header>

      {/* Categories */}
      <nav className={styles['categories-nav']}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles['category-btn']} ${activeCategory === category.id ? styles.active : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <div className={styles['category-icon']}>{category.icon}</div>
            <div>{category.name}</div>
          </button>
        ))}
      </nav>

      <main className="px-8">
        {/* Hero Section */}
        <section className={styles['hero-section']}>
          <div className={styles['hero-card']}>
            <div className={styles['hero-illustration']}>✍️</div>
            <h2 className={styles['hero-title']}>Tạo quiz</h2>
            <p className={styles['hero-description']}>Tạo quiz thủ công với giao diện đơn giản, dễ sử dụng</p>
            <button
              className={styles['hero-btn-green']}
              onClick={() => navigate('/quiz/new')}
            >
              Quiz editor
            </button>
          </div>
          <div className={styles['hero-card']}>
            <div className={styles['hero-illustration']}>🤖</div>
            <h2 className={styles['hero-title']}>AI Generator</h2>
            <p className={styles['hero-description']}>Tạo quiz tự động từ chủ đề hoặc file PDF</p>
            <button
              className={styles['hero-btn-blue']}
              onClick={() => navigate('/quiz/generate')}
            >
              Quiz generator
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles['features-section']}>
          <h2 className={styles['section-title']}>Tính năng nổi bật</h2>
          <div className={styles['features-grid']}>
            {[
              {
                icon: <Zap className="w-6 h-6 text-indigo-600" />,
                title: 'Tạo quiz tự động',
                description: 'AI tự động đề xuất câu hỏi và đáp án chỉ từ tiêu đề bạn nhập, tiết kiệm thời gian soạn bài.'
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                title: 'Chế độ nhóm/lớp học',
                description: 'Tạo phòng quiz để học sinh tham gia và làm bài trực tuyến, tự động chấm điểm.'
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
                title: 'Phân tích kết quả',
                description: 'Thống kê chi tiết kết quả làm bài của học viên, giúp đánh giá hiệu quả giảng dạy.'
              },
              {
                icon: <Download className="w-6 h-6 text-indigo-600" />,
                title: 'Xuất file Word/PDF',
                description: 'Tải quiz về máy dưới dạng file Word hoặc PDF để in ấn hoặc chỉnh sửa thêm.'
              },
              {
                icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
                title: 'Hỗ trợ đa nền tảng',
                description: 'Sử dụng trên mọi thiết bị: máy tính, điện thoại, tablet với giao diện tối ưu.'
              },
              {
                icon: <Brain className="w-6 h-6 text-indigo-600" />,
                title: 'Tạo quiz từ ảnh',
                description: 'Upload ảnh chụp tài liệu hoặc sách, AI sẽ phân tích nội dung và tự động tạo quiz.'
              }
            ].map((feature, index) => (
              <div key={index} className={styles['feature-card']}>
                <div className="flex items-center mb-4">
                  <div className={styles['feature-icon-container']}>{feature.icon}</div>
                  <h3 className={styles['feature-title']}>{feature.title}</h3>
                </div>
                <p className={styles['feature-description']}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles['benefits-section']}>
          <div className={styles['benefits-container']}>
            <div className={styles['benefits-text']}>
              <h2 className={styles['section-title']}>Lợi ích khi sử dụng Quiz AI</h2>
              <div className="space-y-4">
                {[
                  'Tiết kiệm thời gian tạo quiz từ 70-90% so với cách thủ công',
                  'Chất lượng câu hỏi cao, đa dạng loại câu hỏi (trắc nghiệm, tự luận ngắn)',
                  'Dễ dàng chia sẻ quiz với bạn bè, học sinh qua link hoặc mạng xã hội',
                  'Phù hợp với nhiều đối tượng từ học sinh, sinh viên đến giáo viên',
                  'Hỗ trợ nhiều môn học từ khoa học tự nhiên đến xã hội, ngoại ngữ'
                ].map((benefit, index) => (
                  <div key={index} className={styles['benefit-item']}>
                    <CheckCircle className={styles['benefit-icon']} />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles['benefits-image-container']}>
              <img
                src="https://via.placeholder.com/500x350/f3f4f6/6366f1?text=Quiz+AI+Benefits"
                alt="Quiz AI Benefits"
                className={styles['benefits-image']}
              />
            </div>
          </div>
        </section>

        {/* Quizzes Section */}
        <section className={styles['quizzes-section']}>
          <h2 className={styles['section-title']}>Quiz được tạo gần đây</h2>
          <div className={styles['search-container']}>
            <Search className={styles['search-icon']} />
            <input
              type="text"
              placeholder="Tìm kiếm quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles['search-input']}
            />
          </div>
          {loading && (
            <div className={styles.loading}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4">Đang tải...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>{error}</div>
          )}
          {!loading && !error && filteredQuizzes.length === 0 && (
            <div className="text-center py-12 text-gray-600">Không tìm thấy quiz nào</div>
          )}
          <div className={styles['quizzes-grid']}>
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className={styles['quiz-card']}
                onClick={() => handleQuizClick(quiz.id)}
              >
                <img
                  src={quiz.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={quiz.title}
                  className={styles['quiz-image']}
                />
                <h3 className={styles['quiz-title']}>{quiz.title}</h3>
                <p className={styles['quiz-description']}>{quiz.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience Section */}
        <section className={styles['audience-section']}>
          <h2 className={styles['section-title']}>Đối tượng sử dụng</h2>
          <div className={styles['audience-grid']}>
            {[
              {
                icon: '👨‍🏫',
                title: 'Giáo viên',
                description: 'Tạo bài kiểm tra nhanh chóng, thiết kế đề cương ôn tập, bài tập về nhà cho học sinh với nhiều dạng câu hỏi khác nhau.'
              },
              {
                icon: '👨‍🎓',
                title: 'Học sinh',
                description: 'Tự tạo quiz để ôn tập kiến thức, kiểm tra mức độ hiểu bài trước khi thi, học nhóm với bạn bè.'
              },
              {
                icon: '🎓',
                title: 'Sinh viên',
                description: 'Tạo bộ câu hỏi ôn thi, thẻ ghi nhớ (flashcards) từ tài liệu học, chia sẻ với nhóm học tập.'
              },
              {
                icon: '🏢',
                title: 'Trung tâm đào tạo',
                description: 'Xây dựng ngân hàng câu hỏi, đề thi đầu vào, kiểm tra định kỳ cho học viên với giao diện chuyên nghiệp.'
              },
              {
                icon: '📚',
                title: 'Người tự học',
                description: 'Tạo quiz từ tài liệu học tập cá nhân, kiểm tra kiến thức sau mỗi bài học, theo dõi tiến độ học tập.'
              }
            ].map((audience, index) => (
              <div key={index} className={styles['audience-card']}>
                <div className="flex items-center mb-4">
                  <div className={styles['audience-icon']}>{audience.icon}</div>
                  <h3 className={styles['audience-title']}>{audience.title}</h3>
                </div>
                <p className={styles['audience-description']}>{audience.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles['cta-section']}>
          <h2 className={styles['cta-title']}>Sẵn sàng tạo quiz với AI?</h2>
          <p className={styles['cta-description']}>
            Đăng ký ngay để trải nghiệm công cụ tạo quiz thông minh giúp bạn tiết kiệm thời gian và nâng cao hiệu quả học tập, giảng dạy.
          </p>
          <button
            className={styles['cta-btn']}
            onClick={() => navigate('/register')}
          >
            Dùng thử miễn phí ngay
          </button>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles['footer-grid']}>
            <div className="md:col-span-1">
              <div className={styles['footer-logo']}>
                <Brain className="w-8 h-8 text-indigo-400" />
                <span className={styles['footer-logo-text']}>Quiz AI</span>
              </div>
              <p className={styles['footer-description']}>
                Công cụ tạo quiz thông minh bằng trí tuệ nhân tạo dành cho giáo dục và đào tạo.
              </p>
            </div>
            <div>
              <h4 className={styles['footer-heading']}>Liên kết</h4>
              <ul className={styles['footer-links']}>
                <li><a href="#" className={styles['footer-links']}>Trang chủ</a></li>
                <li><a href="#" className={styles['footer-links']}>Tính năng</a></li>
                <li><a href="#" className={styles['footer-links']}>Giá cả</a></li>
                <li><a href="#" className={styles['footer-links']}>Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className={styles['footer-heading']}>Hỗ trợ</h4>
              <ul className={styles['footer-links']}>
                <li><a href="#" className={styles['footer-links']}>Trung tâm trợ giúp</a></li>
                <li><a href="#" className={styles['footer-links']}>Hướng dẫn sử dụng</a></li>
                <li><a href="#" className={styles['footer-links']}>Câu hỏi thường gặp</a></li>
              </ul>
            </div>
            <div>
              <h4 className={styles['footer-heading']}>Liên hệ</h4>
              <ul className={styles['footer-links']}>
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  support@quizaiapp.com
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📞</span>
                  1900 1234
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  Tòa nhà A, 123 Đường ABC, Hà Nội
                </li>
              </ul>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <p>© 2023 Quiz AI. All rights reserved.</p>
            <div className={styles['footer-bottom-links']}>
              <a href="#" className={styles['footer-links']}>Điều khoản</a>
              <a href="#" className={styles['footer-links']}>Chính sách bảo mật</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;