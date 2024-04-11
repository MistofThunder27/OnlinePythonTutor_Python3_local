from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import json
import os

from back_end.process_requests import process_post, process_questions

PORT = 8000
content_type_mapping = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png"
}


class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.path = f"/front_end/index.html"

        if "?" in self.path:  # this can only be a question request
            self.path, question_file = self.path.split("?")
            print(self.path, question_file)
            if "=" in question_file:
                question_file = question_file.split("=")[-1]
                output_json = json.dumps(process_questions(f"questions/{question_file}.txt"))
                print(output_json)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(output_json.encode())
                return

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
    HTTPServer(("", PORT), MyServer).serve_forever()
