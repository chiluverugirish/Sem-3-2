import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.exchange_declare(
    exchange='headers_logs',
    exchange_type='headers'
)

headers = {
    'format': 'pdf',
    'type': 'report'
}

channel.basic_publish(
    exchange='headers_logs',
    routing_key='',
    body='Headers Exchange Message',
    properties=pika.BasicProperties(headers=headers)
)

print(" [x] Sent headers message")
connection.close()
