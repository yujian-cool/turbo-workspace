# service
FROM node:18-alpine

WORKDIR /app

RUN npm install pnpm -g

RUN npm install -g turbo

COPY . /app

RUN pnpm install && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start", "--filter=chat-server"]