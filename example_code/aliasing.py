# Example of aliasing
x = [1, 2, 3]
y = x
x.append(4)
y.append(5)
z = [1, 2, 3, 4, 5]
x.append(6)
y.append(7)
y = "hello"


def foo(lst):
    lst.append("hello")
    bar(lst)


def bar(myLst):
    print(myLst)


foo(x)
foo(z)
