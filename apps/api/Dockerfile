FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/

RUN npm install --workspace=@kullin/api --include-workspace-root=false || npm install

COPY packages/contracts packages/contracts
COPY apps/api apps/api

WORKDIR /app/apps/api

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
