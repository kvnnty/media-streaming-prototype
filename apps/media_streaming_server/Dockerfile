FROM node:22-alpine

# Install ffmpeg and curl
RUN apk add --no-cache ffmpeg curl

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install --production

COPY . .

# Create folders for HLS segments and recordings
RUN mkdir -p ./hls ./recordings

EXPOSE 1935 8000

CMD ["npm", "start"]
