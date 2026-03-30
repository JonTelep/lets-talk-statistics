# Single-container Next.js standalone build
# No Python backend required — all API routes are Next.js API routes
FROM docker.io/library/node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_SITE_NAME="Let's Talk Statistics"
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage — standalone output
FROM docker.io/library/node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

# Copy standalone build + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3003

CMD ["node", "server.js"]
