# Use the official uv image with Python 3.12 and Debian slim
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Set the working directory
WORKDIR /app

# Install system dependencies needed to build psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev gcc

# Copy project files
COPY . .

# Sync dependencies
RUN uv sync

# Expose the port the app runs on
EXPOSE 5000:5000

# Run the app
CMD ["uv", "run", "main.py"]
