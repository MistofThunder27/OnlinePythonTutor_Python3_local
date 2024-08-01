# Online Python Tutor
# Copyright (C) 2010-2011 Philip J. Guo (philip@pgbovine.net)
# https://github.com/pgbovine/OnlinePythonTutor/
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import bdb
import sys
import io
import inspect

# This is the meat of the Online Python Tutor back-end. It implements a
# full logger for Python program execution (based on pdb, the standard
# Python debugger imported via the bdb module), printing out the values
# of all in-scope data structures after each executed instruction.


class PGLogger(bdb.Bdb):
    def __init__(self):
        bdb.Bdb.__init__(self)
        # all variables declared in self.runscript

    # The main method that sets up then runs the debugger and returns the final execution trace list
    def runscript(self, script_str: str, max_executed_lines: int, ignore_id: bool) -> list:
        # create an execution trace list where each entry contains a dict with the information for a single executed line
        self.trace = []
        # if True, don't print out a custom ID for each object (used only for regression testing)
        self.ignore_id = ignore_id
        # upper-bound of executed lines, to guard against infinite loops
        self.max_executed_lines = max_executed_lines
        self.duplicate_frames_no = 0

        # Key: real ID from id(), Value: a small integer for greater readability, set by cur_small_id
        self.real_to_small_IDs = {}
        self.cur_small_id = 1

        self.calling_function_info = []
        self.relative_position_shifts = [[]]

        script_lines = script_str.split("\n")
        line_groups = []
        group_starting_line_no = 1
        line_group_content_so_far = ""
        for line_no, line_content in enumerate(script_lines, 1):
            line_group_content_so_far += f"\n{line_content}"
            if self.line_is_complete(line_group_content_so_far):
                line_groups.append(range(group_starting_line_no, line_no + 1))
                line_group_content_so_far = ""
                group_starting_line_no = line_no + 1
        else:
            line_groups.append(range(group_starting_line_no, line_no + 1))

        self.script_lines = script_lines
        self.line_groups = line_groups
        self.visited_lines = set()
        self.last_trace_entry = {}

        # redirect stdout of the user program to a memory buffer
        user_stdout = io.StringIO()
        sys.stdout = user_stdout
        user_globals = {"__name__": "__main__",
                        # try to "sandbox" the user script by not allowing certain potentially dangerous operations:
                        "__builtins__": {k: v for k, v in __builtins__.items() if k not in
                                         {"reload", "input", "apply", "open", "compile", "__import__", "file", "eval",
                                          "execfile", "exit", "quit", "raw_input", "dir", "globals", "locals", "vars"}},
                        "__stdout__": user_stdout}

        try:
            self.run(script_str, user_globals, user_globals)
        except Exception as exc:
            import traceback
            traceback.print_exc()

            trace_entry = {
                "event": "uncaught_exception",
                "exception_msg": f"Error: {exc.msg}" if hasattr(exc, "msg") else "Unknown error"
            }

            if hasattr(exc, "lineno"):
                trace_entry["line_group"] = self.get_current_line_group(
                    exc.lineno)
            if hasattr(exc, "offset"):
                trace_entry["offset"] = exc.offset

            self.trace.append(trace_entry)

        # clean up
        sys.stdout = sys.__stdout__
        assert len(self.trace) <= (max_executed_lines + 1)
        return self.trace

    @staticmethod
    def line_is_complete(s):  # TODO: improve and test
        # Initialize variables
        in_string = False
        in_triple_string = False
        in_comment = False
        skip_char = False
        string_type = ""
        unclosed_normal_brackets = 0
        unclosed_square_brackets = 0
        unclosed_curly_brackets = 0

        # Iterate through each character in the string
        for i, char in enumerate(s):
            if in_comment:
                # Check for newline to exit the comment
                if char == "\n":
                    in_comment = False
            elif not in_string:
                # Check for comment
                if char == "#":
                    in_comment = True
                # Update bracket counts
                elif char == "(":
                    unclosed_normal_brackets += 1
                elif char == ")":
                    unclosed_normal_brackets -= 1
                elif char == "[":
                    unclosed_square_brackets += 1
                elif char == "]":
                    unclosed_square_brackets -= 1
                elif char == "{":
                    unclosed_curly_brackets += 1
                elif char == "}":
                    unclosed_curly_brackets -= 1
                elif char in {'"', "'"}:
                    # Enter string literal
                    in_string = True
                    string_type = char
                    if char * 3 in s[i:i + 3]:
                        in_triple_string = True
                        string_type = char*3
            else:
                if char == "\\":
                    skip_char = True
                # Check for end of string literal
                elif char in {'"', "'"}:
                    if skip_char:
                        skip_char = False
                    elif not in_triple_string:
                        in_string = False
                    elif len(s) - i >= 3 and s[i:i + len(string_type)] == string_type:
                        in_string = False
                        in_triple_string = False
                elif skip_char:
                    skip_char = False

        # Check if the line is complete
        return not in_string and unclosed_normal_brackets == 0 and unclosed_square_brackets == 0 and unclosed_curly_brackets == 0

    def get_current_line_group(self, line_no):
        for group in self.line_groups:
            if line_no in group:
                return list(group)

    # Override Bdb methods
    def user_call(self, frame, argument_list):
        calling_frame = frame.f_back

        # find true positions of the function on the last frame
        positions = inspect.getframeinfo(calling_frame).positions
        start_line = positions.lineno
        start_offset = positions.col_offset
        end_line = positions.end_lineno
        end_offset = positions.end_col_offset

        line_group = self.get_current_line_group(calling_frame.f_lineno)

        # relative positions
        code_so_far = "\n".join(
            self.script_lines[line_group[0] - 1: start_line]).strip("\n")
        relative_start_position = len(
            code_so_far) - len(self.script_lines[start_line - 1]) + start_offset
        # this weird way of calculating it is necessary because it accounts for "\n"s that may or may not be there

        code_so_far = "\n".join(
            [code_so_far, *self.script_lines[start_line: end_line]]).strip("\n")
        relative_end_position = len(
            code_so_far) - len(self.script_lines[end_line - 1]) + end_offset

        if not self.calling_function_info or id(calling_frame) != self.calling_function_info[-1]["calling_frame_id"]:
            code_so_far = "\n".join(
                [code_so_far, *self.script_lines[end_line: line_group[-1]]]).strip("\n")

            self.calling_function_info.append({
                "calling_frame_id": id(calling_frame),
                "code": code_so_far,
                "line_group": line_group,
                "true_positions": [start_line, start_offset, end_line, end_offset],
                "relative_positions": [relative_start_position, relative_end_position]
            })
            self.relative_position_shifts.append([])
        else:
            for pos, diff in self.relative_position_shifts[-1]:
                if relative_start_position > pos:
                    relative_start_position -= diff
                if relative_end_position > pos:
                    relative_end_position -= diff

            self.calling_function_info[-1].update({
                "true_positions": [start_line, start_offset, end_line, end_offset],
                "relative_positions": [relative_start_position, relative_end_position]
            })

    def user_line(self, frame):
        if self.calling_function_info and id(frame) == self.calling_function_info[-1]["calling_frame_id"]:
            if frame.f_lineno in self.calling_function_info[-1]["line_group"]:
                return
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()

        self.interaction(frame, "step_line")

    def user_return(self, frame, return_value):
        if frame.f_back.f_code.co_filename != "<string>":
            self.set_quit()

        if self.calling_function_info and id(frame.f_back) != self.calling_function_info[-1]["calling_frame_id"]:
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()
        
        # erase function calls during class definitions
        class_name = frame.f_locals.get("__qualname__")
        if class_name:
            while self.trace[-1]["encoded_frames"][-1][0] == class_name:
                self.trace.pop()
            else:
                self.trace[-1]["line_group"] = list(self.visited_lines.difference(self.trace[-1]["visited_lines"]))
            return

        if self.calling_function_info:
            last_caller = self.calling_function_info[-1]
            code = last_caller["code"]
            [pos_start, pos_end] = last_caller["relative_positions"]
            ret = str(return_value)

            last_caller["code"] = code.replace(
                code[pos_start: pos_end], ret, 1)
            last_caller["relative_positions"] = [
                pos_start, pos_start + len(ret)]

            self.relative_position_shifts[-1].append(
                [pos_end, pos_end - pos_start - len(ret)])

        frame.f_locals["__return__"] = return_value
        self.interaction(frame, "return")

    def user_exception(self, frame, exc_info):
        self.interaction(frame, "exception", exc_info[:2])

    # General interaction function
    def interaction(self, frame, event_type, exception_info=None):
        line_group = self.get_current_line_group(frame.f_lineno)
        trace_entry = {
            "line_group": line_group, "event": event_type, "scope_name": frame.f_code.co_name,
            "encoded_frames": [
                ("global", {k: self.encode(v) for k, v in frame.f_globals.items() if
                            k not in {"__stdout__", "__builtins__", "__name__", "__exception__", "__return__"}})
            ],
            "stdout": frame.f_globals["__stdout__"].getvalue(),
        }

        if self.calling_function_info:
            trace_entry["caller_info"] = self.calling_function_info[-1].copy()

        if exception_info:
            trace_entry["exception_msg"] = f"{
                exception_info[0].__name__}: {exception_info[-1]}"

        # each element is a pair of (function name, ENCODED locals dict)
        encoded_frames = []
        # climb up until you find "<module>", which is (hopefully) the global scope
        cur_frame = frame
        while True:
            cur_name = cur_frame.f_code.co_name
            if cur_name == "<module>":
                break

            # special case for lambdas - grab their line numbers too
            if cur_name == "<lambda>":
                cur_name = f"lambda on line {cur_frame.f_code.co_firstlineno}"
            elif cur_name == "":
                cur_name = "unnamed function"

            encoded_frames.append(
                (cur_name, {k: self.encode(v) for k, v in cur_frame.f_locals.items() if
                            k not in {"__stdout__", "__builtins__", "__name__", "__exception__", "__module__"}})
            )
            cur_frame = cur_frame.f_back

        trace_entry["encoded_frames"].extend(encoded_frames[::-1])

        # Do not add duplicate frames
        if trace_entry == self.last_trace_entry:
            self.duplicate_frames_no += 1
            # print("duplicate frame", trace_entry)
        else:
            self.duplicate_frames_no = 0
            self.last_trace_entry = trace_entry.copy()
            trace_entry["visited_lines"] = list(self.visited_lines)
            # done after assigning as currently highlighted line has not been processed yet
            self.visited_lines.update(line_group)
            self.trace.append(trace_entry)

        if len(self.trace) >= self.max_executed_lines or self.duplicate_frames_no >= self.max_executed_lines:
            self.set_quit()
            self.trace.append({"event": "instruction_limit_reached",
                               "exception_msg": f"(stopped after {self.max_executed_lines} steps to prevent possible "
                               "infinite loop)"})

    def encode(self, outer_data):
        # Given an arbitrary piece of Python data, encode it in such a manner
        # that it can be later encoded into JSON.
        #
        # We use this function to encode run-time traces of data structures
        # to send to the front-end.
        #
        # Format:
        #   * None, int, long, float, str, bool - unchanged
        #     (json.dumps encodes these fine verbatim)
        #   * list     - ["LIST", unique_id, elt1, elt2, elt3, ..., eltN]
        #   * tuple    - ["TUPLE", unique_id, elt1, elt2, elt3, ..., eltN]
        #   * set      - ["SET", unique_id, elt1, elt2, elt3, ..., eltN]
        #   * dict     - ["DICT", unique_id, [key1, value1], [key2, value2], ..., [keyN, valueN]]
        #   * instance - ["INSTANCE", class name, unique_id, [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
        #   * class    - ["CLASS", class name, unique_id, [list of superclass names], [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
        #   * circular reference - ["CIRCULAR_REF", unique_id]
        #   * other    - [<type name>, unique_id, string representation of object]
        #
        # the unique_id is derived from id(), which allows us to explicitly
        # capture aliasing of compound values

        def recursive_encode(data, compound_obj_ids):
            data_type = type(data)

            # primitive type
            if data is None or data_type in {int, float, str, bool}:
                return data

            # compound type
            my_id = id(data)

            if my_id in compound_obj_ids:
                return ["CIRCULAR_REF", self.real_to_small_IDs[my_id]]

            if my_id not in self.real_to_small_IDs:
                self.real_to_small_IDs[my_id] = 0 if self.ignore_id else self.cur_small_id
                self.cur_small_id += 1

            new_compound_obj_ids = compound_obj_ids.union({my_id})
            my_small_id = self.real_to_small_IDs[my_id]

            if data_type == list:
                return ["LIST", my_small_id, *[recursive_encode(entry, new_compound_obj_ids) for entry in data]]
            if data_type == tuple:
                return ["TUPLE", my_small_id, *[recursive_encode(entry, new_compound_obj_ids) for entry in data]]
            if data_type == set:
                return ["SET", my_small_id, *[recursive_encode(entry, new_compound_obj_ids) for entry in data]]
            if data_type == dict:
                return ["DICT", my_small_id, *[
                    [recursive_encode(k, new_compound_obj_ids),
                     recursive_encode(v, new_compound_obj_ids)]
                    for k, v in data.items()
                ]]
            if (isinstance(data, type) and data.__module__ != "builtins") or "." in str(data_type):
                if "." in str(data_type):
                    ret = ["INSTANCE", data.__class__.__name__, my_small_id]
                else:
                    ret = ["CLASS", data.__name__, my_small_id,
                           [e.__name__ for e in data.__bases__]]

                # traverse inside its __dict__ to grab attributes
                # (filter out useless-seeming ones):
                ret.extend([
                    [recursive_encode(k, new_compound_obj_ids),
                     recursive_encode(v, new_compound_obj_ids)]
                    for k, v in data.__dict__.items() if
                    k not in {"__doc__", "__module__",
                              "__return__", "__dict__", "__weakref__"}
                ])

                return ret

            return [data_type.__name__, my_small_id, str(data)]

        return recursive_encode(outer_data, set())
