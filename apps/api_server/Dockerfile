FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
