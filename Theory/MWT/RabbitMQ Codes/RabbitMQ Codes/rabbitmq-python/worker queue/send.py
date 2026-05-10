import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# durable true means even if rabbitmq server goes down before consumer consumes message, message will not be lost
channel.queue_declare(queue='worker_queue', durable=True)

# get message from user else send `Hello World!`
# Example: python send.py Message1
message = ' '.join(sys.argv[1:]) or "Hello World!"
channel.basic_publish(
    exchange='',
    routing_key='worker_queue',
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,  # make message persistent
    ))

print(" [x] Sent %r" % message)
connection.close()
