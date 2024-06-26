# Tutorial code from Prof. Peter Wentworth
# Rhodes University, South Africa (http://www.ru.ac.za/)

def gcd(x, y, depth=1):
    """
    Find the greatest common divisor of x, y
    Pre:  x >= y,  y >= 0, both x and y are int
    """
    result = x  # set provisional return value
    if y != 0:
        indent = "**" * depth
        print("%s About to recursively call gcd(%d, %d)" % (indent, y, x % y))
        result = gcd(y, x % y, depth + 1)
        print("%s result is %d" % (indent, result))
    return result


def main():
    m = 77
    n = 28
    print("Finding gcd(%d, %d)" % (m, n))
    g = gcd(m, n)
    print('Greatest common divisor of %d, %d = %d'
          % (m, n, g))


main()
