FROM node:24-alpine

ENV NODE_ENV=production PORT=80 HOST=0.0.0.0 TRUST_PROXY=1
WORKDIR /app
COPY --chown=node:node server.mjs ./
COPY --chown=node:node public/ ./public/
COPY --chown=node:node dist/ ./dist/
USER node
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:80/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
