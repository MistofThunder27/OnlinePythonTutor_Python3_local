# Tutorial code from Prof. Peter Wentworth
# Rhodes University, South Africa (http://www.ru.ac.za/)

def sumList(xs):
    """
    Sum a list that can contain nested lists.
    Precondition: All leaf elements are numbers.
    """
    sum = 0
    for e in xs:
        if type(e) is list:
            print("Calling sumList(%s) recursively" % e)
            v = sumList(e)
            print("sumList(%s) returned %s" % (e, v))
            sum += v
        else:
            sum += e
    return sum


testData = [10, [20, 30, [40], 50], 60]
print("Calling sumList(%s)" % testData)
result = sumList(testData)
print("Final sum of all numbers in initial list is %s" % result)

