# Verification

- All 11 application files match the published source byte for byte, including the corrected logo.
- All local asset references resolve; all three JavaScript files pass syntax checks.
- Browser check: all four sections load and survive refresh.
- Browser check: changing the fulfilment scenario, advancing a process step, and opening its explanation work.
- No external runtime requests, browser script errors, or failed asset requests occurred.
- Docker and Nginx are not installed in the preparation environment. The container build, Nginx configuration, and container health check have not been executed here. Use the Docker commands in README.md or the first Coolify deployment to verify those.
- No deployment to a Coolify instance has been performed.
