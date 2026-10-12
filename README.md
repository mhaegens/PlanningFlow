# Canon Production Printing — Process Explorer

Standalone Coolify deployment package, updated on 12 October 2026 following expert feedback on IBP supply planning and MTO confirmation.
All HTML, CSS, JavaScript, fonts, logos, and icons are included in `dist/`.
There is no build step, backend, database, API key, or required environment variable.
The process simulator runs in the browser and has no live SAP connection.

## Deploy on Coolify

1. Unzip this package. Put the contents of `canon-production-process-explorer-coolify/` at the root of a Git repository that your Coolify instance can access, and commit/push them. Include the `dist` directory.
2. In Coolify, add an application using that **Git repository**.
3. Select the **Dockerfile** build pack / build strategy and use the following settings.
4. Set the domain you want to use, then select **Deploy**.

| Setting | Value |
| --- | --- |
| Build pack / build strategy | Dockerfile |
| Base Directory | `/` |
| Dockerfile Location | `/Dockerfile` |
| Ports Exposes | `80` |
| Host port mapping | Leave empty; use the Coolify proxy |
| Environment variables | None |
| Persistent storage | None |
| Install / build / start command overrides | None; the Dockerfile supplies the server command |
| Health check | Included in the Dockerfile: HTTP `GET /healthz` on internal port `80` |

If this folder is inside a larger repository, set Base Directory to its path in that repository instead. Keep the Dockerfile and `dist/` together in that directory.

Use a Git-based application for this package. Coolify's **Dockerfile without Git** option has no source-file build context and cannot use this Dockerfile's `COPY` instructions by itself.

Deploy at the root of a hostname. For example, the app's sections will be available at `/#journey`, `/#demand`, `/#compare`, and `/#reference`. HTTPS certificates and domain routing are handled by the Coolify proxy; the container itself serves HTTP on port 80.

### Access

This standalone package has no application login. The access restriction on the original ChatGPT-hosted site does not transfer with the files. To keep the Coolify copy private, configure access protection in Coolify or your reverse proxy before exposing its domain.

### Alternative: Coolify Static build pack

The site was already compatible with static hosting. You can instead select **Static**, set **Base Directory** to `/dist`, and use Coolify's default Nginx server on port `80`. No build command is needed. For that option, use `/` as the health-check path; `/healthz` is provided only by the included Dockerfile's Nginx configuration.

## Check the deployment

- Open the home page and confirm both logos, fonts, and library icons load.
- Switch between Order process, Demand lab, Compare, and Reference; refresh each section.
- Change the fulfilment scenario and supply-planning design, advance the process, and open a step explanation.
- In MTO, check the SBC request → PP/DS simulation → confirmation sequence.
- In MTS/CTO, compare the IBP planned-order handover with the S/4-led PIR/MRP route.
- For the Dockerfile deployment, open `/healthz`; it should return `ok` with HTTP 200.

## Run locally with Docker

From this directory:

```sh
docker build -t canon-process-explorer .
docker run --rm --name canon-process-explorer -p 127.0.0.1:8080:80 canon-process-explorer
```

Open `http://localhost:8080`. In another terminal, check:

```sh
curl --fail http://localhost:8080/healthz
docker inspect --format '{{.State.Health.Status}}' canon-process-explorer
```

## Update the content

Edit the files in `dist/`, commit/push, and redeploy in Coolify. These are the editable source files; no compilation is required. The server asks browsers to revalidate cached files so updates use the current CSS, JavaScript, and logo assets.

The package preserves the application files from source commit `fb5a912a8b02cab3cc8481780d07051a373126c3`. It excludes ChatGPT hosting metadata, source-repository credentials, and local QA files.

## Documentation

- [Coolify: Dockerfile deployments](https://coolify.io/docs/applications/builds/dockerfile)
- [Coolify: Static deployments](https://coolify.io/docs/applications/builds/static)
- [Coolify: Health checks](https://coolify.io/docs/applications/configuration/health-checks)
