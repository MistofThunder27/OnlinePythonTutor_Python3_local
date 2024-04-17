x = {1: 2}
x[('tup', 'le')] = {1, 2, 3}


def foo():
    local_x = {1: 2}
    local_y = {}
    local_y[('tup', 'le')] = {1, 2, 3}
    print("hello", local_y.values())


foo()
