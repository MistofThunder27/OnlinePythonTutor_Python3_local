from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import webbrowser
import json
import os

from back_end.process_requests import process_post

PORT = 8000
content_type_mapping = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png"
}


class LocalServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.path = "/front_end/index.html"

        if "?" in self.path:  # this can only be a question request
            self.path = self.path.split("?")[0]

        try:
            file_path = os.path.join(os.getcwd(), self.path[1:])
            if os.path.exists(file_path):
                file_type = content_type_mapping.get(os.path.splitext(self.path)[1], "")
                self.send_response(200)
                if file_type:
                    self.send_header("Content-type", file_type)
                self.end_headers()
                with open(file_path, "rb") as file:
                    self.wfile.write(file.read())
            else:
                self.send_error(404, "File not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def do_POST(self):
        output_json = json.dumps(
            process_post(parse_qs(self.rfile.read(int(self.headers["Content-Length"])).decode("utf-8"))), indent=4)

        with open("output.json", "w") as f:
            f.write(output_json)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(output_json.encode())


if __name__ == "__main__":
    print(f"Serving at port http://localhost:{PORT}/")
    webbrowser.open(f"http://localhost:{PORT}/")
    HTTPServer(("", PORT), LocalServer).serve_forever()
