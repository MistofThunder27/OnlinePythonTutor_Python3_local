from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os

from m_pg_logger import PGLogger

logger = PGLogger()

PORT = 8000
MAX_EXECUTED_LINES = 200
extension_type_mapping = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png"
}


class LocalServer(BaseHTTPRequestHandler):
    def do_GET(self):
        requested_path = self.path
        if requested_path == "/":
            requested_path = "/front_end/index.html"

        try:
            full_path = os.path.join(os.getcwd(), requested_path[1:])
            if not os.path.exists(full_path):
                self.send_error(404, "File not found")
                return

            self.send_response(200)
            extension = os.path.splitext(requested_path)[1]
            if extension:
                file_type = extension_type_mapping.get(extension, "")
                if file_type:
                    self.send_header("Content-type", file_type)
                self.end_headers()
                with open(full_path, "rb") as file:
                    self.wfile.write(file.read())
            else:  # fetch files in the directory
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps([filename for filename in os.listdir(full_path)]).encode())
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def do_POST(self):
        try:
            output_json = json.dumps(process_post(json.loads(self.rfile.read(int(self.headers["Content-Length"])))))

            with open("output.json", "w") as f:
                f.write(output_json)

            self.send_response(200)
            self.end_headers()
            self.wfile.write(output_json.encode())
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")


def process_post(post_dict: dict[str: any]) -> dict[str: any] | list[dict[str: any]]:
    request = post_dict["request"]

    if request == "question":
        ret = {"test": [], "expect": []}
        cur_parts = []
        cur_delimiter = "name"

        def process_record():
            if cur_delimiter in {"test", "expect"}:
                ret[cur_delimiter].append("\n".join(cur_parts).strip())
            else:
                ret[cur_delimiter] = "\n".join(cur_parts).strip()

        for line in open(f"questions/{post_dict["question_file"]}"):
            # comments are denoted by a leading "//", so ignore those lines.
            # Note that I don"t use "#" as the comment token since sometimes I
            # want to include Python comments in the skeleton code.
            if line.startswith("//"):
                continue

            line = line.rstrip()
            if ":" not in line:
                cur_parts.append(line)
                continue

            for delimiter in (
            "Test:", "Expect:", "Name:", "Question:", "Hint:", "Solution:", "Skeleton:", "MaxLineDelta:",
            "MaxInstructions:"):
                if line.startswith(delimiter):
                    process_record()
                    cur_delimiter = delimiter[:-1].lower()
                    cur_parts = [line[len(delimiter):]]
                    break
            else:
                cur_parts.append(line)

        # don't forget to process the FINAL record
        process_record()
        assert len(ret["test"]) == len(ret["expect"])
        return ret

    # =================================================================================
    user_script = post_dict["user_script"]
    changed_max_executed_lines = int(post_dict.get("max_instructions", MAX_EXECUTED_LINES))

    if request == "execute":
        return logger.runscript(user_script, changed_max_executed_lines, False)

    # else: request == "run test"
    # Make sure to ignore IDs so that we can do direct object comparisons!
    expect_trace_final_entry = logger.runscript(
        post_dict["expect_script"], MAX_EXECUTED_LINES, True)[-1]

    if expect_trace_final_entry['event'] != 'return' or expect_trace_final_entry['scope_name'] != '<module>':
        return {'status': 'error', 'error_msg': "Fatal error: expected output is malformed!"}

    # Procedure for grading testResults vs. expectResults:
    # - The final line in expectResults should be a 'return' from
    #   '<module>' that contains only ONE global variable.  THAT'S
    #   the variable that we're going to compare against testResults.
    vars_to_compare = list(expect_trace_final_entry['encoded_frames'][0][-1])  # list(globals)
    if len(vars_to_compare) != 1:
        return {'status': 'error', 'error_msg': "Fatal error: expected output has more than one global var!"}

    single_var_to_compare = vars_to_compare[0]
    ret = {'status': 'ok', 'passed_test': False, 'output_var_to_compare': single_var_to_compare,
           'expect_val': expect_trace_final_entry['encoded_frames'][0][-1][single_var_to_compare]}

    user_trace = logger.runscript(user_script, changed_max_executed_lines, True)

    # Grab the 'inputs' by finding all global vars that are in scope
    # prior to making the first function call.
    #
    # NB: This means that you can't call any functions to initialize
    # your input data, since the FIRST function call must be the function
    # that you're testing.
    for entry in user_trace:
        if entry.get('caller_info'):
            ret['input_globals'] = entry['encoded_frames'][0][-1]
            break

    user_trace_final_entry = user_trace[-1]
    if user_trace_final_entry['event'] == 'return':  # normal termination
        if single_var_to_compare not in user_trace_final_entry['encoded_frames'][0][-1]:
            ret.update({'status': 'error',
                        'error_msg': f"Error: output has no global var named '{single_var_to_compare}'"})
        else:
            ret['test_val'] = user_trace_final_entry['encoded_frames'][0][-1][single_var_to_compare]
            if ret['expect_val'] == ret['test_val']:  # do the actual comparison here!
                ret['passed_test'] = True

    else:
        ret.update(
            {'status': 'error', 'error_msg': user_trace_final_entry['exception_msg']})

    return ret


if __name__ == "__main__":
    print(f"Serving at port http://localhost:{PORT}/")
    HTTPServer(("", PORT), LocalServer).serve_forever()
