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
import re

typeRE = re.compile("<type '(.*)'>")
classRE = re.compile("<class '(.*)'>")

# This is the meat of the Online Python Tutor back-end. It implements a
# full logger for Python program execution (based on pdb, the standard
# Python debugger imported via the bdb module), printing out the values
# of all in-scope data structures after each executed instruction.

MAX_EXECUTED_LINES = 200


class PGLogger(bdb.Bdb):
    def __init__(self, max_executed_lines=MAX_EXECUTED_LINES, ignore_id=False):
        bdb.Bdb.__init__(self)
        self.trace = []  # each entry contains a dict with the information for a single executed line
        self.ignore_id = ignore_id  # don"t print out a custom ID for each object (for regression testing)
        self.max_executed_lines = max_executed_lines  # upper-bound of executed lines, to guard against infinite loops

        # Key: real ID from id(), Value: a small integer for greater readability, set by cur_small_id
        self.real_to_small_IDs = {}
        self.cur_small_id = 1

        self.script_lines = []
        self.visited_lines = set()
        self.calling_function_info = []
        self.relative_position_shifts = [[]]

    # Override Bdb methods
    def user_call(self, frame, argument_list):
        calling_frame = frame.f_back

        # true positions
        positions = inspect.getframeinfo(calling_frame).positions
        start_line = positions.lineno
        start_offset = positions.col_offset
        end_line = positions.end_lineno
        end_offset = positions.end_col_offset

        if not self.calling_function_info or id(calling_frame) != self.calling_function_info[-1]["calling_frame_id"]:
            # relative positions
            full_calling_code = "\n".join(self.script_lines[start_line - 1: end_line])
            calling_code_snippet = full_calling_code[start_offset:
                                                     (end_offset - len(self.script_lines[end_line - 1])) or None]

            self.calling_function_info.append({
                "calling_frame_id": id(calling_frame), "code": full_calling_code,
                "true_positions": [[start_line, start_offset], [end_line, end_offset]],
                "relative_positions": [start_offset, start_offset + len(calling_code_snippet)]
            })
            self.relative_position_shifts.append([])
        else:
            # relative positions
            relative_start_position = start_offset
            relative_end_position = end_offset
            for pos, diff in self.relative_position_shifts[-1]:
                if relative_start_position > pos:
                    relative_start_position -= diff
                if relative_end_position > pos:
                    relative_end_position -= diff

            self.calling_function_info[-1].update({
                "true_positions": [[start_line, start_offset], [end_line, end_offset]],
                "relative_positions": [relative_start_position, relative_end_position]
            })

    def user_line(self, frame):
        if self.calling_function_info and id(frame) == self.calling_function_info[-1]["calling_frame_id"]:
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()

        self.interaction(frame, "step_line")

    def user_return(self, frame, return_value):
        if self.calling_function_info and id(frame.f_back) != self.calling_function_info[-1]["calling_frame_id"]:
            self.calling_function_info.pop()
            self.relative_position_shifts.pop()

        if self.calling_function_info:
            last_caller = self.calling_function_info[-1]
            code = last_caller["code"]
            [pos_start, pos_end] = last_caller["relative_positions"]
            ret = str(return_value)

            last_caller["code"] = code.replace(code[pos_start: pos_end], ret, 1)
            last_caller["relative_positions"] = [pos_start, pos_start + len(ret)]

            self.relative_position_shifts[-1].append([pos_end, pos_end - pos_start - len(ret)])

        frame.f_locals["__return__"] = return_value
        self.interaction(frame, "return")

    def user_exception(self, frame, exc_info):
        self.interaction(frame, "exception", exc_info[:2])

    # General interaction function
    def interaction(self, frame, event_type, exception_info=None):
        trace_entry = {
            "line": frame.f_lineno, "event": event_type, "visited_lines": list(self.visited_lines),
            "scope_name": frame.f_code.co_name,
            "encoded_frames": [
                ("global", {k: self.encode(v) for k, v in frame.f_globals.items() if
                            k not in {"__stdout__", "__builtins__", "__name__", "__exception__", "__return__"}})
                ],
            "stdout": frame.f_globals["__stdout__"].getvalue()
        }

        # Added after as currently highlighted line has not been executed yet
        self.visited_lines.add(frame.f_lineno)

        if self.calling_function_info:
            trace_entry["caller_info"] = self.calling_function_info[-1].copy()

        # if there's an exception, then record its info:
        if exception_info:
            trace_entry["exception_msg"] = f"{exception_info[0].__name__}: {exception_info[-1]}"

        encoded_frames = []  # each element is a pair of (function name, ENCODED locals dict)
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

        self.trace.append(trace_entry)

        if len(self.trace) >= self.max_executed_lines:
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
                self.real_to_small_IDs[my_id] = 99999 if self.ignore_id else self.cur_small_id
                self.cur_small_id += 1

            new_compound_obj_ids = compound_obj_ids.union({my_id})
            my_small_id = self.real_to_small_IDs[my_id]

            if data_type == list:
                ret = ["LIST", my_small_id]
                for e in data:
                    ret.append(recursive_encode(e, new_compound_obj_ids))
            elif data_type == tuple:
                ret = ["TUPLE", my_small_id]
                for e in data:
                    ret.append(recursive_encode(e, new_compound_obj_ids))
            elif data_type == set:
                ret = ["SET", my_small_id]
                for e in data:
                    ret.append(recursive_encode(e, new_compound_obj_ids))
            elif data_type == dict:
                ret = ["DICT", my_small_id]
                for k, v in data.items():
                    ret.append([recursive_encode(k, new_compound_obj_ids), recursive_encode(v, new_compound_obj_ids)])
            elif not isinstance(data, type) or "__class__" in dir(data):
                if not isinstance(data, type):
                    ret = ["INSTANCE", data.__class__.__name__, my_small_id]
                else:
                    superclass_names = [e.__name__ for e in data.__bases__]
                    ret = ["CLASS", data.__name__, my_small_id, superclass_names]

                # traverse inside its __dict__ to grab attributes
                # (filter out useless-seeming ones):
                for k, v in data.__dict__.items():
                    if k not in {"__doc__", "__module__", "__return__", "__dict__", "__weakref__"}:
                        ret.append([recursive_encode(k, new_compound_obj_ids),
                                    recursive_encode(v, new_compound_obj_ids)])

            else:
                typeStr = str(data_type)
                m = typeRE.match(typeStr)
                assert m, data_type
                ret = [m.group(1), my_small_id, str(data)]

            return ret

        return recursive_encode(outer_data, set())

    def runscript(self, script_str):
        self.script_lines = script_str.split("\n")

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
            import traceback; traceback.print_exc()

            trace_entry = {"event": "uncaught_exception"}

            if hasattr(exc, "lineno"):
                trace_entry["line"] = exc.lineno
            if hasattr(exc, "offset"):
                trace_entry["offset"] = exc.offset

            if hasattr(exc, "msg"):
                trace_entry["exception_msg"] = "Error: " + exc.msg
            else:
                trace_entry["exception_msg"] = "Unknown error"

            self.trace.append(trace_entry)

        # finalise results
        sys.stdout = sys.__stdout__
        assert len(self.trace) <= (self.max_executed_lines + 1)

        # filter all entries after "return" from "<module>", since they
        # seem extraneous:
        res = []
        for e in self.trace:
            res.append(e)
            if e["event"] == "return" and e["scope_name"] == "<module>":
                break

        # another hack: if the SECOND to last entry is an "exception"
        # and the last entry is return from <module>, then axe the last
        # entry, for aesthetic reasons :)
        if len(res) >= 2 and res[-2]["event"] == "exception" and \
                res[-1]["event"] == "return" and res[-1]["scope_name"] == "<module>":
            res.pop()

        return res
