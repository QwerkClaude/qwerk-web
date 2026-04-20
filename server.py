import http.server
import os
import sys

os.chdir("/Users/claudeqwerk/Desktop/qwerk-web")
port = 3456

handler = http.server.SimpleHTTPRequestHandler
httpd = http.server.HTTPServer(("", port), handler)
print(f"Serving on http://localhost:{port}")
httpd.serve_forever()
