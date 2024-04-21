def add(a, b):
    return a + b

def sub(a, b):
    return a - b

add(5, 7)
sub(7, 5)

# test: nested function calls
print("nested function calls")
add(add(sub(7, 5), 2), sub(10, add(1, 1)))

add(add(
    sub(7, 5),
    2), sub(10, add(1,
                    1))
    )