"""Static server for R Practice.

webR runs R as WebAssembly in a worker and wants SharedArrayBuffer, which
browsers only hand out to a cross-origin-isolated page. That needs two response
headers the stock `python -m http.server` does not send, so this small wrapper
adds them. COEP is set to `credentialless` so the page can still pull webR's
own assets from webr.r-wasm.org without them opting in.

    python serve.py            # http://localhost:8787
    python serve.py 9000       # another port
"""

import sys
import functools
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent.resolve()


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "credentialless")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "404" in (fmt % args):
            sys.stderr.write("  missing: %s\n" % (fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
    handler = functools.partial(Handler, directory=str(ROOT))
    url = "http://localhost:%d/" % port
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print("R Practice is serving %s" % ROOT)
    print("Open %s" % url)
    print("Press Ctrl+C to stop.")
    if "--no-open" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
