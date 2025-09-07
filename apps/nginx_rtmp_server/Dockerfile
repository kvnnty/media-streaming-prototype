FROM ubuntu:22.04

# Install nginx with RTMP + ffmpeg
RUN apt-get update && \
  apt-get install -y nginx libnginx-mod-rtmp ffmpeg curl && \
  rm -rf /var/lib/apt/lists/*

# Copy configs & entrypoint
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Make streaming directories
RUN mkdir -p /hls/live /vod

# Persist stream data
VOLUME ["/hls", "/vod"]

EXPOSE 1935 8083

HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:8083 || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
