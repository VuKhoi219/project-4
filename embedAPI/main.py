from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI()

# Load Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Định nghĩa request body
class TextRequest(BaseModel):
    text: str

# Hàm chia văn bản dài thành các đoạn nhỏ (theo số từ)
def chunk_text(text, chunk_size=200):
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

# Hàm sinh embedding trung bình cho văn bản dài
def get_mean_embedding(text: str):
    chunks = chunk_text(text)
    embeddings = model.encode(chunks)
    return np.mean(embeddings, axis=0)

# API endpoint
@app.post("/embed")
async def generate_embedding(req: TextRequest):
    try:
        embedding = get_mean_embedding(req.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
