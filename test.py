from langchain_text_splitters import MarkdownHeaderTextSplitter
from sentence_transformers import SentenceTransformer
from nltk.tokenize import sent_tokenize
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

app = FastAPI()

class EmbedRequest(BaseModel):
    texts: list[str]

model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
headers_to_split_on = [(f"{'#' * i}", f"H{i}") for i in range(1, 11)]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

@app.post('/handle_file')
async def handle_file(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode('utf-8')
    split_texts = split_text(text)
    return split_texts

@app.post("/embed")
def embed_text(req: EmbedRequest):
    embeddings = model.encode(req.texts)
    return {"embeddings": embeddings.tolist()}
    
def split_text(content):
    docs = splitter.split_text(content)
    overlap_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    all_chunks = []
    index = 0
    for doc in docs:
        header = "\n".join([doc.metadata[h] for h in doc.metadata if doc.metadata[h]])
        content = header + "\n" + doc.page_content
        sub_chunks = overlap_splitter.split_text(content)
        for chunk in sub_chunks:
            all_chunks.append({
                "chunks": index,                
                "embedding": model.encode(chunk).tolist(),
                "text": chunk,
                "metadata": doc.metadata,
            })
            index += 1
    return all_chunks

# chunk section and semantic
# MAX_LEN = 600
# SEMANTIC_SIM_THRESHOLD = 0.6
# model = SentenceTransformer("all-MiniLM-L6-v2")

# semantic_chunk = []

# for doc in docs:
#     text = doc.page_content.strip()
#     if len(text) <= MAX_LEN:
#         semantic_chunk.append({"content": text, "metadata": doc.metadata})
#         continue

#     sentences = sent_tokenize(text)
#     embeddings = model.encode(sentences, convert_to_tensor=True)
#     similarity = util.cos_sim(embeddings, embeddings)

#     current_chunk = sentences[0]
#     for i in range(1, len(sentences)):
#         sim_score = float(similarity[i - 1][i])
#         if sim_score < SEMANTIC_SIM_THRESHOLD:
#             semantic_chunk.append({"content": current_chunk, "metadata": doc.metadata})
#             current_chunk = sentences[i]
#         else:
#             current_chunk += " " + sentences[i]

#     semantic_chunk.append({"content": current_chunk, "metadata": doc.metadata})
