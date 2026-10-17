/* Cross-origin isolation via a service worker.

   webR needs SharedArrayBuffer, which browsers only grant to a
   cross-origin-isolated page. Isolation normally comes from two response
   headers, and some static hosts (GitHub Pages among them) cannot set
   headers at all. A service worker can add them to every response on its
   way to the page, which is enough.

   This file is both the page-side registrar and the worker itself; it tells
   the two apart by whether `window` exists. On a host that already sends the
   headers, such as the bundled serve.py, it detects isolation and does
   nothing.

   The approach is the well-known coi-serviceworker pattern. */

if (typeof window === 'undefined') {
  /* ---------- service worker context ---------- */

  self.addEventListener('install', function () {
    self.skipWaiting();
  });

  self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', function (event) {
    const r = event.request;

    // Range requests served from cache must be left alone.
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;

    // Under COEP credentialless, cross-origin no-cors requests are sent
    // without credentials. Re-issue them that way so the response is usable.
    const request = (r.mode === 'no-cors')
      ? new Request(r, { credentials: 'omit' })
      : r;

    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response.status === 0) return response;   // opaque, leave as is

          const headers = new Headers(response.headers);
          headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        })
        .catch(function (err) {
          console.error('[coi] fetch failed:', err);
        })
    );
  });

} else {
  /* ---------- page context ---------- */

  (function () {
    // Capture this synchronously; currentScript is null once async work starts.
    const selfUrl = document.currentScript && document.currentScript.src;

    if (window.crossOriginIsolated) return;        // headers already present
    if (!window.isSecureContext) return;           // needs https or localhost
    if (!navigator.serviceWorker) return;          // no support, nothing to do
    if (!selfUrl) return;

    navigator.serviceWorker.register(selfUrl).then(
      function (registration) {
        // A fresh worker only controls the page after a reload.
        if (!navigator.serviceWorker.controller) {
          registration.addEventListener('updatefound', function () {
            window.location.reload();
          });
          if (registration.active) window.location.reload();
        }
      },
      function (err) {
        console.error('[coi] registration failed:', err);
      }
    );
  })();
}
