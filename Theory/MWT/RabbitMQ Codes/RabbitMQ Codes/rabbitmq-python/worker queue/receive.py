import pika
import time

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='worker_queue', durable=True)
# fetch only one task at a time
channel.basic_qos(prefetch_count=1)

print(' [*] Waiting for messages. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body.decode())
    time.sleep(body.count(b'.'))  # add timeout based on dots(.) in message Example: Message1... adds 3 seconds
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag) # Send acknowledgement instead of auto acknowledgement

# if a worker is busy then message is delivered to next worker
channel.basic_consume(queue='worker_queue', on_message_callback=callback, auto_ack=False)

channel.start_consuming()
