# Functional programming with 'map'
# Adapted from MIT 6.01 course notes (Section A.2.3)
# http://mit.edu/6.01/mercurial/spring10/www/handouts/readings.pdf

def map(func, lst):
  if lst == []:
    return []
  else:
    return [func(lst[0])] + list(map(func, lst[1:]))

def halveElements(lst):
  return [x / 2.0 for x in lst]

input = [2, 4, 6, 8, 10]
output = halveElements(input)
