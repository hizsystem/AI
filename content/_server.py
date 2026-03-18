"""Simple HTTP server that supports GET (serve files) and PUT (save files)."""
import http.server
import os

BASEDIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASEDIR, **kw)

    def do_PUT(self):
        path = os.path.join(BASEDIR, self.path.lstrip('/'))
        path = os.path.normpath(path)
        if not path.startswith(BASEDIR):
            self.send_error(403)
            return
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        with open(path, 'wb') as f:
            f.write(body)
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'OK')
        print(f"  Saved: {path} ({len(body)} bytes)")

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    s = http.server.HTTPServer(('', 8080), Handler)
    print(f"Serving {BASEDIR} on http://localhost:8080 (PUT enabled)")
    s.serve_forever()
