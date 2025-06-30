import os
from dotenv import load_dotenv
import boto3

load_dotenv()

# --- AWS + DB Config ---
BEDROCK_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID_EMBED = os.getenv("MODEL_ID_EMBED", "amazon.titan-embed-text-v2:0")
MODEL_ID_CHAT = os.getenv("MODEL_ID_CHAT", "us.amazon.nova-pro-v1:0")
DATABASE_URL = os.getenv("DATABASE_URL")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "default_admin_token")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "change_this_admin_username")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change_this_admin_password")

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
