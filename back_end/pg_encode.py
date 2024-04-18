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


# Given an arbitrary piece of Python data, encode it in such a manner
# that it can be later encoded into JSON.
#   http://json.org/
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

import re

# Key: real ID from id()
# Value: a small integer for greater readability, set by cur_small_id
real_to_small_IDs = {}
cur_small_id = 1

typeRE = re.compile("<type '(.*)'>")
classRE = re.compile("<class '(.*)'>")


def encode(data, compound_obj_ids, ignore_id=False):
    data_type = type(data)
    # primitive type
    if data is None or data_type in {int, float, str, bool}:
        return data

    # compound type
    my_id = id(data)

    global cur_small_id
    if my_id not in real_to_small_IDs:
        if ignore_id:
            real_to_small_IDs[my_id] = 99999
        else:
            real_to_small_IDs[my_id] = cur_small_id
        cur_small_id += 1

    if my_id in compound_obj_ids:
        return ["CIRCULAR_REF", real_to_small_IDs[my_id]]

    new_compound_obj_ids = compound_obj_ids.union([my_id])
    my_small_id = real_to_small_IDs[my_id]

    if data_type == list:
        ret = ["LIST", my_small_id]
        for e in data:
            ret.append(encode(e, new_compound_obj_ids, ignore_id))
    elif data_type == tuple:
        ret = ["TUPLE", my_small_id]
        for e in data:
            ret.append(encode(e, new_compound_obj_ids, ignore_id))
    elif data_type == set:
        ret = ["SET", my_small_id]
        for e in data:
            ret.append(encode(e, new_compound_obj_ids, ignore_id))
    elif data_type == dict:
        ret = ["DICT", my_small_id]
        for k, v in data.items():
            # don"t display some built-in locals ...
            if k not in {"__module__", "__return__"}:
                ret.append([encode(k, new_compound_obj_ids, ignore_id), encode(v, new_compound_obj_ids, ignore_id)])
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
                ret.append([encode(k, new_compound_obj_ids, ignore_id), encode(v, new_compound_obj_ids, ignore_id)])

    else:
        typeStr = str(data_type)
        m = typeRE.match(typeStr)
        assert m, data_type
        ret = [m.group(1), my_small_id, str(data)]

    return ret
