import turtle

def draw_square():
    window = turtle.Screen()
    window.bgcolor("white")

    brad = turtle.Turtle()
    brad.color("green")
    brad.speed(10)

    def triangle():
        brad.forward(70)
        brad.right(120)
        brad.forward(100)
        brad.right(120)
        brad.forward(100)
        brad.right(120)
        brad.forward(30)
    for i in range(72):
        triangle()
        brad.right(5)

draw_square()