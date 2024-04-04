from back_end import pg_logger


def process_post(parsed_post_dict):
    user_script = parsed_post_dict["user_script"][0]
    max_instructions = parsed_post_dict.get("max_instructions", [""])[0]

    if parsed_post_dict["request"][0] == "execute":
        if max_instructions:
            pg_logger.set_max_executed_lines(int(max_instructions))

        return pg_logger.exec_script_str(user_script)

    # Make sure to ignore IDs so that we can do direct object comparisons!
    expect_script = parsed_post_dict["expect_script"][0]
    expect_trace_final_entry = pg_logger.exec_script_str(expect_script, ignore_id=True)[-1]
    if expect_trace_final_entry['event'] != 'return' or expect_trace_final_entry['func_name'] != '<module>':
        return {'status': 'error', 'error_msg': "Fatal error: expected output is malformed!"}

    if max_instructions:
        pg_logger.set_max_executed_lines(int(max_instructions))
    user_trace = pg_logger.exec_script_str(user_script, ignore_id=True)

    # Procedure for grading testResults vs. expectResults:
    # - The final line in expectResults should be a 'return' from
    #   '<module>' that contains only ONE global variable.  THAT'S
    #   the variable that we're going to compare against testResults.

    vars_to_compare = list(expect_trace_final_entry['globals'].keys())
    if len(vars_to_compare) != 1:
        return {'status': 'error', 'error_msg': "Fatal error: expected output has more than one global var!"}

    single_var_to_compare = vars_to_compare[0]
    ret = {'status': 'ok', 'passed_test': False, 'output_var_to_compare': single_var_to_compare,
           'expect_val': expect_trace_final_entry['globals'][single_var_to_compare]}

    # Grab the 'inputs' by finding all global vars that are in scope
    # prior to making the first function call.
    #
    # NB: This means that you can't call any functions to initialize
    # your input data, since the FIRST function call must be the function
    # that you're testing.
    for e in user_trace:
        if e['event'] == 'call':
            ret['input_globals'] = e['globals']
            break

    user_trace_final_entry = user_trace[-1]
    if user_trace_final_entry['event'] == 'return':  # normal termination
        if single_var_to_compare not in user_trace_final_entry['globals']:
            ret.update({'status': 'error',
                        'error_msg': f"Error: output has no global var named '{single_var_to_compare}'"})
        else:
            ret['test_val'] = user_trace_final_entry['globals'][single_var_to_compare]
            if ret['expect_val'] == ret['test_val']:  # do the actual comparison here!
                ret['passed_test'] = True

    else:
        ret.update({'status': 'error', 'error_msg': user_trace_final_entry['exception_msg']})

    return ret


def process_questions(question_file_path):
    def processRecord():
        if curDelimiter == "Name:":
            ret["name"] = "\n".join(curParts).strip()
        elif curDelimiter == "Question:":
            ret["question"] = " ".join(curParts).strip()
        elif curDelimiter == "Hint:":
            ret["hint"] = " ".join(curParts).strip()
        elif curDelimiter == "Solution:":
            ret["solution"] = " ".join(curParts).strip()
        elif curDelimiter == "Skeleton:":
            ret["skeleton"] = "\n".join(curParts).strip()
        elif curDelimiter == "Test:":
            ret["tests"].append("\n".join(curParts).strip())
        elif curDelimiter == "Expect:":
            ret["expects"].append("\n".join(curParts).strip())

    ret = {"tests": [], "expects": []}
    curParts = []
    curDelimiter = None

    for line in open(question_file_path):
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
            processRecord()
            curDelimiter = line
            curParts = []
        else:
            curParts.append(line)

    # don"t forget to process the FINAL record
    processRecord()
    assert len(ret["tests"]) == len(ret["expects"])
    return ret
