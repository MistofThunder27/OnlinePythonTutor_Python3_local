from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import json
import os

from m_pg_logger import *

# TODO class calls being functions
# TODO nested function call highlighting when on multiple lines (it pops the last call on user line)


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
        path = self.path
        if path == "/":
            path = "/front_end/index.html"

        path = path.split("?")[0]

        try:
            file_path = os.path.join(os.getcwd(), path[1:])
            if os.path.exists(file_path):
                file_type = content_type_mapping.get(os.path.splitext(path)[1], "")
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
            process_post(
                parse_qs(
                    self.rfile.read(
                        int(self.headers["Content-Length"])
                    ).decode("utf-8"))
            ), indent=4)

        with open("output.json", "w") as f:
            f.write(output_json)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(output_json.encode())


def process_post(parsed_post_dict):
    request = parsed_post_dict["request"][0]

    if request == "question":
        def process_record():
            if cur_delimiter == "Name:":
                ret["name"] = "\n".join(cur_parts).strip()
            elif cur_delimiter == "Question:":
                ret["question"] = " ".join(cur_parts).strip()
            elif cur_delimiter == "Hint:":
                ret["hint"] = " ".join(cur_parts).strip()
            elif cur_delimiter == "Solution:":
                ret["solution"] = " ".join(cur_parts).strip()
            elif cur_delimiter == "Skeleton:":
                ret["skeleton"] = "\n".join(cur_parts).strip()
            elif cur_delimiter == "Test:":
                ret["tests"].append("\n".join(cur_parts).strip())
            elif cur_delimiter == "Expect:":
                ret["expects"].append("\n".join(cur_parts).strip())

        ret = {"tests": [], "expects": []}
        cur_parts = []
        cur_delimiter = None

        for line in open(f"questions/{parsed_post_dict["question_file"][0]}.txt"):
            # only strip TRAILING spaces and not leading spaces
            line = line.rstrip()

            # comments are denoted by a leading "//", so ignore those lines.
            # Note that I don"t use "#" as the comment token since sometimes I
            # want to include Python comments in the skeleton code.
            if line.startswith("//"):
                continue

            # special-case one-liners:
            if line.startswith("MaxLineDelta:"):
                ret["max_line_delta"] = int(line.split(":")[1])
                continue

            if line.startswith("MaxInstructions:"):
                ret["max_instructions"] = int(line.split(":")[1])
                continue

            if line in {"Name:", "Question:", "Hint:", "Solution:", "Skeleton:", "Test:", "Expect:"}:
                process_record()
                cur_delimiter = line
                cur_parts = []
            else:
                cur_parts.append(line)

        # don"t forget to process the FINAL record
        process_record()
        assert len(ret["tests"]) == len(ret["expects"])
        return ret

    # =================================================================================
    user_script = parsed_post_dict["user_script"][0]
    changed_max_executed_lines = int(parsed_post_dict.get("max_instructions", [MAX_EXECUTED_LINES])[0])

    if request == "execute":
        return PGLogger(changed_max_executed_lines).runscript(user_script)

    # Make sure to ignore IDs so that we can do direct object comparisons!
    expect_trace_final_entry = PGLogger(ignore_id=True).runscript(parsed_post_dict["expect_script"][0])[-1]

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

    user_trace = PGLogger(changed_max_executed_lines, True).runscript(user_script)

    # Grab the 'inputs' by finding all global vars that are in scope
    # prior to making the first function call.
    #
    # NB: This means that you can't call any functions to initialize
    # your input data, since the FIRST function call must be the function
    # that you're testing.
    for e in user_trace:
        if e['event'] == 'call':
            ret['input_globals'] = e['encoded_frames'][0][-1]
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
        ret.update({'status': 'error', 'error_msg': user_trace_final_entry['exception_msg']})

    return ret


if __name__ == "__main__":
    print(f"Serving at port http://localhost:{PORT}/")
    HTTPServer(("", PORT), LocalServer).serve_forever()
