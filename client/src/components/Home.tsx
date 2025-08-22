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

interface HotQuiz {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [mySearchQuery, setMySearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizCategory[]>([]);
  const [hotQuizzes, setHotQuizzes] = useState<HotQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotQuizzesLoading, setHotQuizzesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotQuizzesError, setHotQuizzesError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamePin, setGamePin] = useState('');
  const [myQuizzes, setMyQuizzes] = useState<QuizCategory[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [myError, setMyError] = useState<string | null>(null);
  const [myPage, setMyPage] = useState(0);
  const [myTotalPages, setMyTotalPages] = useState(1);

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
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await apiService.fetchQuizzes(page);
        if (response.success) {
          const quizzesFromApi = response.data.content as unknown as QuizCategory[];
          setQuizzes(prev => page === 0 ? quizzesFromApi : [...prev, ...quizzesFromApi]);
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

    const fetchHotQuizzes = async () => {
      try {
        setHotQuizzesLoading(true);
        const response = await apiService.getQuizzesByQuiz();
        if (response.success) {
          const hotQuizzesFromApi = response.data as unknown as HotQuiz[];
          setHotQuizzes(hotQuizzesFromApi);
        } else {
          setHotQuizzesError(response.error || 'Không thể lấy danh sách quiz hot');
        }
      } catch (err) {
        setHotQuizzesError('Lỗi kết nối đến server');
      } finally {
        setHotQuizzesLoading(false);
      }
    };

    fetchQuizzes();
    fetchHotQuizzes();
  }, [activeCategory, page]);

  useEffect(() => {
    const fetchMyQuizzes = async () => {
      if (!username) return;
      try {
        setMyLoading(true);
        const response = await apiService.fetchMyQuizzes(myPage);
        if (response.success) {
          const myQuizzesFromApi = response.data.content as unknown as QuizCategory[];
          setMyQuizzes(prev => myPage === 0 ? myQuizzesFromApi : [...prev, ...myQuizzesFromApi]);
          setMyTotalPages(response.data.totalPages);
        } else {
          setMyError(response.error || 'Không thể lấy danh sách quiz của bạn');
        }
      } catch (err) {
        setMyError('Lỗi kết nối đến server');
      } finally {
        setMyLoading(false);
      }
    };
    fetchMyQuizzes();
  }, [myPage, username]);

  const handleQuizClick = (quizId: number) => {
    navigate(`/quiz/${quizId}/join`);
  };

  const handleLoadMore = () => {
    if (page + 1 < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleMyLoadMore = () => {
    if (myPage + 1 < myTotalPages) {
      setMyPage(prev => prev + 1);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyQuizzes = myQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(mySearchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(mySearchQuery.toLowerCase())
  );

  return (
    <div className={styles['home-container']}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles['logo-text']}>QUIZ</span>.AI
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
          {username ? (
  <div className={styles['user-menu']}>
    <button 
      onClick={() => setMenuOpen(!menuOpen)} 
      className={styles['user-btn']}
    >
      <span className={styles['user-icon']}>👤</span> {/* Avatar, có thể thay bằng img */}
      Xin chào, {username.length > 10 ? username.substring(0, 10) + "..." : username}
    </button>
    {menuOpen && (
      <div className={styles['dropdown']}>
        <button>
          🧑‍💼Hồ sơ
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            setUsername(null);
            navigate('/');
          }}
        >
          🚪Đăng xuất
        </button>
      </div>
    )}
  </div>
) : (
  <button
    className={styles['sign-in-btn']}
    onClick={() => navigate('/login')}
  >
    Đăng nhập
  </button>
)}
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
            <span className={styles['category-icon']}>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </nav>

      <main>
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
          <h2 className={styles['section-title']}>Tại sao nên chọn chúng tôi?</h2>
          <div className={styles['features-grid']}>
            {[
              {
                icon: <Brain className={styles['feature-icon']} />,
                title: 'Tạo Quiz bằng AI',
                description: 'Tự động tạo câu hỏi từ tài liệu hoặc chủ đề bất kỳ chỉ trong vài giây.'
              },
              {
                icon: <Users className={styles['feature-icon']} />,
                title: 'Chơi cùng bạn bè',
                description: 'Mời bạn bè tham gia quiz, thi đấu trực tuyến và xem bảng xếp hạng.'
              },
              {
                icon: <BarChart3 className={styles['feature-icon']} />,
                title: 'Theo dõi tiến độ',
                description: 'Xem thống kê chi tiết về kết quả học tập và cải thiện qua từng bài quiz.'
              },
              {
                icon: <CheckCircle className={styles['feature-icon']} />,
                title: 'Miễn phí & dễ dùng',
                description: 'Giao diện thân thiện, miễn phí sử dụng với nhiều tính năng cao cấp.'
              }
            ].map((feature, index) => (
              <div key={index} className={styles['feature-card']}>
                {feature.icon}
                <h3 className={styles['feature-title']}>{feature.title}</h3>
                <p className={styles['feature-description']}>{feature.description}</p>
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
                title: 'Học sinh & Sinh viên',
                description: 'Tự tạo quiz để ôn tập kiến thức, kiểm tra mức độ hiểu bài trước khi thi, học nhóm với bạn bè.'
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

        {/* Hot Quizzes Section */}
        <section className={styles['quizzes-section']}>
          <h2 className={styles['section-title']}>Quiz nổi bật</h2>
          {hotQuizzesLoading && (
            <div className={styles.loading}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4">Đang tải...</p>
            </div>
          )}
          {hotQuizzesError && (
            <div className={styles.error}>{hotQuizzesError}</div>
          )}
          {!hotQuizzesLoading && !hotQuizzesError && hotQuizzes.length === 0 && (
            <div className="text-center py-12 text-gray-600">Không có quiz nổi bật nào</div>
          )}
          <div className={styles['quizzes-grid']}>
            {hotQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className={styles['quiz-card']}
                onClick={() => handleQuizClick(quiz.id)}
              >
                <img
                  src={quiz.thumbnailUrl || 'https://d1ymz67w5raq8g.cloudfront.net/Pictures/780xany/6/5/5/509655_shutterstock_1506580442_769367.jpg'}
                  alt={quiz.title}
                  className={styles['quiz-image']}
                />
                <h3 className={styles['quiz-title']}>{quiz.title}</h3>
                <p className={styles['quiz-description']}>{quiz.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* My Quizzes Section */}
        {username && (
          <section className={styles['quizzes-section']}>
            <h2 className={styles['section-title']}>Quiz của bạn</h2>
            <div className={styles['search-container']}>
              <Search className={styles['search-icon']} />
              <input
                type="text"
                placeholder="Tìm kiếm quiz của bạn..."
                value={mySearchQuery}
                onChange={(e) => setMySearchQuery(e.target.value)}
                className={styles['search-input']}
              />
            </div>
            {myLoading && (
              <div className={styles.loading}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4">Đang tải...</p>
              </div>
            )}
            {myError && (
              <div className={styles.error}>{myError}</div>
            )}
            {!myLoading && !myError && filteredMyQuizzes.length === 0 && (
              <div className="text-center py-12 text-gray-600">Bạn chưa có quiz nào</div>
            )}
            <div className={styles['quizzes-grid']}>
              {filteredMyQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className={styles['quiz-card']}
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <img
                    src={quiz.thumbnailUrl || 'https://cdn.vectorstock.com/i/1000v/41/67/quiz-word-pop-art-hand-drawn-vector-50154167.jpg'}
                    alt={quiz.title}
                    className={styles['quiz-image']}
                  />
                  <h3 className={styles['quiz-title']}>{quiz.title}</h3>
                  <p className={styles['quiz-description']}>{quiz.description}</p>
                </div>
              ))}
            </div>
            {myPage + 1 < myTotalPages && !myLoading && (
              <button onClick={handleMyLoadMore} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mx-auto block">
                Tải thêm
              </button>
            )}
          </section>
        )}

        {/* Quizzes Section */}
        <section className={styles['quizzes-section']}>
          <h2 className={styles['section-title']}>Tất cả các Quiz</h2>
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
                  src={quiz.thumbnailUrl || 'https://media.quizizz.com/_mdserver/main/media/resource/gs/quizizz-media/quizzes/c44b27fd-ff6e-43dd-8954-ea3dcd768b03-v2?w=200&h=200'}
                  alt={quiz.title}
                  className={styles['quiz-image']}
                />
                <h3 className={styles['quiz-title']}>{quiz.title}</h3>
                <p className={styles['quiz-description']}>{quiz.description}</p>
              </div>
            ))}
          </div>
          {page + 1 < totalPages && !loading && (
            <button onClick={handleLoadMore} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mx-auto block">
              Tải thêm
            </button>
          )}
        </section>

        {/* Final CTA */}
        {!username && (
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
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles['footer-grid']}>
            <div className="md:col-span-1">
              <div className={styles['footer-logo']}>
                <Brain className="w-8 h-8 text-indigo-400" />
                <span className={styles['footer-logo-text']}>Quiz.AI</span>
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
                  1900 9999
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📍</span>
                  Tòa nhà A, 123 Đường ABC, Hà Nội
                </li>
              </ul>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <p>© 2025 Quiz.AI </p>
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