from back_end import pg_logger
import os

LOG_QUERIES = False


def process_post(parsed_post_dict):
    request = parsed_post_dict["request"][0]
    if request == "execute":
        user_script = parsed_post_dict["user_script"][0]
        max_instructions = parsed_post_dict.get("max_instructions", [""])[0]
        if max_instructions:
            pg_logger.set_max_executed_lines(int(max_instructions))

        output_list = pg_logger.exec_script_str(user_script)

        if LOG_QUERIES:
            import time
            from back_end import db_common
            # just to be paranoid, don't croak the whole program just
            # because there's some error in logging it to the database
            try:
                # log queries into sqlite database:
                had_error = False
                # (note that the CSAIL 'www' user needs to have write permissions in
                #  this directory for logging to work properly)
                if len(output_list):
                    evt = output_list[-1]['event']
                    if evt == 'exception' or evt == 'uncaught_exception':
                        had_error = True

                (con, cur) = db_common.db_connect()
                cur.execute("INSERT INTO query_log VALUES (NULL, ?, ?, ?, ?, ?)",
                            (int(time.time()),
                             os.environ.get("REMOTE_ADDR", "N/A"),
                             os.environ.get("HTTP_USER_AGENT", "N/A"),
                             user_script,
                             had_error))
                con.commit()
                cur.close()
            except:
                # haha. this is bad form, but silently fail on error :)
                pass

        return output_list

    """
    if request == "load_question":  # TODO: this is a get situation
        from back_end import load_question

        question_file = parsed_post_dict.get("question_file", [""])[0]
        question_file_path = f"../questions/{question_file}.txt"
        assert os.path.isfile(question_file_path)
        output_json = json.dumps(load_question.parseQuestionsFile(question_file_path))

        # Crucial first line to make sure that Apache serves this data
        # correctly - DON'T FORGET THE EXTRA NEWLINES!!!:
        print("Content-type: text/plain; charset=iso-8859-1\n\n")
        print(output_json)
    """

    if request == "run test":
        user_script = parsed_post_dict["user_script"][0]
        expect_script = parsed_post_dict["expect_script"][0]

        # Make sure to ignore IDs so that we can do direct object comparisons!
        expect_trace_final_entry = pg_logger.exec_script_str(expect_script, ignore_id=True)[-1]
        if expect_trace_final_entry['event'] != 'return' or expect_trace_final_entry['func_name'] != '<module>':
            return {'status': 'error', 'error_msg': "Fatal error: expected output is malformed!"}

        max_instructions = parsed_post_dict.get("max_instructions", [""])[0]
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

    raise Exception(f"Unexpected request: {request}")
