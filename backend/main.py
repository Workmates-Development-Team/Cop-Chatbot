import boto3
import json
import numpy as np
import psycopg2
from flask import Flask, request, jsonify, Response
from dotenv import load_dotenv
import logging
import os
import time

load_dotenv()

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)
logger = logging.getLogger(__name__)

# --- AWS + DB Config ---
BEDROCK_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID_EMBED = os.getenv("MODEL_ID_EMBED", "amazon.titan-embed-text-v2:0")
MODEL_ID_CHAT = os.getenv("MODEL_ID_CHAT", "us.amazon.nova-lite-v1:0")
DATABASE_URL = os.getenv("DATABASE_URL")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Initialize clients
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=BEDROCK_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)
client = boto3.client(
    "bedrock-runtime",
    region_name=BEDROCK_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

# --- Flask App ---
app = Flask(__name__)

# --- Helpers ---
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        logger.info("Database connection established.")
        return conn, conn.cursor()
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

def split_text(text, max_words=2000):
    words = text.split()
    for i in range(0, len(words), max_words):
        yield ' '.join(words[i:i+max_words])

def embed_text(text, dimensions=256):
    request_body = json.dumps({
        "inputText": text,
        "dimensions": dimensions,
        "normalize": True
    })
    try:
        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID_EMBED,
            body=request_body,
            accept="application/json",
            contentType="application/json"
        )
        response_body = json.loads(response.get("body").read())
        logger.info("Text embedded successfully.")
        return response_body.get("embedding")
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise

def retrieve_similar_chunks(query_embedding, top_k=3):
    try:
        conn, cursor = get_db_connection()
        cursor.execute("SELECT chunk_index, embedding, file_name, chunk_text FROM embeddings")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        logger.info("Fetched embeddings from database.")
    except Exception as e:
        logger.error(f"Error retrieving embeddings: {e}")
        return []
    similarities = []
    query_vec = np.array(query_embedding)
    for chunk_index, embedding, file_name, chunk_text in rows:
        if embedding is None:
            continue
        emb_vec = np.array(embedding)
        sim = np.dot(emb_vec, query_vec) / (np.linalg.norm(emb_vec) * np.linalg.norm(query_vec))
        similarities.append((sim, chunk_index, file_name, chunk_text))
    
    similarities.sort(key=lambda x: x[0], reverse=True)
    return similarities[:top_k]

def call_nova_llm(prompt):
    system_prompt = [{"text": "You are a helpful assistant. Use the provided context to answer the user's question as accurately as possible."}]
    message_list = [{"role": "user", "content": [{"text": prompt}]}]
    inf_params = {"maxTokens": 500, "topP": 0.9, "topK": 20, "temperature": 0.7}

    request_body = {
        "schemaVersion": "messages-v1",
        "messages": message_list,
        "system": system_prompt,
        "inferenceConfig": inf_params,
    }

    try:
        response = client.invoke_model_with_response_stream(
            modelId=MODEL_ID_CHAT,
            body=json.dumps(request_body)
        )

        answer = ""
        stream = response.get("body")
        if stream:
            for event in stream:
                chunk = event.get("chunk")
                if chunk:
                    chunk_json = json.loads(chunk.get("bytes").decode())
                    delta = chunk_json.get("contentBlockDelta", {}).get("delta", {}).get("text", "")
                    answer += delta
        logger.info("LLM call successful.")
        return answer.strip()
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return "Error: LLM call failed."

# --- Routes ---
@app.route('/embed', methods=['POST'])
def embed_document():
    if 'file' in request.files:
        file = request.files['file']
        file_name = file.filename
        input_text = file.read().decode('utf-8')
    else:
        data = request.get_json()
        input_text = data.get('text')
        file_name = data.get('file_name', 'uploaded_text')

    if not input_text:
        logger.warning('No text provided for embedding.')
        return jsonify({'error': 'No text provided'}), 400

    conn, cursor = get_db_connection()

    # Ensure table exists with chunk_text column
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS embeddings (
            id SERIAL PRIMARY KEY,
            file_name TEXT,
            chunk_index INTEGER,
            embedding FLOAT8[],
            embedding_size INTEGER,
            chunk_text TEXT
        )
    ''')
    conn.commit()

    chunk_count = 0
    for idx, chunk in enumerate(split_text(input_text)):
        embedding = embed_text(chunk)
        cursor.execute(
            "INSERT INTO embeddings (file_name, chunk_index, embedding, embedding_size, chunk_text) VALUES (%s, %s, %s, %s, %s)",
            (file_name, idx + 1, embedding, len(embedding), chunk)
        )
        chunk_count += 1

    conn.commit()
    cursor.close()
    conn.close()
    logger.info(f'Embedded and stored {chunk_count} chunks for {file_name}.')
    return jsonify({'message': f'Embedded and stored {chunk_count} chunks for {file_name}.'})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_query = data.get('question')
    if not user_query:
        logger.warning('Missing question in chat request.')
        return jsonify({'error': 'Missing question'}), 400
    try:
        query_embedding = embed_text(user_query)
        top_chunks = retrieve_similar_chunks(query_embedding)

        # Use chunk_text directly from DB (no file reads)
        context = "\n\n".join([chunk_text for _, _, _, chunk_text in top_chunks])
        prompt = f"Context:\n{context}\n\nQuestion: {user_query}\nAnswer:"

        system_prompt = [{"text": "You are a helpful assistant. Use the provided context to answer the user's question as accurately as possible."}]
        message_list = [{"role": "user", "content": [{"text": prompt}]}]
        inf_params = {"maxTokens": 500, "topP": 0.9, "topK": 20, "temperature": 0.7}

        request_body = {
            "schemaVersion": "messages-v1",
            "messages": message_list,
            "system": system_prompt,
            "inferenceConfig": inf_params,
        }

        # Call the model with response stream
        response = client.invoke_model_with_response_stream(
            modelId=MODEL_ID_CHAT,
            body=json.dumps(request_body)
        )

        def generate():
            stream = response.get("body")
            if stream:
                for event in stream:
                    chunk = event.get("chunk")
                    if chunk:
                        chunk_json = json.loads(chunk.get("bytes").decode())
                        delta = chunk_json.get("contentBlockDelta", {}).get("delta", {}).get("text", "")
                        if delta:
                            yield delta
                            # optionally flush buffer or sleep slightly here if needed
            yield ''  # ensure generator completes cleanly

        logger.info('Chat response generated successfully.')
        return Response(generate(), content_type='text/plain')
    except Exception as e:
        logger.error(f'Chat endpoint failed: {e}')
        return jsonify({'error': 'Chat failed'}), 500

# --- Run App ---
if __name__ == "__main__":
    logger.info("Starting Flask app...")
    app.run(host="0.0.0.0", port=5000)
