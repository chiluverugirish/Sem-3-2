import pika

# Establish a connection to RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare an exchange (we'll use the default direct exchange here)
#channel.exchange_declare(exchange='', exchange_type='direct')

# Declare a queue named 'hello'
channel.queue_declare(queue='hello')

# Bind the queue to the default exchange with a routing key 'hello'
#channel.queue_bind(exchange='', queue='hello', routing_key='hello')

# The message to send
message = 'Hello, World!'

# Publish the message to the exchange with the routing key 'hello'
channel.basic_publish(exchange='',
                      routing_key='hello',
                      body=message)

print(f" [x] Sent '{message}'")

# Close the connection
connection.close()
