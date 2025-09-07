#!/bin/bash
set -e

# Ensure directories exist
mkdir -p /hls/live /vod

# Start Nginx
nginx -g "daemon off;"
