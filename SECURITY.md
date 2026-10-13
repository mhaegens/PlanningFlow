# Password gate

The server protects the explorer content. The public background is a pre-blurred PNG rendered from a synthetic layout; it does not contain real diagrams, order data or protected application markup. Removing styles or opening the image cannot retrieve the explorer.

## Boundary

`APP_PASSWORD` is required at startup and read only on the server. Static explorer files are loaded from `dist/` into a private file map. Authorization runs before that map can be served. Filesystem paths are not assembled from untrusted request paths; hidden files and symlinks are excluded. Only six explicit gate-asset URLs are public. The server code and environment files are never in a served file map.

Passwords are verified with scrypt and a timing-safe comparison. Sessions use 256-bit random identifiers; only their hashes are retained server-side. Production cookies use the `__Host-` prefix, Secure, HttpOnly, SameSite=Strict and Path=/, with no Domain attribute. Session identifiers are not placed in URLs or browser storage.

Both form endpoints check Origin and a CSRF token. Pre-login tokens are signed, expire after ten minutes and must match the HttpOnly gate cookie. Logout requires the session's CSRF token. Login rotates any prior session, rejects external return URLs and clears the gate cookie.

Login attempts are limited per address, verification concurrency is bounded, form/header sizes and request timeouts are bounded, and session/attempt maps are capped and cleaned up. The trusted proxy setting assumes one Coolify proxy hop and uses the rightmost appended client address. Production should expose the application through that HTTPS proxy with no public host-port mapping.

Authenticated responses carry `Cache-Control: no-store, private` and `Vary: Cookie`. Framing is denied and a restrictive CSP allows only local scripts and assets. Inline styles remain allowed because the existing diagram renderer uses dynamic style attributes. Returning to an authenticated page through browser history reloads it, so revoked sessions return to the gate.

Sessions expire after one hour idle or eight hours absolute. Logout revokes the token, and changing the password / restarting clears all sessions. This is a single-instance shared-password gate, with no per-person account or persistent session store.

## References

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Node.js crypto](https://nodejs.org/api/crypto.html)
