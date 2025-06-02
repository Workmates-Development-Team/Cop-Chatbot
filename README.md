# Cop-Chatbot

A full-stack chatbot application with a React + Vite frontend and a Python FastAPI backend.

---

## Prerequisites

- **Frontend:** Node.js (v18+ recommended) and npm or bun
- **Backend:** Python 3.9+ (with pip or [uv](https://github.com/astral-sh/uv)), or Docker

---

## Running the Frontend

1. Open a terminal and navigate to the `Frontend` directory:
   ```sh
   cd Frontend
   ```
2. Install dependencies:
   - With npm:
     ```sh
     npm install
     ```
   - Or with bun:
     ```sh
     bun install
     ```
3. Start the development server:
   - With npm:
     ```sh
     npm run dev
     ```
   - Or with bun:
     ```sh
     bun run dev
     ```
4. Open your browser at [http://localhost:5173](http://localhost:5173)

---

## Running the Backend

1. Open a terminal and navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. (Recommended) Create and activate a virtual environment:
   ```sh
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```sh
   python main.py
   ```
   The backend will be available at [http://localhost:5000](http://localhost:5000)

### Alternative: Using [uv](https://github.com/astral-sh/uv)

If you have `uv` installed, you can use it for faster dependency management:

```sh
uv venv
uv sync  # or: uv pip install -r requirements.txt
uv run main.py
```

---

## Using Docker for Backend (Optional)

1. Build the Docker image:
   ```sh
   docker build -t cop-chatbot-backend .
   ```
2. Run the container:
   ```sh
   docker run -p 5000:5000 cop-chatbot-backend
   ```
   The backend will be available at [http://localhost:5000](http://localhost:5000)

---

## Notes
- Start the backend before using the frontend chatbot.
- If you change the backend port, update the API URL in the frontend accordingly.
- For production, consider using a process manager (e.g., gunicorn, uvicorn) and a reverse proxy (e.g., nginx).

---

## Project Structure

```
Cop-Chatbot/
├── Frontend/      # React + Vite frontend
├── backend/       # FastAPI backend
└── README.md      # This file
```

---


