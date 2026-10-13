# Canon Production Printing — Process Explorer

The explorer includes a server-side password gate for Coolify. The login page has a blurred, synthetic page image behind it. The real HTML, scripts, diagrams and other explorer files are served only after authentication.

## Deploy on Coolify

Use the existing Git repository with the **Dockerfile** build pack. Set **APP_PASSWORD** to your chosen shared password as a **runtime environment variable / secret**, then deploy. Do not put the password in Git, build arguments or frontend variables.

| Setting | Value |
| --- | --- |
| Build pack | Dockerfile |
| Base Directory | `/` |
| Dockerfile Location | `/Dockerfile` |
| Ports Exposes | `80` |
| Domain | Your HTTPS hostname |
| Required runtime environment variable | `APP_PASSWORD` |
| Host port mapping | Leave empty; use the Coolify proxy |
| Persistent storage | None |
| Install / build / start overrides | None |
| Health check | HTTP `GET /healthz` on internal port `80` |

The Dockerfile uses Node.js 24 and sets production mode, port 80 and one trusted proxy hop. The Coolify proxy terminates HTTPS. The server requires HTTPS for production requests, except the health check. A missing or empty password prevents startup, so the explorer is never exposed as a fallback.

**Do not use the Static build pack or serve `dist/` directly.** The Node server must handle every request for the password gate to protect the files. The previous Nginx-only configuration has been removed.

Changing `APP_PASSWORD` and restarting / redeploying logs out existing sessions. No separate session secret is required. Sessions are stored in memory for this single-instance application; restarting also clears them. Keep one replica for this simple deployment.

## Access behaviour

- Public: login page, Canon logo, gate fonts/CSS/script, the blurred synthetic preview, and `/healthz`.
- Protected: all explorer HTML, JavaScript, diagrams, reference content, JSON, fonts and assets in `dist/`.
- Passwords are checked on the server using scrypt and a timing-safe comparison. They are never sent to the frontend as configuration or written to request logs.
- Sessions use random opaque tokens in HttpOnly, Secure, SameSite=Strict host-bound cookies in production.
- Sessions expire after one hour idle or eight hours total. Sign out revokes the server session.
- Login allows five attempts per client address in fifteen minutes. The Coolify proxy's appended client address is used, rather than a user-supplied leftmost forwarding value.
- Forms have origin and CSRF checks. Protected responses are not cached.

This shared password does not create individual accounts. The explorer remains a browser simulation without a live SAP connection. The separately hosted ChatGPT Sites preview retains its platform access controls; this password server is for the Coolify deployment.

## Verify deployment

1. Open the HTTPS hostname in a private browser window. The blurred login gate should appear.
2. Request `/content.js` directly before signing in. It should return HTTP 401 without the script content.
3. Enter the password. Check Order process, Demand lab, IBP planning, Compare and Reference.
4. Sign out. Request `/content.js` again; it should return HTTP 401.
5. `/healthz` should return `ok` with HTTP 200.

## Local development

Use Node.js 24. No dependencies or install step are needed.

```sh
APP_PASSWORD='local-test-only' NODE_ENV=development ALLOW_INSECURE_HTTP=1 PORT=8080 HOST=127.0.0.1 node server.mjs
```

Open `http://127.0.0.1:8080`. The insecure-cookie option is for local development only and is rejected in production.

Run authentication tests:

```sh
node --test tests/auth.test.mjs
```

For Docker, create a private `.env` file from `.env.example`, fill in `APP_PASSWORD`, and supply it as runtime configuration. Local HTTP example:

```sh
docker build -t canon-process-explorer .
docker run --rm --env-file .env -e NODE_ENV=development -e ALLOW_INSECURE_HTTP=1 -p 127.0.0.1:8080:80 canon-process-explorer
```

## Update content

The explorer files remain editable in `dist/`. Commit/push changes, then redeploy in Coolify. Keep `server.mjs` and `public/` alongside `dist/`; these enforce access and provide the login page. `.env` files are excluded from Git and the Docker build.

The explorer content remains based on published source commit `730fc92ac4c5c51fd873a02c23e04ecf237a312d`. No real password, hosting credential, Git metadata or local QA material is included in deployment ZIPs.

See `CHANGES.md`, `CONTENT-REVIEW.md`, `SECURITY.md` and `VERIFICATION.md` for the process-model and access-control details.
