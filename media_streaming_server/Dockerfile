FROM node:22-alpine

RUN apt-get update && apt-get install -y ffmpeg curl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --production

COPY . .

# create folders
RUN mkdir -p ./hls ./recordings

EXPOSE 1935 8000

CMD ["npm", "start"]
