from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import os
import sys

file_path = os.path.join(os.path.dirname(__file__), "cgi-bin")
print(file_path)
sys.path.append(file_path)

import pg_logger

PORT = 8000


class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"

        try:
            # Get the current working directory
            root_dir = os.getcwd()

            # Get the full path of the requested file
            file_path = os.path.join(root_dir, self.path[1:])

            # Check if the requested file exists
            if os.path.exists(file_path):
                # Open the file in binary mode
                with open(file_path, "rb") as file:
                    # Read the file contents
                    file_data = file.read()

                # Set the response status code
                self.send_response(200)

                # Set the Content-Type header based on file extension
                if self.path.endswith(".html"):
                    self.send_header("Content-type", "text/html")
                elif self.path.endswith(".css"):
                    self.send_header("Content-type", "text/css")
                elif self.path.endswith(".js"):
                    self.send_header("Content-type", "application/javascript")
                elif self.path.endswith((".jpg", ".jpeg")):
                    self.send_header("Content-type", "image/jpeg")
                elif self.path.endswith(".png"):
                    self.send_header("Content-type", "image/png")

                # End headers
                self.end_headers()

                # Send the file data as the response
                self.wfile.write(file_data)
            else:
                # If the file doesn"t exist, return a 404 response
                self.send_error(404, "File not found")
        except Exception as e:
            # If an error occurs, return a 500 response
            self.send_error(500, f"Server error: {str(e)}")

    def do_POST(self):
        parsed_post_dict = parse_qs(self.rfile.read(int(self.headers["Content-Length"])).decode("utf-8"))

        requested_file = self.path.split("/")[-1]
        requested_file = requested_file[:requested_file.index(".")]
        print(requested_file)

        if requested_file == "web_exec":
            import web_exec
            user_script = parsed_post_dict.get("user_script", [""])[0]
            max_instructions = parsed_post_dict.get("max_instructions", [""])[0]
            if max_instructions:
                pg_logger.set_max_executed_lines(int(max_instructions))

            output_json = pg_logger.exec_script_str(user_script, web_exec.web_finalizer)
            print("a", output_json)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(output_json.encode())


if __name__ == "__main__":
    print(f"Serving at port http://localhost:{PORT}/")
    HTTPServer(("", PORT), MyServer).serve_forever()

