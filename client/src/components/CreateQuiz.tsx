import React, { useState } from "react";
import axios from "axios";

type QuizInfo = {
  title: string;
  description: string;
  categoryId: number;
};

type Answer = { answerText: string; isCorrect: boolean };
type Question = {
  id?: number;
  questionText: string;
  questionType: string;
  points?: number;
  timeLimit?: number;
  answers: Answer[];
};

const defaultQuestion: Question = {
  questionText: "",
  questionType: "MULTIPLE_CHOICE",
  points: 1,
  timeLimit: 30,
  answers: [
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
  ],
};

const CreateQuiz: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"text" | "file">("text");
  const [file, setFile] = useState<File | null>(null);
  const [quizInfo, setQuizInfo] = useState<QuizInfo>({
    title: "",
    description: "",
    categoryId: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  // Thêm state cho câu hỏi AI sinh ra
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [editAI, setEditAI] = useState(false);

  // Upload file lên backend
  const handleFileUpload = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const headers: any = { "Content-Type": "multipart/form-data" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await axios.post("http://localhost:8080/api/files/upload", formData, {
      headers,
    });
    return res.data.data.id || res.data.data.fileId;
  };

  // Hàm kiểm tra trạng thái file
  const checkFileReady = async (fileId: number) => {
    const token = localStorage.getItem("token");
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await axios.get(`http://localhost:8080/api/files/${fileId}`, { headers });
    // Chỉ kiểm tra isProcessed
    return res.data.data.isProcessed;
  };

  // Submit tạo quiz
  const handleSubmit = async () => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để tạo quiz!");
      return;
    }
    // Kiểm tra dữ liệu đầu vào
    if (!quizInfo.title || !quizInfo.description || !quizInfo.categoryId) {
      alert("Vui lòng nhập đầy đủ thông tin quiz!");
      return;
    }
    if (mode === "text" && questions.length === 0) {
      alert("Vui lòng thêm ít nhất 1 câu hỏi!");
      return;
    }
    if (mode === "file" && !file) {
      alert("Vui lòng chọn file để upload!");
      return;
    }
    setLoading(true);
    try {
      let fileId = 0;
      if (mode === "file" && file) {
        fileId = await handleFileUpload();
        if (!fileId) {
          alert("Upload file thất bại!");
          setLoading(false);
          return;
        }
        // Kiểm tra trạng thái file
        let ready = false,
          retry = 0;
        while (!ready && retry < 30) {
          // thử lại tối đa 30 lần, mỗi lần cách nhau 2s
          ready = await checkFileReady(fileId);
          if (!ready) await new Promise((r) => setTimeout(r, 2000));
          retry++;
        }
        if (!ready) {
          alert("File chưa được xử lý xong, vui lòng thử lại sau!");
          setLoading(false);
          return;
        }
      }
      // Chuẩn bị body gửi lên backend
      const body: any = {
        ...quizInfo,
        sourceType: mode === "text" ? "TEXT" : "FILE",
        showCorrectAnswers: true,
        shuffleAnswers: false,
      };
      if (mode === "file" && fileId) {
        body.fileId = fileId;
        body.numberOfQuestions = numberOfQuestions;
        body.difficulty = difficulty;
      }
      // Không gửi các trường fileId, numberOfQuestions, difficulty khi nhập tay
      const headers: any = { Authorization: `Bearer ${token}` };
      const quizRes = await axios.post("http://localhost:8080/api/quizzes", body, {
        headers,
      });
      const quizId = quizRes.data.data.id;
      // Nếu nhập tay, gửi tiếp các câu hỏi
      if (mode === "text") {
        for (const q of questions) {
          await axios.post(`http://localhost:8080/api/questions/quizzes/${quizId}`, q, {
            headers,
          });
        }
        alert("🎉 Tạo quiz thành công! Hãy mời bạn bè cùng chơi nhé!");
        setQuizInfo({ title: "", description: "", categoryId: 0 });
        setQuestions([]);
        setFile(null);
        setStep(1);
      } else {
        // Nếu là quiz AI, lấy danh sách câu hỏi vừa sinh ra và cho phép chỉnh sửa
        const res = await axios.get(`http://localhost:8080/api/quizzes/${quizId}/questions`, { headers });
        setAiQuestions(res.data.data || []);
        setEditAI(true);
      }
    } catch (err: any) {
      if (err.response) {
        console.error("Lỗi chi tiết:", err.response.data);
        alert("Lỗi: " + (err.response.data?.message || JSON.stringify(err.response.data)));
      } else {
        alert("Lỗi: " + err.message);
      }
    }
    setLoading(false);
  };

  // Thêm/xóa câu hỏi cho nhập tay
  const addQuestion = () => setQuestions([...questions, { ...defaultQuestion }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  // Thay đổi đáp án
  const handleAnswerChange = (qIdx: number, aIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].answers[aIdx].answerText = value;
    setQuestions(newQuestions);
  };
  // Chọn đáp án đúng
  const handleCorrectChange = (qIdx: number, aIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].answers = newQuestions[qIdx].answers.map((ans, idx) => ({
      ...ans,
      isCorrect: idx === aIdx,
    }));
    setQuestions(newQuestions);
  };

  // Nếu đang chỉnh sửa câu hỏi AI
  if (editAI) {
    const token = localStorage.getItem("token");
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const handleSaveAI = async (idx: number) => {
      const q = aiQuestions[idx];
      await axios.put(`http://localhost:8080/api/questions/${q.id}`, q, { headers });
      alert("Đã lưu câu hỏi!");
    };
    return (
      <div className="home-container">
        <section className="quizzes-section">
          <div className="container">
            <h2 className="section-title text-pink-600">Câu hỏi AI vừa tạo</h2>
            <div className="quizzes-grid">
              {aiQuestions.map((q, idx) => (
                <div key={q.id || idx} className="quiz-card bg-white border rounded-lg shadow-inner p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-pink-600">Câu hỏi {idx + 1}</span>
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleSaveAI(idx)}
                      title="Lưu câu hỏi"
                    >
                      💾 Lưu
                    </button>
                  </div>
                  <input
                    className="block w-full mb-2 border p-2 rounded"
                    placeholder="Nội dung câu hỏi"
                    value={q.questionText}
                    onChange={e => {
                      const newQs = [...aiQuestions];
                      newQs[idx].questionText = e.target.value;
                      setAiQuestions(newQs);
                    }}
                  />
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Đáp án:</span>
                    {q.answers && q.answers.map((a, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2 mb-1">
                        <input
                          className="border p-1 rounded flex-1"
                          placeholder={`Đáp án ${aIdx + 1}`}
                          value={a.answerText}
                          onChange={e => {
                            const newQs = [...aiQuestions];
                            newQs[idx].answers[aIdx].answerText = e.target.value;
                            setAiQuestions(newQs);
                          }}
                        />
                        <input
                          type="radio"
                          checked={a.isCorrect}
                          onChange={() => {
                            const newQs = [...aiQuestions];
                            newQs[idx].answers = newQs[idx].answers.map((ans, i) => ({ ...ans, isCorrect: i === aIdx }));
                            setAiQuestions(newQs);
                          }}
                        />
                        <span className="text-xs text-green-600">Đúng</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="load-more-btn mt-4 w-full"
              onClick={() => { setEditAI(false); setStep(1); setQuizInfo({ title: "", description: "", categoryId: 0 }); setFile(null); setNumberOfQuestions(5); setDifficulty("medium"); }}
            >
              Hoàn tất
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Bước 1: Chọn chế độ
  if (step === 1) {
    return (
      <div className="home-container">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-card create-quiz">
              <div className="hero-card-content">
                <h2>Tạo một quiz</h2>
                <p>Dễ dàng tạo quiz trong vài phút</p>
                <button className="hero-btn primary" onClick={() => { setMode("text"); setStep(2); }}>✍️ Nhập tay</button>
              </div>
              <div className="hero-illustration">🎯</div>
            </div>
            <div className="hero-card ai-quiz">
              <div className="hero-card-content">
                <h2>A.I.</h2>
                <p>Tạo quiz với trí tuệ nhân tạo</p>
                <button className="hero-btn secondary" onClick={() => { setMode("file"); setStep(2); }}>📄 Upload file</button>
              </div>
              <div className="hero-illustration">🤖</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Bước 2: Form tương ứng
  return (
    <div className="home-container">
      <section className="quizzes-section">
        <div className="container">
          <button
            className="mb-4 px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            onClick={() => setStep(1)}
          >
            ← Quay lại
          </button>
          <h2 className="section-title text-pink-600 mb-4">Tạo Quiz Giải Trí</h2>
          <p className="text-center text-gray-600 mb-6">
            {mode === "text"
              ? "Nhập thông tin quiz và thêm từng câu hỏi!"
              : "Nhập thông tin quiz và upload file để AI tạo câu hỏi cho bạn!"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              className="border p-2 rounded"
              placeholder="Tiêu đề quiz"
              value={quizInfo.title}
              onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Mô tả ngắn"
              value={quizInfo.description}
              onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Category ID"
              type="number"
              value={quizInfo.categoryId}
              onChange={(e) => setQuizInfo({ ...quizInfo, categoryId: Number(e.target.value) })}
            />
          </div>
          {mode === "file" && (
            <div className="mb-4 bg-white rounded p-4 shadow-inner">
              <label className="block mb-2 font-semibold text-yellow-700">
                Chọn file tài liệu (PDF, DOCX...)
              </label>
              <input
                className="block w-full mb-2"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex gap-4 mb-2">
                <input
                  className="border p-2 rounded flex-1"
                  type="number"
                  min={1}
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                  placeholder="Số lượng câu hỏi"
                />
                <select
                  className="border p-2 rounded flex-1"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">
                🤖 AI sẽ tự động sinh câu hỏi từ file bạn upload!
              </p>
            </div>
          )}
          {mode === "text" && (
            <div>
              <button
                type="button"
                className="mb-4 px-4 py-2 bg-pink-500 text-white rounded-full font-semibold flex items-center gap-2 hover:bg-pink-600 transition"
                onClick={addQuestion}
              >
                <span role="img" aria-label="plus">
                  ➕
                </span>{" "}
                Thêm câu hỏi
              </button>
              <div className="quizzes-grid">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="quiz-card border p-4 mb-4 rounded-lg bg-white shadow-inner"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-pink-600">Câu hỏi {idx + 1}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeQuestion(idx)}
                        title="Xóa câu hỏi"
                      >
                        <span role="img" aria-label="delete">
                          🗑️
                        </span>
                      </button>
                    </div>
                    <input
                      className="block w-full mb-2 border p-2 rounded"
                      placeholder="Nội dung câu hỏi"
                      value={q.questionText}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[idx].questionText = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Đáp án:</span>
                      {q.answers.map((a, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2 mb-1">
                          <input
                            className="border p-1 rounded flex-1"
                            placeholder={`Đáp án ${aIdx + 1}`}
                            value={a.answerText}
                            onChange={(e) => handleAnswerChange(idx, aIdx, e.target.value)}
                          />
                          <input
                            type="radio"
                            checked={a.isCorrect}
                            onChange={() => handleCorrectChange(idx, aIdx)}
                          />
                          <span className="text-xs text-green-600">Đúng</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            className={`mt-4 px-8 py-3 rounded-full text-lg font-bold w-full transition-all duration-200 shadow-lg ${
              loading
                ? "bg-gray-400 text-white"
                : "bg-gradient-to-r from-pink-500 to-yellow-400 text-white hover:scale-105 hover:from-pink-400 hover:to-yellow-300"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "⏳ Đang xử lý..." : "🚀 Tạo quiz ngay!"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CreateQuiz;