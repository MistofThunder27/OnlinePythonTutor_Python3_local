# Basic Constructs
a = 5
b = 3.14
c = "Hello"
d = True
e = None
f = """
Triple string
"""

# Basic Operations
f = a + 1
g = b * 2
h = c + " World"
i = not d
j = a == 5
k = b != 3.14

# List
lst = [1, 2, 3, 4]
lst.append(5)
nested_list = [lst, [6, 7, 8]]

# Dictionary
dct = {"key1": "value1", "key2": "value2"}
dct["key3"] = "value3"
nested_dict = {"nested": dct}

# Set
st = {1, 2, 3}
st.add(4)
st.remove(1)
set_comp = {x for x in range(10)}

# Tuple
tup = (1, 2, 3)
tup2 = tup + (4, 5)

# If-Else
if a > b:
    result = "a is greater"
    if f < a:
        result = "a is still greater"
    else:
        result = "f is greater"
elif a == b:
    result = "a equals b"
else:
    result = "b is greater"

# For Loop
for i in range(5):
    print(i)
else:
    print("done")

# While Loop
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("Count reached 5")

# Function Definition
def add(x, y):
    return x + y

# Function Call
result = add(10, 20)

# Function with various parameters
def complex_func(a, b=2, *args, **kwargs):
    return a + b + sum(args) + sum(kwargs.values())

# Function Call with various arguments
result = complex_func(1, 3, 4, 5, key1=6, key2=7)

# Lambda function
square = lambda x: x ** 2
result = square(5)

# Recursive function
def factorial(n):
    if n == 1:
        return 1
    else:
        return n * factorial(n - 1)

fact_result = factorial(5)

# Nested functions
def outer_func(x):
    def inner_func(y):
        return x + y
    return inner_func

nested_result = outer_func(10)(5)

# Try-Except
try:
    result = 10 / 0
except ZeroDivisionError:
    result = "Cannot divide by zero"
finally:
    print("Executed finally block")

# Custom Exception
class CustomError(Exception):
    pass

try:
    raise CustomError("This is a custom error")
except CustomError as e:
    print(e)

# Class Definition
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name} says woof!"

# Inheritance
class Animal:
    def __init__(self, species):
        self.species = species

    def make_sound(self):
        pass

class Cat(Animal):
    def __init__(self, name):
        super().__init__("Cat")
        self.name = name

    def make_sound(self):
        return f"{self.name} says meow!"

# Class and static methods
class MathOperations:
    @staticmethod
    def add(a, b):
        return a + b

    @classmethod
    def multiply(cls, a, b):
        return a * b

# Properties and setters
class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height

    @property
    def width(self):
        return self._width

    @width.setter
    def width(self, value):
        self._width = value

# Object Creation
dog = Dog("Fido")
dog_bark = dog.bark()

cat = Cat("Whiskers")
cat_sound = cat.make_sound()

# Using static and class methods
add_result = MathOperations.add(10, 20)
multiply_result = MathOperations.multiply(10, 20)

# Rectangle properties
rect = Rectangle(10, 20)
rect.width = 15

# Importing Module
import math
pi_value = math.pi

# From import
from math import sqrt
sqrt_value = sqrt(16)

# Alias import
import math as m
cos_value = m.cos(0)

# Generator function
def count_up_to(max):
    count = 1
    while count <= max:
        yield count
        count += 1

counter = count_up_to(5)
for num in counter:
    print(num)

# Generator expression
gen_expr = (x * x for x in range(5))
for num in gen_expr:
    print(num)

# Function decorator
def my_decorator(func):
    def wrapper():
        print("Something is happening before the function is called.")
        func()
        print("Something is happening after the function is called.")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()

# Class decorator
def class_decorator(cls):
    cls.decorated = True
    return cls

@class_decorator
class MyClass:
    pass

# Context manager
class MyContextManager:
    def __enter__(self):
        print("Entering context")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting context")

with MyContextManager() as cm:
    print("Inside context")

# Creating and running threads
import threading

def print_numbers():
    for i in range(5):
        print(i)

thread = threading.Thread(target=print_numbers)
thread.start()
thread.join()

# Async functions and await
import asyncio

async def async_func():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

asyncio.run(async_func())

# Built-in functions and methods
length = len(lst)
mapped = list(map(lambda x: x * 2, lst))
filtered = list(filter(lambda x: x > 2, lst))
string_methods = c.upper()
