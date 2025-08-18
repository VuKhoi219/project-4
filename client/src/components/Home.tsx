import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
// import '../styles/Home.css'; // CSS sẽ được viết trực tiếp trong component

// Interface cho quiz
interface QuizCategory {
  id: number;
  title: string;
  description: string;
  // Giả sử có thêm trường thumbnail
  thumbnailUrl?: string;
}

// Định nghĩa kiểu cho styles để dễ quản lý
const styles: { [key: string]: React.CSSProperties } = {
  homeContainer: {
    backgroundColor: '#fdfcf7',
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'sans-serif'",
    color: '#1a202c',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#fdfcf7',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '2.5rem',
  },
  logoText: {
    display: 'inline-block',
    padding: '0.2rem 0.8rem',
    borderRadius: '1rem',
    backgroundColor: '#ff6b6b',
    color: 'white',
    marginRight: '0.2rem',
  },
  joinGameContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8b4b4',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    gap: '1rem',
  },
  pinInput: {
    border: '3px solid black',
    borderRadius: '1.5rem',
    padding: '0.5rem 1rem',
    textAlign: 'center',
    fontSize: '1rem',
    width: '100px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  searchBtn: {
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  signInBtn: {
    backgroundColor: '#d2f4a3',
    border: '3px solid black',
    borderRadius: '2rem',
    padding: '0.7rem 1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 0 black',
    transition: 'transform 0.1s ease-in-out',
  },
  categoriesNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  categoryBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  categoryBtnActive: {
    borderBottom: '3px solid black',
  },
  heroSection: {
    display: 'flex',
    gap: '2rem',
    padding: '2rem',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#1b4f52',
    color: 'white',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroIllustration: {
    fontSize: '5rem',
    marginBottom: '1rem',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  heroDescription: {
    marginBottom: '1.5rem',
  },
  heroBtnGreen: {
    backgroundColor: '#00c985',
    color: 'black',
    border: '3px solid black',
    borderRadius: '2rem',
    padding: '0.7rem 2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 0 black',
    fontSize: '1rem',
  },
  heroBtnBlue: {
    backgroundColor: '#66d9ff',
    color: 'black',
    border: '3px solid black',
    borderRadius: '2rem',
    padding: '0.7rem 2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 0 black',
    fontSize: '1rem',
  },
  quizzesSection: {
    padding: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
  },
  quizzesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  quizCard: {
    cursor: 'pointer',
    background: '#fff',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  quizImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    backgroundColor: '#e2e8f0',
  },
  quizTitle: {
    fontWeight: 'bold',
    padding: '1rem',
  }
};


const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dữ liệu categories mới
  const categories = [
    { id: 'start', name: 'Start', icon: '🏠' },
    { id: 'art', name: 'Art & Literature', icon: '🎨' },
    { id: 'entertainment', name: 'Entertainment', icon: '⭐' },
    { id: 'geography', name: 'Geography', icon: '🌍' },
    { id: 'history', name: 'History', icon: '🏛️' },
    { id: 'languages', name: 'Languages', icon: '💬' },
    { id: 'science', name: 'Science & Nature', icon: '🔬' },
    { id: 'sports', name: 'Sports', icon: '🏀' },
    { id: 'trivia', name: 'Trivia', icon: '💡' },
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // Tải trang đầu tiên hoặc trang tiếp theo
        const response = await apiService.fetchQuizzes(0); // Luôn tải trang đầu cho demo
        if (response.success) {
          const quizzesFromApi = response.data.content as unknown as QuizCategory[];
          // Chỉ hiển thị dữ liệu mới, không cộng dồn
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
  }, [activeCategory]); // Tải lại quiz khi đổi category

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
    <div style={styles.homeContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
            <span style={styles.logoText}>QUIZ</span>.com
        </div>
        <div style={styles.joinGameContainer}>
            <strong>Join Game? Enter PIN:</strong>
            <input
              type="text"
              placeholder="123 456"
              style={styles.pinInput}
            />
        </div>
        <div style={styles.headerActions}>
            <button style={styles.searchBtn}>🔍</button>
            <button style={styles.signInBtn}>Sign in</button>
        </div>
      </header>
      
      {/* Categories */}
      <nav style={styles.categoriesNav}>
        {categories.map(category => (
          <button
            key={category.id}
            style={
              activeCategory === category.id
                ? { ...styles.categoryBtn, ...styles.categoryBtnActive }
                : styles.categoryBtn
            }
            onClick={() => setActiveCategory(category.id)}
          >
            <div style={{ fontSize: '1.5rem' }}>{category.icon}</div>
            <div>{category.name}</div>
          </button>
        ))}
      </nav>

      <main style={{padding: '0 2rem'}}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroCard}>
            <div style={styles.heroIllustration}>✍️</div>
            <h2 style={styles.heroTitle}>Create a quiz</h2>
            <p style={styles.heroDescription}>Play for free with 300 participants</p>
            <button style={styles.heroBtnGreen} onClick={() => navigate('/create-quiz')}>Quiz editor</button>
          </div>
          <div style={styles.heroCard}>
            <div style={styles.heroIllustration}>🤖</div>
            <h2 style={styles.heroTitle}>A.I.</h2>
            <p style={styles.heroDescription}>Generate a quiz from any subject or pdf</p>
            <button style={styles.heroBtnBlue} onClick={() => navigate('/create-quiz')}>Quiz generator</button>
          </div>
        </section>

        {/* Quizzes Section */}
        <section style={styles.quizzesSection}>
          <h2 style={styles.sectionTitle}>Recently published</h2>
          {loading && <p>Đang tải...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && filteredQuizzes.length === 0 && (
            <p>Không tìm thấy quiz nào</p>
          )}
          <div style={styles.quizzesGrid}>
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                style={styles.quizCard}
                onClick={() => handleQuizClick(quiz.id)}
              >
                <img
                    src={quiz.thumbnailUrl || "https://via.placeholder.com/200x150.png?text=QUIZ"}
                    alt={quiz.title}
                    style={styles.quizImage}
                />
                <h3 style={styles.quizTitle}>{quiz.title}</h3>
              </div>
            ))}
          </div>
          {/* Nút tải thêm được ẩn đi theo thiết kế mới */}
          {/*!loading && page + 1 < totalPages && (
            <button className="load-more-btn" onClick={handleLoadMore}>
              Tải thêm
            </button>
          )*/}
        </section>
      </main>
    </div>
  );
};

export default Home;