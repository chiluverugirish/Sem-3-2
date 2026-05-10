import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.exchange_declare(
    exchange='headers_logs',
    exchange_type='headers'
)

result = channel.queue_declare(queue='', exclusive=True)
queue_name = 'hqueue'

channel.queue_bind(
    exchange='headers_logs',
    queue=queue_name,
    arguments={
        'x-match': 'all',
        'format': 'pdf',
        'type': 'report'
    }
)

def callback(ch, method, properties, body):
    print(" [x] Received:", body.decode())

channel.basic_consume(
    queue=queue_name,
    on_message_callback=callback,
    auto_ack=True
)

print("Waiting for headers messages...")
channel.start_consuming()
