import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.exchange_declare(
    exchange='topic_logs',
    exchange_type='topic'
)

result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

channel.queue_bind(
    exchange='topic_logs',
    queue=queue_name,
    routing_key='system.*'
)

def callback(ch, method, properties, body):
    print(" [x] Received:", body.decode())

channel.basic_consume(
    queue=queue_name,
    on_message_callback=callback,
    auto_ack=True
)

print("Waiting for topic messages...")
channel.start_consuming()
