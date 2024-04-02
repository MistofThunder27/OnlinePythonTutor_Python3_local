#!/usr/bin/env python3

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

import json
import os

# Load a question file in the 'questions/' sub-directory, parse it,
# and return it to the caller in JSON format

def processRecord():
    if curDelimiter == 'Name:':
        ret['name'] = '\n'.join(curParts).strip()
    elif curDelimiter == 'Question:':
        ret['question'] = ' '.join(curParts).strip()
    elif curDelimiter == 'Hint:':
        ret['hint'] = ' '.join(curParts).strip()
    elif curDelimiter == 'Solution:':
        ret['solution'] = ' '.join(curParts).strip()
    elif curDelimiter == 'Skeleton:':
        ret['skeleton'] = '\n'.join(curParts).strip()
    elif curDelimiter == 'Test:':
        ret['tests'].append('\n'.join(curParts).strip())
    elif curDelimiter == 'Expect:':
        ret['expects'].append('\n'.join(curParts).strip())


if request == "load_question":  # TODO: this is a get situation
    from back_end import load_question

    question_file = parsed_post_dict.get("question_file", [""])[0]
    question_file_path = f"../questions/{question_file}.txt"
    assert os.path.isfile(question_file_path)

    ret = {'tests': [], 'expects': []}
    curParts = []
    curDelimiter = None

    for line in open(question_file_path):
        # only strip TRAILING spaces and not leading spaces
        line = line.rstrip()

        # comments are denoted by a leading '//', so ignore those lines.
        # Note that I don't use '#' as the comment token since sometimes I
        # want to include Python comments in the skeleton code.
        if line.startswith('//'):
            continue

        # special-case one-liners:
        if line.startswith('MaxLineDelta:'):
            ret['max_line_delta'] = int(line.split(':')[1])
            continue  # move to next line

        if line.startswith('MaxInstructions:'):
            ret['max_instructions'] = int(line.split(':')[1])
            continue  # move to next line

        if line in {'Name:', 'Question:', 'Hint:', 'Solution:', 'Skeleton:', 'Test:', 'Expect:'}:
            processRecord()
            curDelimiter = line
            curParts = []
        else:
            curParts.append(line)

    # don't forget to process the FINAL record
    processRecord()

    assert len(ret['tests']) == len(ret['expects'])

    output_json = json.dumps(ret)
