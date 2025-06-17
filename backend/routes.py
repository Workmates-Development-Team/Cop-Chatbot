from flask import Blueprint, request, jsonify, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging
import json
import numpy as np
import psycopg2
from functools import wraps
from PyPDF2 import PdfReader
import docx
import os
import base64
import jwt
import datetime
import boto3

from config import (
    bedrock_runtime, client, DATABASE_URL, MODEL_ID_EMBED, MODEL_ID_CHAT,
    ADMIN_USERNAME, ADMIN_PASSWORD, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BEDROCK_REGION
)

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")

logger = logging.getLogger(__name__)
routes = Blueprint('routes', __name__)
CORS_origins = CORS

# --- Admin Authentication ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            logger.warning("Missing or invalid Authorization header.")
            return jsonify({"error": "Unauthorized"}), 403
        token = auth_header.split(" ")[1]
        try:
            jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Optionally, you can check payload["username"] here
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired.")
            return jsonify({"error": "Token expired"}), 403
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token.")
            return jsonify({"error": "Unauthorized"}), 403
        return f(*args, **kwargs)
    return decorated_function

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

# Helper function to extract text from PDF
def extract_text_from_pdf(file):
    reader = PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Helper function to extract text from DOCX
def extract_text_from_docx(file):
    doc = docx.Document(file)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

def extract_text_from_image_aws_textract(image_bytes):
    textract_client = boto3.client(
        'textract',
        region_name=BEDROCK_REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    response = textract_client.detect_document_text(
        Document={'Bytes': image_bytes}
    )
    lines = []
    for item in response.get("Blocks", []):
        if item["BlockType"] == "LINE":
            lines.append(item["Text"])
    return "\n".join(lines)

# --- Routes ---
@routes.route('/embed', methods=['POST'])
# @admin_required
def embed_document():
    if 'file' in request.files:
        file = request.files['file']
        file_name = secure_filename(file.filename)
        file_extension = file_name.split('.')[-1].lower()

        if file_extension == 'pdf':
            input_text = extract_text_from_pdf(file)
        elif file_extension == 'docx':
            input_text = extract_text_from_docx(file)
        elif file_extension in ['jpg', 'jpeg', 'png']:
            image_bytes = file.read()
            try:
                input_text = extract_text_from_image_aws_textract(image_bytes)
            except Exception as e:
                logger.error(f"AWS Textract failed: {e}")
                input_text = ""
        elif file_extension in ['gif', 'bmp', 'webp']:
            image_bytes = file.read()
            try:
                input_text = extract_text_from_image_aws_textract(image_bytes)
            except Exception as e:
                logger.error(f"AWS Textract failed: {e}")
                input_text = f"[IMAGE_BASE64]{base64.b64encode(image_bytes).decode('utf-8')}"
        else:
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

@routes.route('/chat', methods=['POST'])
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

        system_prompt = [{"text": "You are a helpful assistant. Use only the provided context to answer the user's question as accurately as possible. Do not provide responses based on your own knowledge or assumptions. if you find the user's question irrelevant then answer- I'm here to help with information and services related to Kolkata Police. For anything beyond that, I recommend checking official government or general information sources. Please feel free to ask me anything specific about Kolkata Police!, you will only answer challan related question which belongs to kolkata city and west bengal state. for challans related to other states other than west bengal, simply say i can help you with queries in west bengal state. This chatbot is designed to provide information strictly related to the Kolkata Police and the state of West Bengal. It does not handle queries about challans or traffic violations from other Indian states such as Maharashtra, Tamil Nadu, Uttar Pradesh, Gujarat, Karnataka, Rajasthan, Bihar, Andhra Pradesh, Telangana, Madhya Pradesh, Punjab, Haryana, Kerala, Odisha, Assam, Jharkhand, Chhattisgarh, Himachal Pradesh, Uttarakhand, Goa, Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Arunachal Pradesh, and Sikkim. If you are looking for information regarding challans outside West Bengal, please refer to the respective state's traffic police website or Parivahan portal"}]
        message_list = [{"role": "user", "content": [{"text": prompt}]}]
        inf_params = {"maxTokens": 1024, "topP": 0.9, "topK": 20, "temperature": 0.3}

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
            yield ''  # ensure generator completes cleanly

        logger.info('Chat response generated successfully.')
        return Response(generate(), content_type='text/plain')
    except Exception as e:
        logger.error(f'Chat endpoint failed: {e}')
        return jsonify({'error': 'Chat failed'}), 500

# --- Login Route ---
@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        payload = {
            "username": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        return jsonify({"token": token}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
