import http.server
import socketserver

PORT = 8000

# Define the handler to use
Handler = http.server.SimpleHTTPRequestHandler

# Set up the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port http://localhost:{PORT}/")
    httpd.serve_forever()
