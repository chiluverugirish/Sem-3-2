import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare a exchange named in config file
channel.exchange_declare(exchange='pub-sub', exchange_type='fanout')

# Get message from user else send `info: Hello World!`
# Example: python send.py Message1
message = ' '.join(sys.argv[1:]) or "info: Hello World!"
channel.basic_publish(exchange='pub-sub', routing_key='', body=message)

print(" [x] Sent %r" % message)
connection.close()
