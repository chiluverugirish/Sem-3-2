import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.exchange_declare(
    exchange='topic_logs',
    exchange_type='topic'
)

routing_key = 'system.error'
message = 'System Error Occurred'

channel.basic_publish(
    exchange='topic_logs',
    routing_key=routing_key,
    body=message
)

print(" [x] Sent:", message)
connection.close()
