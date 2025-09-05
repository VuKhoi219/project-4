import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Users, 
  BarChart3, 
  Download, 
  Smartphone, 
  CheckCircle, 
  Menu, 
  X, 
  FileText, 
  HelpCircle, 
  Award, 
  Target, 
  Star, 
  ArrowRight, 
  Globe, 
  Shield, 
  Clock, 
  TrendingUp,
  ChevronUp,
  LogOut,
  User,
  Flame,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { ref, set, db } from "../config/firebase"; // Thêm import này
import apiService from '../services/api';


// Interface for MyQuiz (same structure as QuizAll)
interface MyQuiz {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
}
// Interface cho QuizHot
interface QuizHot {
  id: number;
  title: string;
  description: string;
  playCount: number;
  averageScore?: number;
  imageUrl?: string | null; // Cho phép imageUrl là null
}
interface QuizAll {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
}

// Generic PaginationResponse
interface PaginationResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // trang hiện tại
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Generic ApiResponse
interface ApiResponse<T> {
  status: string;
  message: string;
  data: PaginationResponse<T>;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('start');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // State cho QuizHot section
  const [hotQuizzes, setHotQuizzes] = useState<QuizHot[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [errorQuizzes, setErrorQuizzes] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho QuizAll section
  const [allQuizzes, setAllQuizzes] = useState<QuizAll[]>([]);
  const [loadingAllQuizzes, setLoadingAllQuizzes] = useState(true);
  const [errorAllQuizzes, setErrorAllQuizzes] = useState<string | null>(null);
  const [currentAllPage, setCurrentAllPage] = useState(0);
  const [totalAllPages, setTotalAllPages] = useState(0);
  const allQuizzesRef = useRef<HTMLDivElement>(null);

    // State for MyQuizzes section
  const [myQuizzes, setMyQuizzes] = useState<MyQuiz[]>([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);
  const [errorMyQuizzes, setErrorMyQuizzes] = useState<string | null>(null);
  const [currentMyPage, setCurrentMyPage] = useState(0);
  const [totalMyPages, setTotalMyPages] = useState(0);

  // Refs for scrolling
  const featuresRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const quizzesHotRef = useRef<HTMLDivElement>(null);
  const myQuizzesRef = useRef<HTMLDivElement>(null);
  const baseApi = process.env.REACT_APP_API_BACKEND || "http://localhost:8080"


  // Navigation items
  const navItems = [
    { name: 'Tính năng', ref: featuresRef, icon: <Zap className="w-4 h-4" /> },
    { name: 'Tài liệu', ref: documentsRef, icon: <FileText className="w-4 h-4" /> },
    { name: 'Hỗ trợ', ref: supportRef, icon: <HelpCircle className="w-4 h-4" /> },
    { name: 'Về chúng tôi', ref: aboutRef, icon: <Users className="w-4 h-4" /> },
    { name: 'Quiz của tôi', ref: myQuizzesRef, icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Quizzes Nổi bật', ref: quizzesHotRef, icon: <Flame className="w-4 h-4" /> },
    { name: 'Tất cả Quiz', ref: allQuizzesRef, icon: <Globe className="w-4 h-4" /> }
  ];

  // Check for logged in user
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    }
  }, []);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

 const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch my quizzes
  const fetchMyQuizzes = async (page: number) => {
    setLoadingMyQuizzes(true);
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await axios.get<ApiResponse<MyQuiz>>(
        `${baseApi}/api/quizzes/my-quizzes`,
        {
          params: { page, size: 6 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const quizzesData: MyQuiz[] = response.data.data.content;
      setTotalMyPages(response.data.data.totalPages);

      const quizzesWithAvatars = await Promise.all(
        quizzesData.map(async (quiz: MyQuiz) => {
          const avatarResponse = await apiService.getQuizAvatar(quiz.id);
          return {
            ...quiz,
            imageUrl: avatarResponse && avatarResponse.data ? avatarResponse.data : quiz.imageUrl,
          };
        })
      );
      setMyQuizzes(quizzesWithAvatars);

      for (const quiz of quizzesWithAvatars) {
        try {
          const avatarResponse = await apiService.getQuizAvatar(quiz.id);
          if (avatarResponse && avatarResponse.data) {
            setMyQuizzes((prevQuizzes) =>
              prevQuizzes.map((q) =>
                q.id === quiz.id ? { ...q, imageUrl: avatarResponse.data } : q
              )
            );
          }
        } catch (avatarErr) {
          console.log(`Không thể tải avatar cho quiz ${quiz.id}`);
        }
      }
    } catch (err) {
      setErrorMyQuizzes("Không thể tải danh sách quiz của bạn");
      console.error("Lỗi khi tải quiz của bạn:", err);
    } finally {
      setLoadingMyQuizzes(false);
    }
  };
  // Fetch hot quizzes
  // Lấy danh sách quiz nổi bật
const fetchHotQuizzes = async (page: number) => {
  setLoadingQuizzes(true);
  try {
    const response = await axios.get<ApiResponse<QuizHot>>(
      `${baseApi}/api/quizzes/quizzes-hot`,
      {
        params: { page, size: 6 },
      }
    );

    const quizzesData: QuizHot[] = response.data.data.content;
    setTotalPages(response.data.data.totalPages);

    // Xử lý từng quiz riêng biệt
    const quizzesWithAvatars = await Promise.all(
      quizzesData.map(async (quiz: QuizHot) => {
        const avatarResponse = await apiService.getQuizAvatar(quiz.id);
        return {
          ...quiz,
          imageUrl:
            avatarResponse && avatarResponse.data
              ? avatarResponse.data
              : quiz.imageUrl,
        };
      })
    );
    setHotQuizzes(quizzesWithAvatars);

    for (const quiz of quizzesWithAvatars) {
      try {
        const avatarResponse = await apiService.getQuizAvatar(quiz.id);
        if (avatarResponse && avatarResponse.data) {
          setHotQuizzes((prevQuizzes) =>
            prevQuizzes.map((q) =>
              q.id === quiz.id ? { ...q, imageUrl: avatarResponse.data } : q
            )
          );
        }
      } catch (avatarErr) {
        console.log(`Không thể tải avatar cho quiz ${quiz.id}`);
      }
    }
  } catch (err) {
    setErrorQuizzes("Không thể tải danh sách quiz nổi bật");
    console.error("Lỗi khi tải quiz nổi bật:", err);
  } finally {
    setLoadingQuizzes(false);
  }
};

  // Fetch all quizzes
  // Lấy tất cả quiz
const fetchAllQuizzes = async (page: number) => {
  setLoadingAllQuizzes(true);
  try {
    const response = await axios.get<ApiResponse<QuizAll>>(
      `${baseApi}/api/quizzes`,
      {
        params: { page, size: 6 },
      }
    );

    const quizzesData: QuizAll[] = response.data.data.content;
    setTotalAllPages(response.data.data.totalPages);

    // Xử lý từng quiz riêng biệt
    const quizzesWithAvatars = await Promise.all(
      quizzesData.map(async (quiz: QuizAll) => {
        const avatarResponse = await apiService.getQuizAvatar(quiz.id);
        return {
          ...quiz,
          imageUrl:
            avatarResponse && avatarResponse.data
              ? avatarResponse.data
              : quiz.imageUrl,
        };
      })
    );
    setAllQuizzes(quizzesWithAvatars);
    for (const quiz of quizzesWithAvatars) {
      try {
        const avatarResponse = await apiService.getQuizAvatar(quiz.id);
        if (avatarResponse && avatarResponse.data) {
          setAllQuizzes((prevQuizzes) =>
            prevQuizzes.map(
              (q) =>
                q.id === quiz.id ? { ...q, imageUrl: avatarResponse.data } : q
            )
          );
        }
      } catch (avatarErr) {
        console.log(`Không thể tải avatar cho quiz ${quiz.id}`);
      }
    }
  } catch (err) {
    setErrorAllQuizzes("Không thể tải danh sách tất cả quiz");
    console.error("Lỗi khi tải tất cả quiz:", err);
  } finally {
    setLoadingAllQuizzes(false);
  }
};

useEffect(() => {
  if (currentUser) {
    fetchMyQuizzes(currentMyPage);
  }
}, [currentMyPage, currentUser]);
  // Fetch hot quizzes on component mount and when page changes
  useEffect(() => {
    fetchHotQuizzes(currentPage);
  }, [currentPage]);

  // Fetch all quizzes when page changes
  useEffect(() => {
    fetchAllQuizzes(currentAllPage);
  }, [currentAllPage]);

  // Counter and slide-up animation for stats
  useEffect(() => {
    const animateStats = () => {
      // Animate counters
      const counters = document.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            if (target >= 1000) {
              counter.textContent = Math.ceil(current / 1000) + 'K+';
            } else {
              counter.textContent = Math.ceil(current) + '%';
            }
            setTimeout(updateCounter, 20);
          } else {
            if (target >= 1000) {
              counter.textContent = Math.ceil(target / 1000) + 'K+';
            } else {
              counter.textContent = target + '%';
            }
          }
        };
        
        setTimeout(updateCounter, 500);
      });

      // Slide-up animation for stat items
      const statItems = document.querySelectorAll(`.${styles['stat-item']}`);
      statItems.forEach((item, index) => {
        const htmlItem = item as HTMLElement;
        htmlItem.classList.add(styles['slide-up']);
        htmlItem.style.animationDelay = `${index * 0.2}s`;
      });
    };

    const timer = setTimeout(animateStats, 1000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateQuiz = () => {
    console.log('Navigating to /quiz/new from button'); // Debug log
    navigate('/quiz/new');
  };

  const handlePreviousAllPage = () => {
    if (currentAllPage > 0) {
      setCurrentAllPage(currentAllPage - 1);
    }
  };

  const handleNextAllPage = () => {
    if (currentAllPage < totalAllPages - 1) {
      setCurrentAllPage(currentAllPage + 1);
    }
  };
    const handlePreviousMyPage = () => {
    if (currentMyPage > 0) {
      setCurrentMyPage(currentMyPage - 1);
    }
  };

  const handleNextMyPage = () => {
    if (currentMyPage < totalMyPages - 1) {
      setCurrentMyPage(currentMyPage + 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Remove token if you're using one
    setCurrentUser(null);
    setShowUserMenu(false);
    setMyQuizzes([]);
    // Optionally redirect to login page
    // navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleQuizClick = async (quizId: number) => {
    try {
      if (typeof quizId !== 'number' || quizId <= 0) { // Kiểm tra chặt chẽ hơn
        console.error("ID quiz không hợp lệ:", quizId);
        return;
    }

    navigate(`/quiz/${quizId}/join`);

    localStorage.removeItem("userName");
    localStorage.setItem("quizId", quizId.toString());

  } catch (error) {
    console.error("Lỗi khi tạo phòng:", error);
    navigate(`/quiz/${quizId}/join`);
  }
  };

  return (
    <div className={styles["home-container"]}>
      {/* Enhanced Header with Navigation */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles["header-content"]}>
          <div
            className={styles.logo}
            onClick={scrollToTop}
            style={{ cursor: "pointer" }}
          >
            <Brain className={styles["logo-icon"]} />
            <span className={styles["logo-text"]}>QUIZ</span>
            <span className={styles["logo-suffix"]}>.AI</span>
          </div>

          {/* Navigation Menu */}
          <nav className={styles["nav-menu"]}>
            {navItems.map((item, index) => (
              <button
                key={`nav-${index}`}
                className={styles["nav-item"]}
                onClick={() =>
                  scrollToSection(item.ref as React.RefObject<HTMLDivElement>)
                }
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>

          <div className={styles["header-actions"]}>
            {/* Conditional rendering based on login status */}
            {currentUser ? (
                <div ref={userMenuRef} className={styles["user-menu-container"]}>
                <button className={styles["user-btn"]} onClick={toggleUserMenu}>
                  <User className="w-4 h-4" />
                  <span>Xin chào, {currentUser}</span>
                </button>

                {showUserMenu && (
                  <div className={styles["user-dropdown"]}>
                    <button onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles["sign-in-btn"]}
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            )}

            <button
              className={styles["mobile-menu-toggle"]}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles["mobile-menu"]}>
            <div className={styles["mobile-nav"]}>
              {navItems.map((item, index) => (
                <button
                  key={`mobile-nav-${index}`}
                  className={styles["mobile-nav-item"]}
                  onClick={() => {
                    scrollToSection(
                      item.ref as React.RefObject<HTMLDivElement>
                    );
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}

              {/* Mobile user menu */}
              <div className="border-t pt-4 mt-4">
                {currentUser ? (
                  <div>
                    <div className="px-4 py-2 text-gray-700">
                      <User className="w-4 h-4 inline mr-2" />
                      Xin chào, {currentUser}
                    </div>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative">
        {/* Enhanced Hero Section */}
        <section className={styles["hero-main"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["hero-text"]}>
              <div className={styles["hero-badge"]}>
                EASY WAY TO BUILD PERFECT QUIZZES
              </div>
              <h1 className={styles["hero-main-title"]}>
                BUILT QUIZZES WITH
                <br />
                <span className={styles["hero-highlight"]}>
                  THE SOUL OF INSPIRATION
                </span>
              </h1>
              <div className={styles["hero-stats"]}>
                <div className={styles["stat-item"]}>
                  <div className={styles["stat-number"]} data-target="100000">
                    100K+
                  </div>
                  <div className={styles["stat-label"]}>Quiz đã tạo</div>
                </div>
                <div className={styles["stat-item"]}>
                  <div className={styles["stat-number"]} data-target="50000">
                    50K+
                  </div>
                  <div className={styles["stat-label"]}>Người dùng</div>
                </div>
                <div className={styles["stat-item"]}>
                  <div className={styles["stat-number"]} data-target="99">
                    99%
                  </div>
                  <div className={styles["stat-label"]}>Hài lòng</div>
                </div>
              </div>
              <button
                className={styles["hero-cta-btn"]}
                onClick={handleCreateQuiz}
              >
                <span>Tạo quiz ngay</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Game Creation Cards */}
        <section className={styles["hero-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>TWO IN ONE</div>
            <h2 className={styles["section-title"]}>Tạo quiz nhanh chóng</h2>
            <p className={styles["section-subtitle"]}>
              Bộ sưu tập tuyệt vời các template quiz đẹp cho nhu cầu của bạn.
              Chọn template phù hợp nhất và bắt đầu tùy chỉnh.
            </p>
          </div>
          <div className={styles["hero-cards-container"]}>
            <div className={styles["hero-card"]}>
              <div className={styles["hero-illustration-static"]}>✍️</div>
              <h2 className={styles["hero-title"]}>Tạo quiz thủ công</h2>
              <p className={styles["hero-description"]}>
                Đây là phiên bản chính của template
              </p>
              <button
                className={styles["hero-btn-green"]}
                onClick={() => navigate("/quiz/new")}
              >
                <span>Quiz editor</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className={styles["hero-card"]}>
              <div className={styles["hero-illustration-static"]}>🤖</div>
              <h2 className={styles["hero-title"]}>AI Generator</h2>
              <p className={styles["hero-description"]}>
                Đây là phiên bản tối của template chính
              </p>
              <button
                className={styles["hero-btn-blue"]}
                onClick={() => navigate("/quiz/generate")}
              >
                <span>Quiz generator</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* My Quizzes Section */}
        {currentUser && (
          <section ref={myQuizzesRef} className={styles["quizzes-all-section"]}>
            <div className={styles["section-header"]}>
              <div className={styles["section-badge"]}>
                <BookOpen className="w-4 h-4 mr-1" />
                QUIZ CỦA TÔI
              </div>
              <h2 className={styles["section-title"]}>Quiz Của Tôi</h2>
              <p className={styles["section-subtitle"]}>
                Xem tất cả các quiz bạn đã tạo
              </p>
            </div>

            {loadingMyQuizzes && myQuizzes.length === 0 ? (
              <div className={styles["loading-container"]}>
                <div className={styles["loader"]}></div>
                <p>Đang tải quiz của bạn...</p>
              </div>
            ) : errorMyQuizzes ? (
              <div className={styles["error-container"]}>
                <p>{errorMyQuizzes}</p>
              </div>
            ) : myQuizzes.length === 0 ? (
              <div className={styles["empty-container"]}>
                <p>Bạn chưa tạo quiz nào</p>
              </div>
            ) : (
              <>
                <div className={styles["quiz-grid"]}>
                  {myQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className={styles["quiz-card"]}
                      onClick={() => handleQuizClick(quiz.id)}
                    >
                      {quiz.imageUrl ? (
                        <div className={styles["quiz-image-container"]}>
                          <img
                            src={quiz.imageUrl}
                            alt={quiz.title}
                            className={styles["quiz-image"]}
                          />
                        </div>
                      ) : (
                        <div className={styles["quiz-image-container"]}>
                          <div className={styles["quiz-avatar"]}>
                            {quiz.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      <div className={styles["quiz-card-content"]}>
                        <h3 className={styles["quiz-title"]}>{quiz.title}</h3>
                        <p className={styles["quiz-description"]}>
                          {quiz.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {totalMyPages > 1 && (
                  <div className={styles["pagination"]}>
                    <button
                      onClick={handlePreviousMyPage}
                      disabled={currentMyPage === 0}
                      className={styles["pagination-button"]}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className={styles["page-info"]}>
                      Trang {currentMyPage + 1} / {totalMyPages}
                    </span>
                    <button
                      onClick={handleNextMyPage}
                      disabled={currentMyPage === totalMyPages - 1}
                      className={styles["pagination-button"]}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* QuizHot Section */}
        <section ref={quizzesHotRef} className={styles["quizHot-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>
              <Flame className="w-4 h-4 mr-1" />
              QUIZZES NỔI BẬT
            </div>
            <h2 className={styles["section-title"]}>Quizzes Nổi Bật</h2>
            <p className={styles["section-subtitle"]}>
              Khám phá những quiz được yêu thích và chơi nhiều nhất
            </p>
          </div>

          {loadingQuizzes && hotQuizzes.length === 0 ? (
            <div className={styles["loading-container"]}>
              <div className={styles["loader"]}></div>
              <p>Đang tải quizzes nổi bật...</p>
            </div>
          ) : errorQuizzes ? (
            <div className={styles["error-container"]}>
              <p>{errorQuizzes}</p>
            </div>
          ) : hotQuizzes.length === 0 ? (
            <div className={styles["empty-container"]}>
              <p>Chưa có quiz nổi bật nào</p>
            </div>
          ) : (
            <>
              <div className={styles["quiz-grid"]}>
                {hotQuizzes.map((quiz) => (
                  <div
                    key={quiz.id} // Thay quizId thành id
                    className={styles["quiz-card"]}
                    onClick={() => handleQuizClick(quiz.id)} // Thay quizId thành id
                  >
                    {quiz.imageUrl && (
                      <div className={styles["quiz-image-container"]}>
                        <img
                          src={quiz.imageUrl}
                          alt={quiz.title}
                          className={styles["quiz-image"]}
                        />
                      </div>
                    )}
                    {!quiz.imageUrl && (
                      <div className={styles["quiz-image-container"]}>
                        <div className={styles["quiz-avatar"]}>
                          {quiz.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className={styles["quiz-card-content"]}>
                      <h3 className={styles["quiz-title"]}>{quiz.title}</h3>
                      <p className={styles["quiz-description"]}>
                        {quiz.description}
                      </p>
                      <div className={styles["quiz-stats"]}>
                        <span className={styles["play-count"]}>
                          <Flame className="w-4 h-4 mr-1" />
                          {quiz.playCount} lượt chơi
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles["pagination"]}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className={styles["pagination-button"]}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className={styles["page-info"]}>
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={styles["pagination-button"]}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* All Quizzes Section */}
        <section ref={allQuizzesRef} className={styles["quizzes-all-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>TẤT CẢ QUIZZES</div>
            <h2 className={styles["section-title"]}>Tất Cả Quiz</h2>
            <p className={styles["section-subtitle"]}>
              Khám phá tất cả các quiz có sẵn
            </p>
          </div>

          {loadingAllQuizzes && allQuizzes.length === 0 ? (
            <div className={styles["loading-container"]}>
              <div className={styles["loader"]}></div>
              <p>Đang tải tất cả quizzes...</p>
            </div>
          ) : errorAllQuizzes ? (
            <div className={styles["error-container"]}>
              <p>{errorAllQuizzes}</p>
            </div>
          ) : allQuizzes.length === 0 ? (
            <div className={styles["empty-container"]}>
              <p>Chưa có quiz nào</p>
            </div>
          ) : (
            <>
              <div className={styles["quiz-grid"]}>
                {allQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={styles["quiz-card"]}
                    onClick={() => handleQuizClick(quiz.id)}
                  >
                    {quiz.imageUrl ? (
                      <div className={styles["quiz-image-container"]}>
                        <img
                          src={quiz.imageUrl}
                          alt={quiz.title}
                          className={styles["quiz-image"]}
                        />
                      </div>
                    ) : (
                      <div className={styles["quiz-image-container"]}>
                        <div className={styles["quiz-avatar"]}>
                          {quiz.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    <div className={styles["quiz-card-content"]}>
                      <h3 className={styles["quiz-title"]}>{quiz.title}</h3>
                      <p className={styles["quiz-description"]}>
                        {quiz.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {totalAllPages > 1 && (
                <div className={styles["pagination"]}>
                  <button
                    onClick={handlePreviousAllPage}
                    disabled={currentAllPage === 0}
                    className={styles["pagination-button"]}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className={styles["page-info"]}>
                    Trang {currentAllPage + 1} / {totalAllPages}
                  </span>
                  <button
                    onClick={handleNextAllPage}
                    disabled={currentAllPage === totalAllPages - 1}
                    className={styles["pagination-button"]}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className={styles["features-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>CHOOSE YOUR LAYOUT</div>
            <h2 className={styles["section-title"]}>Tính năng nổi bật</h2>
            <p className={styles["section-subtitle"]}>
              Bộ sưu tập tuyệt vời các template quiz đẹp cho nhu cầu của bạn.
              Chọn template phù hợp nhất và bắt đầu tùy chỉnh.
            </p>
          </div>
          <div className={styles["features-grid"]}>
            {[
              {
                icon: <Zap className="w-8 h-8 text-white" />,
                title: "Tạo quiz tự động",
                description:
                  "AI tự động đề xuất câu hỏi và đáp án chỉ từ tiêu đề bạn nhập, tiết kiệm thời gian soạn bài.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: <Users className="w-8 h-8 text-white" />,
                title: "Chế độ nhóm/lớp học",
                description:
                  "Tạo phòng quiz để học sinh tham gia và làm bài trực tuyến, tự động chấm điểm.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-white" />,
                title: "Phân tích kết quả",
                description:
                  "Thống kê chi tiết kết quả làm bài của học viên, giúp đánh giá hiệu quả giảng dạy.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: <Download className="w-8 h-8 text-white" />,
                title: "Xuất file Word/PDF",
                description:
                  "Tải quiz về máy dưới dạng file Word hoặc PDF để in ấn hoặc chỉnh sửa thêm.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: <Smartphone className="w-8 h-8 text-white" />,
                title: "Hỗ trợ đa nền tảng",
                description:
                  "Sử dụng trên mọi thiết bị: máy tính, điện thoại, tablet với giao diện tối ưu.",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: <Brain className="w-8 h-8 text-white" />,
                title: "Tạo quiz từ ảnh",
                description:
                  "Upload ảnh chụp tài liệu hoặc sách, AI sẽ phân tích nội dung và tự động tạo quiz.",
                gradient: "from-pink-500 to-rose-500",
              },
            ].map((feature, index) => (
              <div
                key={`feature-${index}`}
                className={`${styles["feature-card"]} ${styles["animate-card"]}`}
              >
                <div
                  className={`${styles["feature-icon-container"]} bg-gradient-to-r ${feature.gradient}`}
                >
                  {feature.icon}
                </div>
                <h3 className={styles["feature-title"]}>{feature.title}</h3>
                <p className={styles["feature-description"]}>
                  {feature.description}
                </p>
                <div className={styles["feature-hover-effect"]}></div>
              </div>
            ))}
          </div>
        </section>

        {/* Documents/Benefits Section */}
        <section ref={documentsRef} className={styles["benefits-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>LỢI ÍCH</div>
            <h2 className={styles["section-title"]}>
              Lợi ích khi sử dụng Quiz AI
            </h2>
            <p className={styles["section-subtitle"]}>
              Quiz AI giúp bạn tiết kiệm thời gian và nâng cao chất lượng giảng
              dạy với các tính năng thông minh.
            </p>
          </div>
          <div className={styles["benefits-container"]}>
            <div className={styles["benefits-text"]}>
              <div className="space-y-6">
                {[
                  "Tiết kiệm thời gian tạo quiz từ 70-90% so với cách thủ công",
                  "Chất lượng câu hỏi cao, đa dạng loại câu hỏi (trắc nghiệm, tự luận ngắn)",
                  "Dễ dàng chia sẻ quiz với bạn bè, học sinh qua link hoặc mạng xã hội",
                  "Phù hợp với nhiều đối tượng từ học sinh, sinh viên đến giáo viên",
                  "Hỗ trợ nhiều môn học từ khoa học tự nhiên đến xã hội, ngoại ngữ",
                ].map((benefit, index) => (
                  <div
                    key={`benefit-${index}`}
                    className={styles["benefit-item"]}
                  >
                    <div className={styles["benefit-icon-wrapper"]}>
                      <CheckCircle className={styles["benefit-icon"]} />
                    </div>
                    <span className={styles["benefit-text"]}>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className={styles["stats-row"]}>
                <div className={styles["stat-card"]}>
                  <Clock className="w-6 h-6 text-blue-500" />
                  <span className={styles["stat-value"]}>90%</span>
                  <span className={styles["stat-description"]}>
                    Tiết kiệm thời gian
                  </span>
                </div>
                <div className={styles["stat-card"]}>
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <span className={styles["stat-value"]}>95%</span>
                  <span className={styles["stat-description"]}>
                    Độ chính xác
                  </span>
                </div>
              </div>
            </div>
            <div className={styles["benefits-image-container"]}>
              <div className={styles["floating-elements"]}>
                <div className={styles["floating-card-horizontal"]}>
                  <Brain className="w-8 h-8 text-blue-500" />
                  <span>AI Powered</span>
                  <Award className="w-8 h-8 text-yellow-500" />
                  <span>High Quality</span>
                  <Globe className="w-8 h-8 text-green-500" />
                  <span>Multi Platform</span>
                </div>
              </div>
              <img
                src="https://images.pexels.com/photos/5427660/pexels-photo-5427660.jpeg?auto=compress&cs=tinysrgb&w=500"
                alt="Quiz AI Benefits"
                className={styles["benefits-image"]}
              />
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className={styles["what-you-get-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>
              FEATURES OF THE TEMPLATE
            </div>
            <h2 className={styles["section-title"]}>What You Get</h2>
            <p className={styles["section-subtitle"]}>
              Các tính năng mạnh mẽ và bao gồm, giúp Quiz AI nổi bật, dễ dàng
              tùy chỉnh và mở rộng.
            </p>
          </div>
          <div className={styles["features-grid-large"]}>
            {[
              {
                icon: "🎨",
                title: "Beautifully Designed",
                description:
                  "Mẫu Quiz AI đi kèm với bố cục được thiết kế đẹp mắt, giúp bạn tạo website hoàn hảo.",
              },
              {
                icon: "📱",
                title: "100% Responsive",
                description:
                  "Chúng tôi đã làm cho mẫu hoàn toàn responsive, vì vậy nó trông tuyệt vời trên mọi thiết bị: desktop, tablet và điện thoại.",
              },
              {
                icon: "✨",
                title: "Smooth Animations",
                description:
                  "Bạn có thể thấy các tương tác đẹp mắt trên toàn bộ mẫu. Chúng làm cho nó cảm giác sống động và thú vị khi sử dụng.",
              },
              {
                icon: "🔧",
                title: "Fully Customizable",
                description:
                  "Bạn sẽ có thể chỉnh sửa bất kỳ phần nào của chủ đề. Quiz AI cung cấp cho bạn số lượng khả năng không giới hạn.",
              },
              {
                icon: "🔍",
                title: "SEO Optimization",
                description:
                  "Chủ đề được xây dựng sử dụng mã HTML và CSS ngữ nghĩa, cho phép công cụ tìm kiếm dễ dàng thu thập và lập chỉ mục trang web của bạn.",
              },
              {
                icon: "💬",
                title: "Friendly Support",
                description:
                  "Chúng tôi luôn sẵn sàng giúp đỡ, vì vậy đừng ngần ngại liên hệ nếu bạn có bất kỳ câu hỏi hoặc gợi ý nào về Quiz AI.",
              },
            ].map((feature, index) => (
              <div key={index} className={styles["feature-card-large"]}>
                <div className={styles["feature-icon-large"]}>
                  {feature.icon}
                </div>
                <h3 className={styles["feature-title-large"]}>
                  {feature.title}
                </h3>
                <p className={styles["feature-description-large"]}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Audience Section */}
        <section ref={supportRef} className={styles["audience-section"]}>
          <div className={styles["section-header"]}>
            <div className={styles["section-badge"]}>
              FIND ANSWERS TO ALL YOUR QUESTIONS
            </div>
            <h2 className={styles["section-title"]}>Got A Problem?</h2>
            <p className={styles["section-subtitle"]}>
              Quiz AI phù hợp với mọi đối tượng trong giáo dục và đào tạo
            </p>
          </div>
          <div className={styles["support-grid"]}>
            <div className={styles["support-card"]}>
              <div className={styles["support-icon"]}>📚</div>
              <h3 className={styles["support-title"]}>Detailed Document</h3>
              <p className={styles["support-description"]}>
                Tài liệu của chúng tôi chi tiết nhất có thể. Mỗi tùy chọn chủ đề
                được mô tả rõ ràng và dễ theo dõi.
              </p>
              <button
                className={styles["support-btn"]}
                onClick={() => navigate("/docs")}
              >
                Online Documentation
              </button>
            </div>
            <div className={styles["support-card"]}>
              <div className={styles["support-icon"]}>💎</div>
              <h3 className={styles["support-title"]}>Premium Support</h3>
              <p className={styles["support-description"]}>
                Chúng tôi cung cấp hỗ trợ tận tình và thân thiện, chúng tôi sẽ
                cố gắng trả lời nhanh nhất có thể.
              </p>
              <button
                className={styles["support-btn"]}
                onClick={() =>
                  (window.location.href = "mailto:support@quizai.com")
                }
              >
                Get Support
              </button>
            </div>
            <div className={styles["support-card"]}>
              <div className={styles["support-icon"]}>🎥</div>
              <h3 className={styles["support-title"]}>Video Tutorials</h3>
              <p className={styles["support-description"]}>
                Xem hướng dẫn video của chúng tôi, hướng dẫn từng bước để thiết
                lập mẫu. Chúng tôi đã phân chia với các video hướng dẫn.
              </p>
              <button
                className={styles["support-btn"]}
                onClick={() =>
                  window.open(
                    "https://www.youtube.com/playlist?list=example",
                    "_blank"
                  )
                }
              >
                Video Tutorials
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className={styles["about-section"]}>
          <div className={styles["about-container"]}>
            <div className={styles["about-content"]}>
              <h2 className={styles["section-title"]}>Về Quiz AI</h2>
              <p className={styles["about-description"]}>
                Quiz AI là nền tảng tạo quiz thông minh được phát triển với mục
                tiêu cách mạng hóa cách thức tạo và quản lý bài kiểm tra trong
                giáo dục. Với sức mạnh của trí tuệ nhân tạo, chúng tôi giúp giáo
                viên, học sinh và các tổ chức giáo dục tiết kiệm thời gian và
                nâng cao chất lượng đánh giá.
              </p>
              <div className={styles["about-features"]}>
                <div className={styles["about-feature"]}>
                  <Shield className="w-6 h-6 text-blue-500" />
                  <span>Bảo mật tuyệt đối</span>
                </div>
                <div className={styles["about-feature"]}>
                  <Globe className="w-6 h-6 text-green-500" />
                  <span>Hỗ trợ đa ngôn ngữ</span>
                </div>
                <div className={styles["about-feature"]}>
                  <Target className="w-6 h-6 text-purple-500" />
                  <span>Tùy chỉnh linh hoạt</span>
                </div>
              </div>
            </div>
            <div className={styles["about-stats"]}>
              <div className={styles["stat-card-large"]}>
                <div className={styles["stat-number-large"]}>2025</div>
                <div className={styles["stat-label-large"]}>Năm thành lập</div>
              </div>
              <div className={styles["stat-card-large"]}>
                <div className={styles["stat-number-large"]}>50K+</div>
                <div className={styles["stat-label-large"]}>Người dùng</div>
              </div>
              <div className={styles["stat-card-large"]}>
                <div className={styles["stat-number-large"]}>24/7</div>
                <div className={styles["stat-label-large"]}>Hỗ trợ</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles["cta-section"]}>
          <div className={styles["cta-container"]}>
            <div className={styles["cta-content"]}>
              <div className={styles["section-badge"]}>ARE YOU READY?</div>
              <h2 className={styles["cta-title"]}>
                Create Your Amazing Quiz with Quiz AI
              </h2>
              <button
                className={styles["hero-cta-btn"]}
                onClick={handleCreateQuiz}
                style={{ position: "relative", zIndex: 10 }} // Ensure button is clickable
              >
                <span>Tạo quiz ngay</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
            <div
              className={styles["cta-decoration"]}
              style={{ position: "relative", zIndex: 5 }}
            >
              <div className={styles["floating-icon-1"]}>
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <div className={styles["floating-icon-2"]}>
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className={styles["floating-icon-3"]}>
                <Star className="w-7 h-7 text-pink-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`${styles["back-to-top"]} fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Enhanced Footer */}
        <footer className={styles.footer}>
          <div className={styles["footer-container"]}>
            <div className={styles["footer-grid"]}>
              <div className={styles["footer-brand"]}>
                <div className={styles["footer-logo"]}>
                  <Brain className="w-10 h-10 text-blue-500" />
                  <span className={styles["footer-logo-text"]}>Quiz AI</span>
                </div>
                <p className={styles["footer-description"]}>
                  Công cụ tạo quiz thông minh bằng trí tuệ nhân tạo dành cho
                  giáo dục và đào tạo.
                </p>
                {/* <div className={styles['footer-links']}>
                  <div className={styles['social-link']}>📘</div>
                  <div className={styles['social-link']}>🐦</div>
                  <div className={styles['social-link']}>📷</div>
                  <div className={styles['social-link']}>💼</div>
                </div> */}
              </div>
              <div>
                <h4 className={styles["footer-heading"]}>Sản phẩm</h4>
                <ul className={styles["footer-links"]}>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Tạo Quiz
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      AI Generator
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Thư viện
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Analytics
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={styles["footer-heading"]}>Hỗ trợ</h4>
                <ul className={styles["footer-links"]}>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Trung tâm trợ giúp
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Hướng dẫn
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles["footer-link"]}>
                      Cộng đồng
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={styles["footer-heading"]}>Liên hệ</h4>
                <div className={styles["contact-info"]}>
                  <div className={styles["contact-item"]}>
                    <span className={styles["contact-icon"]}>📧</span>
                    <span>support@quizai.com</span>
                  </div>
                  <div className={styles["contact-item"]}>
                    <span className={styles["contact-icon"]}>📞</span>
                    <span>1900 1234</span>
                  </div>
                  <div className={styles["contact-item"]}>
                    <span className={styles["contact-icon"]}>📍</span>
                    <span>Hà Nội, Việt Nam</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles["footer-bottom"]}>
              <p>© 2024 Quiz AI. Tất cả quyền được bảo lưu.</p>
              <div className={styles["footer-bottom-links"]}>
                <a href="#" className={styles["footer-link"]}>
                  Điều khoản
                </a>
                <a href="#" className={styles["footer-link"]}>
                  Bảo mật
                </a>
                <a href="#" className={styles["footer-link"]}>
                  Cookie
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;