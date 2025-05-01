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
import ast
import sys
import io
import bisect
import inspect

inspect_param = inspect.Parameter
inspect_position = inspect_param.VAR_POSITIONAL
inspect_keyword = inspect_param.VAR_KEYWORD
inspect_empty = inspect_param.empty


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

        script_lines = script_str.splitlines(keepends=True)
        if not script_lines:
            line_group_start = [1, 2]
        else:
            line_group_start = [1]
            group_content = []
            for line_no, line in enumerate(script_lines, start=1):
                group_content.append(line)
                if self.is_line_complete("".join(group_content)):
                    line_group_start.append(line_no + 1)
                    group_content = []

        self.script_lines = script_lines
        self.line_group_start = line_group_start
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
            self.run(script_str, user_globals)
        except Exception as exc:
            import traceback
            traceback.print_exc()

            trace_entry = {
                "event": "uncaught_exception",
                "exception_msg": f"Error: {exc.msg}" if hasattr(exc, "msg") else "Unknown error"
            }

            if hasattr(exc, "lineno"):
                trace_entry["line_group"] = self.get_current_line_group(exc.lineno)
            if hasattr(exc, "offset"):
                trace_entry["offset"] = exc.offset

            self.trace.append(trace_entry)

        sys.stdout = sys.__stdout__
        return self.trace

    @staticmethod
    def is_line_complete(line: str) -> bool:
        try:
            ast.parse(line.strip())
            return True
        except SyntaxError as e:
            e = str(e)
            if e.startswith("expected an indented block") or e.startswith("invalid syntax"):
                return True
            return False

    def get_current_line_group(self, line_no):
        lst = self.line_group_start
        idx = bisect.bisect_right(lst, line_no)
        return list(range(lst[idx - 1], lst[idx]))

    # Override Bdb methods
    def user_call(self, frame, argument_list):
        calling_frame = frame.f_back
        line_group = self.get_current_line_group(calling_frame.f_lineno)

        # find true positions of the function on the last frame
        positions = inspect.getframeinfo(calling_frame).positions
        start_line = positions.lineno
        end_line = positions.end_lineno

        if (end_line - start_line + 1) > len(line_group): # not a true function call
            return

        start_offset = positions.col_offset
        end_offset = positions.end_col_offset

        # relative positions
        code_so_far = "".join(self.script_lines[line_group[0] - 1: start_line - 1])
        relative_start_position = len(code_so_far) + start_offset

        code_so_far = "".join([code_so_far, *self.script_lines[start_line - 1: end_line - 1]])
        relative_end_position = len(code_so_far) + end_offset

        # new function call
        if not self.calling_function_info or id(calling_frame) != self.calling_function_info[-1]["calling_frame_id"]:
            self.calling_function_info.append({
                "calling_frame_id": id(calling_frame),
                "code": "".join([code_so_far, *self.script_lines[end_line - 1: line_group[-1]]]),
                "line_group": line_group,
                "true_positions": [start_line, start_offset, end_line, end_offset],
                "relative_positions": [relative_start_position, relative_end_position]
            })
            self.relative_position_shifts.append([])
        # function call immediately after a return of another function call
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

        # Do not call interaction as the user_line call immediately after will cover the same information

    def user_line(self, frame):
        # if just returned from a function call
        if self.calling_function_info and id(frame) == self.calling_function_info[-1]["calling_frame_id"]:
            if frame.f_lineno in self.calling_function_info[-1]["line_group"]:
                return
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()

        self.interaction(frame, "step_line", self.get_current_line_group(frame.f_lineno))

    def user_return(self, frame, return_value):
        if frame.f_back.f_code.co_filename != "<string>":
            self.set_quit()

        line_group = self.get_current_line_group(frame.f_lineno)
        positions = inspect.getframeinfo(frame.f_back).positions
        if (positions.end_lineno - positions.lineno + 1) > len(line_group): # return from a false function call
            return

        # returned immediately after another return
        if self.calling_function_info and id(frame.f_back) != self.calling_function_info[-1]["calling_frame_id"]:
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()

        # normal return, do not pop call information as a second function call might happen immediately
        if self.calling_function_info:
            last_caller = self.calling_function_info[-1]
            code = last_caller["code"]
            [pos_start, pos_end] = last_caller["relative_positions"]
            ret = str(return_value)

            last_caller["code"] = code.replace(code[pos_start: pos_end], ret, 1)
            last_caller["relative_positions"] = [pos_start, pos_start + len(ret)]

            self.relative_position_shifts[-1].append([pos_end, pos_end - pos_start - len(ret)])

        frame.f_locals["__return__"] = return_value
        self.interaction(frame, "return", line_group)

    def user_exception(self, frame, exc_info):
        self.interaction(frame, "exception", self.get_current_line_group(frame.f_lineno), exc_info[:2])

    # General interaction function
    def interaction(self, frame, event_type, line_group, exception_info=None):
        trace_entry = {
            "line_group": line_group, "event": event_type, "scope_name": frame.f_code.co_name,
            "encoded_frames": [
                ("global", {k: self.recursive_encode(v, set()) for k, v in
                            frame.f_globals.items() if not k.startswith("__")})
            ],
            "stdout": frame.f_globals["__stdout__"].getvalue(),
        }

        if self.calling_function_info:
            trace_entry["caller_info"] = self.calling_function_info[-1].copy()

        if exception_info:
            trace_entry["exception_msg"] = f"{exception_info[0].__name__}: {exception_info[-1]}"

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
                (cur_name, {k: self.recursive_encode(v, set()) for k, v in cur_frame.f_locals.items() if
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
            self.visited_lines.update(line_group) # done after assigning as currently highlighted line has not been processed yet
            self.trace.append(trace_entry)

        if len(self.trace) >= self.max_executed_lines or self.duplicate_frames_no >= self.max_executed_lines:
            self.set_quit()
            self.trace.append({"event": "instruction_limit_reached",
                               "exception_msg": f"(stopped after {self.max_executed_lines} steps to prevent possible "
                                                "infinite loop)"})

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
    #   * function - ["FUNC", unique_id, return annotation, [arg1, annotation1, default1], [arg2, annotation2, default2], ..., [argN, annotationN, defaultN]]
    #   * instance - ["INSTANCE", unique_id, class name, [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
    #   * class    - ["CLASS", unique_id, class name, [list of superclass names], [attr1, value1], [attr2, value2], ..., [attrN, valueN]]
    #   * circular reference - ["CIRCULAR_REF", unique_id]
    #   * other    - [<type name>, unique_id, string representation of object]
    #
    # the unique_id is derived from id(), which allows us to explicitly
    # capture aliasing of compound values

    def recursive_encode(self, data, compound_obj_ids):
        data_type = type(data)

        # primitive type
        if data is None or data_type in {int, float, str, bool}:
            return data

        # compound type
        true_id = id(data)

        if true_id in compound_obj_ids:
            return ["CIRCULAR_REF", self.real_to_small_IDs[true_id]]

        if true_id not in self.real_to_small_IDs:
            self.real_to_small_IDs[true_id] = 0 if self.ignore_id else self.cur_small_id
            self.cur_small_id += 1

        new_compound_obj_ids = compound_obj_ids.union({true_id})
        small_id = self.real_to_small_IDs[true_id]

        if data_type == list:
            return ["LIST", small_id, *[self.recursive_encode(entry, new_compound_obj_ids) for entry in data]]
        if data_type == tuple:
            return ["TUPLE", small_id, *[self.recursive_encode(entry, new_compound_obj_ids) for entry in data]]
        if data_type == set:
            return ["SET", small_id, *[self.recursive_encode(entry, new_compound_obj_ids) for entry in data]]
        if data_type == dict:
            return ["DICT", small_id, *[
                [self.recursive_encode(k, new_compound_obj_ids), self.recursive_encode(v, new_compound_obj_ids)]
                for k, v in data.items()
            ]]
        if inspect.isfunction(data):
            signature = inspect.signature(data)
            ra = signature.return_annotation
            ret = ["FUNC", small_id, None if ra == inspect_empty else ra.__name__]
            for argument in signature.parameters.values():
                n = argument.name
                a = argument.annotation
                d = argument.default
                k = argument.kind
                if k == inspect_position:
                    n = f"*{n}"
                elif k == inspect_keyword:
                    n = f"**{n}"

                if a == inspect_empty:
                    a = None
                elif isinstance(a, type):
                    a = a.__name__
                else:
                    a = str(a)

                d = d if d != inspect_empty else None
                ret.append(
                    [n, a, self.recursive_encode(d, new_compound_obj_ids)])
            return ret
        if (isinstance(data, type) and data.__module__ != "builtins") or "." in str(data_type):
            if "." in str(data_type):
                ret = ["INSTANCE", small_id, data.__class__.__name__]
            else:
                ret = ["CLASS", small_id, data.__name__, [e.__name__ for e in data.__bases__]]

            ret.extend([
                [self.recursive_encode(k, new_compound_obj_ids), self.recursive_encode(v, new_compound_obj_ids)]
                for k, v in data.__dict__.items() if k not in {"__doc__", "__module__", "__return__",
                                                               "__dict__", "__weakref__"}
            ])

            return ret

        return [data_type.__name__, small_id, str(data)]
