FROM tiangolo/nginx-rtmp:latest

# Install ffmpeg on Debian
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy your custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf
