import logging
from flask import Flask
from flask_cors import CORS
from routes import routes

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)
logger = logging.getLogger(__name__)

# --- Flask App ---
app = Flask(__name__)
CORS(app)
app.register_blueprint(routes)

# --- Run App ---
if __name__ == "__main__":
    logger.info("Starting Flask app...")
    app.run(host="0.0.0.0", port=5000, debug=True)
