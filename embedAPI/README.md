# 🧠 Text Embedding API with FastAPI + Anaconda

Dự án này cung cấp một API để nhúng (embed) văn bản bằng mô hình ngôn ngữ, sử dụng FastAPI và Anaconda.

---

## 🛠️ Yêu cầu hệ thống

- Python 3.11+ (khuyến nghị)
- [Anaconda](https://www.anaconda.com/) hoặc [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
- Mạng Internet (nếu mô hình cần tải lần đầu)
- RAM tối thiểu: 4GB (khuyến nghị 8GB+)

---

## 📦 Cài đặt môi trường

### Bước 1: Tạo môi trường ảo (Chạy 1 lần)

```bash
# Tạo môi trường với Python 3.11
conda create -n embed_env python=3.11

# Kích hoạt môi trường
conda activate embed_env
```

### Bước 2: Cài đặt thư viện

```bash
# Cài đặt từ file requirements.txt (nếu có)
pip install -r requirements.txt

# Hoặc cài đặt thủ công các thư viện cần thiết
pip install fastapi uvicorn sentence-transformers torch transformers numpy
```

### Bước 3: Kiểm tra cài đặt

```bash
# Kiểm tra phiên bản Python
python --version

# Kiểm tra các thư viện đã cài đặt
pip list | grep -E "(fastapi|uvicorn|sentence-transformers)"
```

---

## 🚀 Khởi động server FastAPI

```bash
# Di chuyển vào thư mục dự án
cd embedAPI

# Chạy server ở cổng 8000 (mặc định)
uvicorn main:app --reload --port 8000

# Chạy server ở cổng tùy chỉnh
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

### 🔗 Truy cập giao diện

Sau khi chạy thành công, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Base URL**: http://localhost:8000

---

## 🧪 Sử dụng API

### 📥 Endpoint chính

```http
POST /embed
Content-Type: application/json
```

### 📋 Request Body

```json
{
  "text": "Tôi thích học lập trình Python vì nó rất thú vị và dễ áp dụng."
}
```

### 📤 Response

```json
{
  "embedding": [0.1234, -0.5678, 0.9012, ..., 0.3321],
  "dimension": 768,
  "model": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
}
```

---

## 🧰 Ví dụ sử dụng

### 1. Sử dụng cURL

```bash
# Gửi yêu cầu embed văn bản
curl -X POST "http://localhost:8000/embed" \
     -H "Content-Type: application/json" \
     -d "{\"text\": \"Tôi thích học lập trình Python vì nó rất thú vị và dễ áp dụng.\"}"
```

### 2. Sử dụng Python Client

```python
import requests
import json

# Cấu hình API
API_URL = "http://localhost:8000/embed"
headers = {"Content-Type": "application/json"}

# Dữ liệu đầu vào
data = {
    "text": "Tôi thích học lập trình Python vì nó rất thú vị và dễ áp dụng."
}

# Gửi yêu cầu
response = requests.post(API_URL, headers=headers, json=data)

# Xử lý kết quả
if response.status_code == 200:
    result = response.json()
    embedding = result["embedding"]
    print(f"Embedding dimension: {len(embedding)}")
    print(f"First 5 values: {embedding[:5]}")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### 3. Sử dụng JavaScript/Node.js

```javascript
const axios = require('axios');

async function getEmbedding(text) {
    try {
        const response = await axios.post('http://localhost:8000/embed', {
            text: text
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Embedding dimension:', response.data.embedding.length);
        console.log('First 5 values:', response.data.embedding.slice(0, 5));
        
        return response.data.embedding;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

// Sử dụng
getEmbedding("Tôi thích học lập trình Python vì nó rất thú vị và dễ áp dụng.");
```

### 4. Batch Processing (nhiều văn bản)

```python
import requests
import json

def batch_embed(texts):
    """Nhúng nhiều văn bản cùng lúc"""
    API_URL = "http://localhost:8000/embed"
    headers = {"Content-Type": "application/json"}
    
    embeddings = []
    for text in texts:
        data = {"text": text}
        response = requests.post(API_URL, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            embeddings.append(result["embedding"])
        else:
            print(f"Error with text: {text}")
            embeddings.append(None)
    
    return embeddings

# Ví dụ sử dụng
texts = [
    "Python là ngôn ngữ lập trình mạnh mẽ.",
    "Machine Learning đang phát triển nhanh chóng.",
    "FastAPI giúp xây dựng API nhanh chóng."
]

embeddings = batch_embed(texts)
print(f"Processed {len(embeddings)} texts")
```

### 5. Sử dụng từ Java Spring Boot

#### 5.1. Thêm dependencies vào pom.xml

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot WebClient -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    
    <!-- Jackson for JSON processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

#### 5.2. Tạo model classes

```java
// EmbeddingRequest.java
public class EmbeddingRequest {
    private String text;
    
    // Constructors
    public EmbeddingRequest() {}
    
    public EmbeddingRequest(String text) {
        this.text = text;
    }
    
    // Getter and Setter
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}

// EmbeddingResponse.java
public class EmbeddingResponse {
    private double[] embedding;
    private int dimension;
    private String model;
    
    // Constructors
    public EmbeddingResponse() {}
    
    // Getters and Setters
    public double[] getEmbedding() { return embedding; }
    public void setEmbedding(double[] embedding) { this.embedding = embedding; }
    
    public int getDimension() { return dimension; }
    public void setDimension(int dimension) { this.dimension = dimension; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
```

#### 5.3. Tạo Service để gọi API

```java
@Service
public class EmbeddingService {
    
    private final WebClient webClient;
    
    @Value("${embedding.api.url:http://localhost:8000}")
    private String embeddingApiUrl;
    
    public EmbeddingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    
    /**
     * Gọi API embedding đồng bộ
     */
    public EmbeddingResponse getEmbedding(String text) {
        EmbeddingRequest request = new EmbeddingRequest(text);
        
        try {
            return webClient.post()
                    .uri(embeddingApiUrl + "/embed")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .bodyToMono(EmbeddingResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error calling embedding API: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gọi API embedding bất đồng bộ
     */
    public Mono<EmbeddingResponse> getEmbeddingAsync(String text) {
        EmbeddingRequest request = new EmbeddingRequest(text);
        
        return webClient.post()
                .uri(embeddingApiUrl + "/embed")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(request))
                .retrieve()
                .bodyToMono(EmbeddingResponse.class)
                .timeout(Duration.ofSeconds(30))
                .onErrorMap(Exception.class, 
                    ex -> new RuntimeException("Error calling embedding API: " + ex.getMessage(), ex));
    }
    
    /**
     * Batch processing - xử lý nhiều văn bản
     */
    public List<EmbeddingResponse> getEmbeddingsBatch(List<String> texts) {
        return texts.parallelStream()
                .map(this::getEmbedding)
                .collect(Collectors.toList());
    }
    
    /**
     * Batch processing bất đồng bộ
     */
    public Flux<EmbeddingResponse> getEmbeddingsBatchAsync(List<String> texts) {
        return Flux.fromIterable(texts)
                .flatMap(this::getEmbeddingAsync)
                .onErrorContinue((throwable, o) -> {
                    // Log error but continue with other texts
                    System.err.println("Error processing text: " + o + ", Error: " + throwable.getMessage());
                });
    }
}
```

#### 5.4. Tạo Controller sử dụng service

```java
@RestController
@RequestMapping("/api/v1/text")
public class TextController {
    
    private final EmbeddingService embeddingService;
    
    public TextController(EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
    }
    
    /**
     * Endpoint để nhúng một văn bản
     */
    @PostMapping("/embed")
    public ResponseEntity<EmbeddingResponse> embedText(@RequestBody EmbeddingRequest request) {
        try {
            EmbeddingResponse response = embeddingService.getEmbedding(request.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    
    /**
     * Endpoint để nhúng nhiều văn bản
     */
    @PostMapping("/embed/batch")
    public ResponseEntity<List<EmbeddingResponse>> embedTexts(@RequestBody List<String> texts) {
        try {
            List<EmbeddingResponse> responses = embeddingService.getEmbeddingsBatch(texts);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }
    
    /**
     * Endpoint bất đồng bộ
     */
    @PostMapping("/embed/async")
    public Mono<ResponseEntity<EmbeddingResponse>> embedTextAsync(@RequestBody EmbeddingRequest request) {
        return embeddingService.getEmbeddingAsync(request.getText())
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }
}
```

#### 5.5. Configuration

```java
@Configuration
public class WebClientConfig {
    
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build()
                .mutate();
    }
}
```

#### 5.6. Application Properties

```properties
# application.properties
embedding.api.url=http://localhost:8000
logging.level.org.springframework.web.reactive.function.client=DEBUG

# Timeout settings
spring.webflux.timeout=30s
```

#### 5.7. Ví dụ sử dụng trong Business Logic

```java
@Service
public class DocumentProcessingService {
    
    private final EmbeddingService embeddingService;
    
    public DocumentProcessingService(EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
    }
    
    /**
     * Xử lý tài liệu và tạo embedding
     */
    public void processDocument(String documentContent) {
        try {
            // Chia nhỏ tài liệu thành các đoạn
            List<String> chunks = splitIntoChunks(documentContent, 500);
            
            // Tạo embedding cho từng đoạn
            List<EmbeddingResponse> embeddings = embeddingService.getEmbeddingsBatch(chunks);
            
            // Lưu vào database hoặc xử lý tiếp
            saveEmbeddings(embeddings);
            
        } catch (Exception e) {
            System.err.println("Error processing document: " + e.getMessage());
        }
    }
    
    /**
     * Tìm kiếm tài liệu tương tự
     */
    public List<String> findSimilarDocuments(String queryText) {
        // Tạo embedding cho query
        EmbeddingResponse queryEmbedding = embeddingService.getEmbedding(queryText);
        
        // Tính toán similarity với các tài liệu đã lưu
        // Implementation depends on your database and similarity calculation
        
        return Collections.emptyList(); // Placeholder
    }
    
    private List<String> splitIntoChunks(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        for (int i = 0; i < text.length(); i += chunkSize) {
            chunks.add(text.substring(i, Math.min(i + chunkSize, text.length())));
        }
        return chunks;
    }
    
    private void saveEmbeddings(List<EmbeddingResponse> embeddings) {
        // Implement database saving logic
    }
}
```

#### 5.8. Test cases

```java
@SpringBootTest
class EmbeddingServiceTest {
    
    @Autowired
    private EmbeddingService embeddingService;
    
    @Test
    void testGetEmbedding() {
        String text = "Tôi thích học lập trình Java Spring Boot";
        EmbeddingResponse response = embeddingService.getEmbedding(text);
        
        assertNotNull(response);
        assertNotNull(response.getEmbedding());
        assertTrue(response.getEmbedding().length > 0);
    }
    
    @Test
    void testGetEmbeddingsBatch() {
        List<String> texts = Arrays.asList(
            "Java Spring Boot là framework mạnh mẽ",
            "Python FastAPI rất nhanh và dễ sử dụng",
            "Machine Learning đang phát triển nhanh chóng"
        );
        
        List<EmbeddingResponse> responses = embeddingService.getEmbeddingsBatch(texts);
        
        assertEquals(3, responses.size());
        responses.forEach(response -> {
            assertNotNull(response);
            assertNotNull(response.getEmbedding());
        });
    }
}
```

---

## 🐳 Docker Support (Tùy chọn)

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  embedding-api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
    environment:
      - MODEL_CACHE_DIR=/app/models
```

### Chạy với Docker

```bash
# Build image
docker build -t embedding-api .

# Chạy container
docker run -p 8000:8000 embedding-api

# Hoặc sử dụng docker-compose
docker-compose up -d
```

---

## 🧱 Cấu trúc thư mục

```
embedAPI/
├── main.py              # File chính khởi tạo FastAPI và xử lý API
├── requirements.txt     # Danh sách thư viện cần thiết
├── README.md           # Tài liệu hướng dẫn sử dụng
├── config.py           # Cấu hình ứng dụng
├── models/             # Thư mục lưu trữ mô hình
├── tests/              # Thư mục test
│   ├── test_api.py     # Test API endpoints
│   └── test_embedding.py # Test embedding functionality
├── docker-compose.yml  # Docker compose configuration
├── Dockerfile         # Docker image configuration
└── .env               # Biến môi trường (không commit)
```

---

## 🔧 Cấu hình nâng cao

### Tùy chỉnh mô hình

```python
# Trong main.py
from sentence_transformers import SentenceTransformer

# Các mô hình khác nhau
MODELS = {
    "multilingual": "paraphrase-multilingual-MiniLM-L12-v2",
    "vietnamese": "VoVanPhuc/sup-SimCSE-VietNamese-phobert-base",
    "english": "all-MiniLM-L6-v2"
}

# Khởi tạo mô hình
model = SentenceTransformer(MODELS["multilingual"])
```

### Biến môi trường (.env)

```env
MODEL_NAME=paraphrase-multilingual-MiniLM-L12-v2
MODEL_CACHE_DIR=./models
API_PORT=8000
API_HOST=0.0.0.0
MAX_TEXT_LENGTH=1000
BATCH_SIZE=32
```

---

## 🔍 Troubleshooting

### Lỗi thường gặp

1. **Lỗi "ModuleNotFoundError"**
   ```bash
   # Kiểm tra môi trường đã kích hoạt
   conda activate embed_env
   
   # Cài đặt lại thư viện
   pip install -r requirements.txt
   ```

2. **Lỗi "Port already in use"**
   ```bash
   # Tìm process đang sử dụng port
   lsof -i :8000
   
   # Kill process
   kill -9 <PID>
   
   # Hoặc đổi port
   uvicorn main:app --reload --port 8081
   ```

3. **Lỗi tải mô hình**
   ```bash
   # Kiểm tra kết nối mạng
   ping huggingface.co
   
   # Tải mô hình thủ công
   python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"
   ```

### Kiểm tra hiệu suất

```bash
# Sử dụng Apache Bench
ab -n 100 -c 10 -p test_data.json -T application/json http://localhost:8000/embed

# Sử dụng curl để test thời gian phản hồi
curl -w "@curl-format.txt" -o /dev/null -s -X POST \
     -H "Content-Type: application/json" \
     -d '{"text":"Test text"}' \
     http://localhost:8000/embed
```

---

## 📌 Lưu ý quan trọng

1. **Khởi động lại máy**: Hãy chạy `conda activate embed_env` trước khi khởi động server
2. **Cổng tùy chỉnh**: Nếu chạy ở cổng khác, cập nhật URL trong các ví dụ
3. **Bảo mật**: Không expose API ra internet mà không có authentication
4. **Hiệu suất**: Mô hình sẽ được cache sau lần tải đầu tiên
5. **Giới hạn**: API có thể giới hạn độ dài văn bản tối đa (mặc định: 1000 ký tự)

---

## 🚀 Tính năng nâng cao

### 1. Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

### 2. Similarity API

```python
@app.post("/similarity")
async def calculate_similarity(data: SimilarityRequest):
    embedding1 = model.encode(data.text1)
    embedding2 = model.encode(data.text2)
    similarity = cosine_similarity([embedding1], [embedding2])[0][0]
    return {"similarity": float(similarity)}
```

### 3. Batch Processing

```python
@app.post("/embed/batch")
async def batch_embed(data: BatchRequest):
    embeddings = model.encode(data.texts)
    return {"embeddings": embeddings.tolist()}
```

---

## 👥 Thông tin nhóm

| Vai trò | Tên thành viên | Liên hệ |
|---------|---------------|---------|
| ✅ **Backend Developer** | [Tên của bạn] | [Email/GitHub] |
| ✅ **Tester** | [Tên khác] | [Email/GitHub] |
| ✅ **DevOps** | [Tên khác] | [Email/GitHub] |

---

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Sentence Transformers](https://www.sbert.net/)
- [Uvicorn Server](https://www.uvicorn.org/)
- [Anaconda Documentation](https://docs.anaconda.com/)

---

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

1. Fork dự án
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

**🎉 Chúc bạn sử dụng API thành công!**