import pika, sys
sys.path.append('../')
#import config as cfg

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='pub-sub', exchange_type='fanout')

# Declare an anonymous, non-durable, exclusive, auto-delete queue
result = channel.queue_declare(queue='', exclusive=True)
# get the name of a queue declared by rabbitmq
queue_name = result.method.queue

# Bind the anonymous queue to the 'pub-sub' exchange
channel.queue_bind(exchange='pub-sub', queue=queue_name)

print(' [*] Waiting for logs. To exit press CTRL+C')
def callback(ch, method, properties, body):
    print(" [x] %r" % body)

channel.basic_consume(queue=queue_name,
                      on_message_callback=callback,
                      auto_ack=True)

channel.start_consuming()

