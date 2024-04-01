from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import json
import os

from a_back_end import pg_logger

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
            self.path = "/a_front_end/index.html"

        try:
            file_path = os.path.join(os.getcwd(), self.path[1:])
            if os.path.exists(file_path):
                with open(file_path, "rb") as file:
                    file_data = file.read()

                file_extension = os.path.splitext(self.path)[1]

                self.send_response(200)
                if file_extension in content_type_mapping:
                    self.send_header("Content-type", content_type_mapping[file_extension])
                self.end_headers()

                self.wfile.write(file_data)
            else:
                self.send_error(404, "File not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def do_POST(self):
        parsed_post_dict = parse_qs(self.rfile.read(int(self.headers["Content-Length"])).decode("utf-8"))

        print(self.path)
        requested_file = self.path.split("/")[-1]
        requested_file = requested_file[:requested_file.index(".")]
        print(requested_file)

        if requested_file == "web_exec":
            from a_back_end import web_exec
            user_script = parsed_post_dict.get("user_script", [""])[0]
            max_instructions = parsed_post_dict.get("max_instructions", [""])[0]
            if max_instructions:
                pg_logger.set_max_executed_lines(int(max_instructions))

            output_json = pg_logger.exec_script_str(user_script, web_exec.web_finalizer)
            print("a", output_json)

        elif requested_file == "load_question":
            from a_back_end import load_question

            question_file = parsed_post_dict.get("question_file", [""])[0]
            question_file_path = f"../questions/{question_file}.txt"
            assert os.path.isfile(question_file_path)
            output_json = json.dumps(load_question.parseQuestionsFile(question_file_path))

            # Crucial first line to make sure that Apache serves this data
            # correctly - DON'T FORGET THE EXTRA NEWLINES!!!:
            print("Content-type: text/plain; charset=iso-8859-1\n\n")
            print(output_json)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(output_json.encode())


if __name__ == "__main__":
    print(f"Serving at port http://localhost:{PORT}/")
    HTTPServer(("", PORT), MyServer).serve_forever()
