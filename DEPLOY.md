# Putting R Practice online

The whole app is static files, so any static host can serve it, with one catch.

## The catch: two response headers

R runs here as WebAssembly through webR, which needs `SharedArrayBuffer`. Browsers
only hand that out to a page that is **cross-origin isolated**, which takes two
response headers:

    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: credentialless

Without them the page loads, the editor works, and R never starts. This is the
same reason the site needs `serve.py` locally instead of opening `index.html`
from the file system.

The `_headers` file next to this one already sets them. Netlify and Cloudflare
Pages both read that file, so those two need no further setup.

## Option 1, Cloudflare Pages (free, keeps working)

1. Sign in at https://dash.cloudflare.com, then Workers & Pages, Create, Pages,
   "Upload assets".
2. Name the project, then drag the whole `r-practice` folder in.
3. Deploy. The URL is `https://<project>.pages.dev`.

`_headers` is picked up automatically. Re-upload the folder to publish changes.

## Option 2, Netlify (free, fastest to a first URL)

1. Go to https://app.netlify.com/drop.
2. Drag the whole `r-practice` folder onto the page.

That gives a live URL in a few seconds. Sign in afterwards to keep the site and
get a nicer name, otherwise it is temporary.

## Option 3, Vercel

Vercel ignores `_headers`. Add `vercel.json` beside `index.html`:

    {
      "headers": [{
        "source": "/(.*)",
        "headers": [
          { "key": "Cross-Origin-Opener-Policy",   "value": "same-origin" },
          { "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" },
          { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
        ]
      }]
    }

Then `npx vercel deploy --prod` from this folder, or import the repo on
vercel.com.

## Not GitHub Pages, at least not directly

GitHub Pages cannot set custom response headers, so R will not start there. The
usual way round it is `coi-serviceworker.js`, a small script that installs a
service worker to re-serve the page with the two headers. It works, but it adds
a dependency and the first load has to register the worker and reload itself.
Pick Cloudflare or Netlify instead unless the repo has to live on GitHub Pages.

## Checking it worked

Open the deployed URL and watch the chip in the top bar. "R ready" means the
headers are right. If it sticks on "Starting R" or reports a failure, open the
console and run:

    crossOriginIsolated

`true` means the headers are being sent. `false` means they are not, and nothing
else will fix it.

## One note on Safari

`credentialless` is a Chrome and Firefox feature. Safari wants
`Cross-Origin-Embedder-Policy: require-corp` instead, which also requires every
cross-origin asset to opt in with its own CORP header. webR's CDN does send one,
so switching the value is usually enough if Safari support matters.
