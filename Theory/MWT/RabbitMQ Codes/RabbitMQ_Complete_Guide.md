# Complete RabbitMQ Directory Guide 📚

**Author:** Complete Analysis  
**Date:** April 2026  
**Version:** 1.0

---

## Table of Contents

1. [RabbitMQ Fundamentals](#rabbitmq-fundamentals)
2. [Architecture Overview](#architecture-overview)
3. [JavaScript Implementations](#javascript-implementations)
4. [Python Implementations](#python-implementations)
5. [Comparison Table](#comparison-table)
6. [When to Use Each Pattern](#when-to-use-each-pattern)

---

## RabbitMQ Fundamentals

### What is RabbitMQ?

RabbitMQ is a **Message Broker** (Message-Oriented Middleware - MOM) that enables asynchronous communication between applications. It implements the AMQP (Advanced Message Queuing Protocol) protocol.

### Key Components

```
┌─────────────────────────────────────────────────────────┐
│                     RabbitMQ Broker                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐                                            │
│  │ Exchange │ ← Receives messages from Producers        │
│  └─────┬────┘                                            │
│        │ Routes based on type & binding rules            │
│        ▼                                                  │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐   │
│  │ Queue 1  │        │ Queue 2  │   ...  │ Queue N  │   │
│  └──────────┘        └──────────┘        └──────────┘   │
│        │                   │                    │        │
│        ▼                   ▼                    ▼        │
│   Consumer 1         Consumer 2          Consumer N      │
└─────────────────────────────────────────────────────────┘
```

### Three Main Concepts

| Concept      | Purpose         | Function                                      |
| ------------ | --------------- | --------------------------------------------- |
| **Producer** | Sends messages  | Publishes messages to exchange                |
| **Exchange** | Routes messages | Distributes messages to queues based on rules |
| **Queue**    | Stores messages | Holds messages until consumer retrieves them  |

---

## Architecture Overview

### Message Flow (Producer to Consumer)

```
SENDER SIDE                    BROKER SIDE                 RECEIVER SIDE
┌─────────────┐               ┌─────────────┐              ┌─────────────┐
│  Producer   │ ──message──→  │  Exchange   │ ──route──→   │   Queue     │
│             │   +routing    │             │              │             │
│ • Publishes │     key       │ • Receives  │              │ • Stores    │
│ • Defines   │               │ • Routes    │              │ • Waits for │
│   exchange  │               │   to queue  │              │   consumer  │
└─────────────┘               └─────────────┘              └─────┬───────┘
                                                                  │
                                                                  │
                                                            ┌─────▼────────┐
                                                            │  Consumer    │
                                                            │              │
                                                            │ • Consumes   │
                                                            │ • Processes  │
                                                            │ • Acknowledges
                                                            └──────────────┘
```

### Connection Components

```python
┌─────────────────────────────────────────────────┐
│ Connection (TCP connection to RabbitMQ server)  │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │ Channel (Virtual connection for messaging │  │
│  │          - Multiple per connection)       │  │
│  │                                            │  │
│  │  ├─ Send messages                         │  │
│  │  ├─ Declare exchanges & queues            │  │
│  │  ├─ Bind queues to exchanges              │  │
│  │  └─ Consume messages                      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## JavaScript Implementations

Your workspace has **4 JavaScript folders**, each demonstrating a different exchange type:

---

### 1️⃣ Direct Exchange Pattern

**Folder:** `rabbitmq-nodejs/direct-exchange/`

#### What is Direct Exchange?

Direct Exchange routes messages to queues based on **exact routing key matching**. It's like a telephone system where each number routes to a specific phone.

#### Architecture Diagram

```
                   PRODUCER SENDS: routing_key = "info"
                          ↓
                    ┌──────────────┐
                    │    DIRECT    │
                    │   EXCHANGE   │
                    │  (logs_...)  │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   routing_key         routing_key        routing_key
    = "info"            = "warn"           = "error"
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌────────┐
    │ Queue  │         │ Queue  │        │ Queue  │
    │  Info  │         │ Warn   │        │ Error  │
    └────┬───┘         └────┬───┘        └────┬───┘
         │                  │                 │
         ▼                  ▼                 ▼
     Consumer A         Consumer B        Consumer C
   (Logs to file)   (Logs to console)  (Alert system)
```

#### Code Structure

**Producer (producer.js):**

```javascript
// 1. Connect to RabbitMQ
const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();

// 2. Declare DIRECT exchange
const exchangeName = "logs_exchange";
await channel.assertExchange(exchangeName, "direct", { durable: true });

// 3. Publish message with routing key
const routingKey = "info"; // or "warn", "error"
channel.publish(
  exchangeName,
  routingKey, // EXACT MATCH required
  Buffer.from("Message"),
);
```

**Consumer (consumer.js):**

```javascript
// 1. Connect
const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();

// 2. Declare same exchange
await channel.assertExchange(exchangeName, "direct", { durable: true });

// 3. Declare queue
await channel.assertQueue(queueName, { durable: true });

// 4. BIND queue to exchange with specific routing key
await channel.bindQueue(queueName, exchangeName, "info");
//                                                 ^^^^^^
//                                    Only "info" messages received

// 5. Consume messages
channel.consume(queueName, (msg) => {
  console.log(msg.content.toString());
  channel.ack(msg);
});
```

#### Key Features

- ✅ **Selective routing** - Only exact matching keys
- ✅ **Multiple bindings** - One queue can bind multiple keys
- ✅ **Load balancing** - Multiple consumers on same queue
- 📌 **Use Case:** Severity-based logging, error routing

#### Execution Flow

```
TIMELINE:
┌──────────────────────────────────────────────────────────┐
│ Producer sends: {exchange: "logs_exchange",             │
│                 routing_key: "info",                    │
│                 message: "jai girish5"}                 │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
         RabbitMQ Direct Exchange
              Checks: Does any queue
           have binding with key="info"?
                   │
        YES! logs_queue has it
                   │
                   ▼
            logs_queue [receives message]
                   │
                   ▼
          Consumer calls channel.consume()
          Reads: "jai girish5"
          Sends: channel.ack(msg)
                   │
                   ▼
           Message deleted from queue
```

---

### 2️⃣ Fanout Exchange Pattern

**Folder:** `rabbitmq-nodejs/fanout-exchange/`

#### What is Fanout Exchange?

Fanout Exchange broadcasts messages to **ALL bound queues**, ignoring the routing key. It's like a radio broadcast - everyone tuned in receives the message.

#### Architecture Diagram

```
                   PUBLISHER SENDS: any routing key
                          ↓
                    ┌──────────────┐
                    │   FANOUT     │
                    │  EXCHANGE    │
                    │  (logs)      │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ Anonymous  │    │ Anonymous  │    │ Anonymous  │
    │  Queue 1   │    │  Queue 2   │    │  Queue 3   │
    │(exclusive) │    │(exclusive) │    │(exclusive) │
    └────┬───────┘    └────┬───────┘    └────┬───────┘
         │                 │                 │
         ▼                 ▼                 ▼
     Subscriber 1      Subscriber 2      Subscriber 3
   (Same message)    (Same message)    (Same message)
```

#### Code Structure

**Publisher (publisher.js):**

```javascript
const exchangeName = "logs";

// Declare FANOUT exchange
await channel.assertExchange(exchangeName, "fanout", { durable: false });

// Publish to fanout (routing key is IGNORED)
channel.publish(
  exchangeName,
  "", // ← Routing key doesn't matter
  Buffer.from("Hello Subscribers! This is a Pub/Sub message."),
);
```

**Subscriber (subscriber.js):**

```javascript
const exchangeName = "logs";

// Declare same fanout exchange
await channel.assertExchange(exchangeName, "fanout", { durable: false });

// Create ANONYMOUS (exclusive) queue
const q = await channel.assertQueue("", { exclusive: true });
// ↑ RabbitMQ generates random queue name like: amq.gen-Jzty...

// BIND queue to fanout exchange (routing key ignored)
await channel.bindQueue(q.queue, exchangeName, "");

// Consume messages
channel.consume(
  q.queue,
  (msg) => {
    if (msg.content) {
      console.log(" [x] Received:", msg.content.toString());
    }
  },
  { noAck: true },
);
```

#### Key Features

- 📢 **Broadcasting** - All subscribers get all messages
- 🎲 **Temporary queues** - Exclusive, auto-delete queues
- 🔄 **One-to-many** - Single producer, multiple consumers
- 📌 **Use Case:** Real-time notifications, logs broadcasting, events

#### Execution Flow

```
TIMELINE:
┌────────────────────────────────────────────────────────────┐
│ Subscriber 1 connects and creates queue: amq.gen-RQ6...   │
│ Subscriber 1 binds queue to "logs" fanout exchange        │
│ Subscriber 2 connects and creates queue: amq.gen-As8...   │
│ Subscriber 2 binds queue to "logs" fanout exchange        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
         Publisher publishes to "logs" exchange
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    [amq.gen-RQ6...]  [amq.gen-As8...]  [other queues]
        │                │                │
        ▼                ▼                ▼
   Subscriber 1 ✓   Subscriber 2 ✓   [receives message]
   Gets message     Gets message
```

---

### 3️⃣ Topic Exchange Pattern

**Folder:** `rabbitmq-nodejs/topic-exchange/`

#### What is Topic Exchange?

Topic Exchange routes messages based on **pattern matching** using wildcards. Each routing key is a dot-separated string, and consumers bind using patterns.

#### Wildcard Rules

- `*` = matches exactly one word (between dots)
- `#` = matches zero or more words

#### Architecture Diagram

```
ROUTING KEYS PUBLISHED:
  • order.created
  • order.shipped
  • payment.success
  • order.created.online

                    ┌──────────────────┐
                    │  TOPIC EXCHANGE  │
                    │  (topic_logs)    │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                  │
      order.*          order.#         payment.*
      (1 level)   (ANY levels deep)  (1 level)
           │                 │                  │
           ▼                 ▼                  ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Consumer 1   │ │ Consumer 2   │ │ Consumer 3   │
    │ (Shipping)   │ │ (Logging)    │ │ (Billing)    │
    └──────────────┘ └──────────────┘ └──────────────┘

ROUTING BEHAVIOR:
  order.created          → Consumer 1 ✓, Consumer 2 ✓
  order.shipped          → Consumer 1 ✓, Consumer 2 ✓
  order.created.online   → Consumer 2 ✓ (matches order.#)
  payment.success        → Consumer 3 ✓
```

#### Code Structure

**Producer (producer.js):**

```javascript
const exchange = "topic_logs";
const exchangeType = "topic";

await channel.assertExchange(exchange, exchangeType, { durable: false });

// Send various messages with different routing keys
const messages = [
  { key: "order.created", msg: "Order created" },
  { key: "order.shipped", msg: "Order shipped" },
  { key: "payment.success", msg: "Payment successful" },
  { key: "order.created.online", msg: "Online order created" },
];

messages.forEach((m) => {
  channel.publish(exchange, m.key, Buffer.from(m.msg));
  console.log(`Sent [${m.key}] : ${m.msg}`);
});
```

**Consumer 1 (consumer1.js) - Pattern: order.\*:**

```javascript
const exchange = "topic_logs";

await channel.assertExchange(exchange, "topic", { durable: false });

const q = await channel.assertQueue("", { exclusive: true });

// BIND with pattern: matches order.XXX (1 level)
await channel.bindQueue(q.queue, exchange, "order.*");
//                                         ^^^^^^^^
//                                    Pattern match!

channel.consume(
  q.queue,
  (msg) => {
    if (msg) {
      console.log(
        `Consumer 1 received [${msg.fields.routingKey}] : ${msg.content.toString()}`,
      );
      // OUTPUT:
      // Consumer 1 received [order.created] : Order created
      // Consumer 1 received [order.shipped] : Order shipped
    }
  },
  { noAck: true },
);
```

**Consumer 2 - Pattern: order.# (any depth):**

```javascript
// Same setup but with pattern: order.#
await channel.bindQueue(q.queue, exchange, "order.#");
//                                         ^^^^^^^
//                                    Matches ANY order.* or order.*.*
// Receives: order.created, order.shipped, order.created.online
```

#### Key Features

- 🎯 **Pattern matching** - Wildcards for flexible routing
- 📊 **Hierarchical routing** - Dot-separated categories
- 🔍 **Topic-based** - Subscribe to topics of interest
- 📌 **Use Case:** Multi-level event routing, sensor data, category filtering

#### Wildcards Explained

```
Pattern        Matches                    Doesn't Match
────────────────────────────────────────────────────────
order.*        order.created              order.created.online
               order.shipped              payment.success

order.#        order.created              payment.created
               order.shipped
               order.created.online
               order.created.online.fast  (ANY depth)

*.error        system.error               system.error.disk
               db.error                   multiple.level.error

#.fast         fast                       (matches ANYTHING)
               order.fast
               order.created.fast
```

#### Execution Flow

```
TIMELINE:
┌──────────────────────────────────────────────────────────┐
│ Consumer 1 binds to exchange with pattern: order.*       │
│ Consumer 2 binds to exchange with pattern: order.#       │
│ Consumer 3 binds to exchange with pattern: payment.*     │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
    Producer publishes: routing_key="order.created"
                   │
         RabbitMQ Topic Exchange:
         Check each binding pattern
                   │
        ┌──────────┼──────────┐
        │          │          │
    order.* matches   order.# matches   payment.* no match
        │          │          │
        ▼          ▼          ▼
    Consumer 1  Consumer 2   (skip)
    receives    receives
    message     message
```

---

### 4️⃣ Headers Exchange Pattern

**Folder:** `rabbitmq-nodejs/headers-exchange/`

#### What is Headers Exchange?

Headers Exchange routes messages based on **message header attributes** rather than routing keys. Headers can use `all` (AND logic) or `any` (OR logic) matching.

#### Architecture Diagram

```
PRODUCER SENDS: Headers: {format: "pdf", type: "report"}
                         ↓
                    ┌──────────────┐
                    │   HEADERS    │
                    │  EXCHANGE    │
                    │(header_logs) │
                    └──────┬───────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
  x-match: all      x-match: any       x-match: any
  format: pdf       format: pdf        type: report
  type: report      (skip type)
          │                │                 │
          ▼                ▼                 ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Queue 1  │    │ Queue 2  │    │ Queue 3  │
    │(strict)  │    │(flexible)│    │(flexible)│
    └──────────┘    └──────────┘    └──────────┘

MESSAGE ROUTING:
  Headers: {format: "pdf", type: "report"}
    Queue 1: ✓ (all match: pdf AND report)
    Queue 2: ✓ (any match: has pdf)
    Queue 3: ✓ (any match: has report)

  Headers: {format: "pdf", type: "text"}
    Queue 1: ✗ (NOT all match: no type:report)
    Queue 2: ✓ (any match: has pdf)
    Queue 3: ✗ (no type:report)
```

#### Code Structure

**Producer (producer.js):**

```javascript
const exchange = "header_logs";

await channel.assertExchange(exchange, "headers", { durable: false });

const message = "PDF Report Generated";

// Publish with headers (routing key IGNORED)
channel.publish(
  exchange,
  "", // ← Routing key is ignored
  Buffer.from(message),
  {
    headers: {
      // ← Headers matter!
      format: "pdf",
      type: "report",
    },
  },
);
```

**Consumer (consumer.js):**

```javascript
const exchange = "header_logs";
const queue = "header_queue";

await channel.assertExchange(exchange, "headers", { durable: false });
await channel.assertQueue(queue, { durable: false });

// BIND with header matching
await channel.bindQueue(queue, exchange, "", {
  "x-match": "all", // ← Match ALL headers specified below
  format: "pdf", // AND
  type: "report", // AND
});

// This queue receives messages with
// BOTH format:pdf AND type:report

channel.consume(queue, (msg) => {
  if (msg) {
    console.log(" Received:", msg.content.toString());
    channel.ack(msg);
  }
});
```

#### x-match Options

```
x-match: "all"  →  Message headers MUST match ALL binding headers
                   (AND logic)
                   Example: format:pdf AND type:report required

x-match: "any"  →  Message headers MUST match ANY binding headers
                   (OR logic)
                   Example: format:pdf OR type:report is enough
```

#### Key Features

- 🏷️ **Header-based routing** - Use custom attributes
- 🔀 **Flexible matching** - AND (all) or OR (any) logic
- 📦 **Complex filtering** - Based on message properties
- 📌 **Use Case:** Content-based routing, complex filtering, protocol-specific messages

#### Execution Flow

```
TIMELINE:
┌────────────────────────────────────────────────────────────┐
│ Consumer binds to headers exchange with:                  │
│   x-match: "all"                                          │
│   format: "pdf"                                           │
│   type: "report"                                          │
└────────────────┬──────────────────────────────────────────┘
                 │
                 ▼
    Producer publishes message with headers:
    {format: "pdf", type: "report"}
                 │
        RabbitMQ Headers Exchange:
        Check: Does ALL headers match?
                 │
        format:pdf ✓ AND type:report ✓
                 │
                 ▼
            Message delivered to queue
                 │
                 ▼
            Consumer receives:
            "PDF Report Generated"
```

---

## Python Implementations

Your workspace has **5 Python folders**, implementing both exchange patterns and work queue:

---

### 1️⃣ Default Exchange Pattern

**Folder:** `rabbitmq-python/default exchange/`

#### What is Default Exchange?

The default exchange is a **direct exchange with no name** (empty string). Messages are routed directly to queues using routing keys that match queue names.

#### Architecture Diagram

```
PRODUCER SENDS: routing_key="hello"
        ↓
┌─────────────────────────────┐
│  DEFAULT EXCHANGE ("")      │
│  (Built-in, direct type)    │
└────────────┬────────────────┘
             │
    Match routing_key with queue names
             │
             ▼
        ┌─────────┐
        │  Queue  │ ← If queue name == "hello"
        │ "hello" │
        └────┬────┘
             │
             ▼
         Consumer
```

#### Code Structure

**Sender (send.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare queue
channel.queue_declare(queue='hello')

message = 'Hello, World!'

# Publish using DEFAULT exchange ('')
channel.basic_publish(
    exchange='',           # ← Default exchange
    routing_key='hello',   # ← Queue name
    body=message
)

print(f" [x] Sent '{message}'")
connection.close()
```

**Receiver (receive.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare queue (must match routing_key from producer)
channel.queue_declare(queue='hello')

def callback(ch, method, properties, body):
    print(f" [x] Received '{body.decode()}'")

# Consume from queue
channel.basic_consume(
    queue='hello',
    on_message_callback=callback,
    auto_ack=True
)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

#### Key Features

- 🔗 **Direct queue routing** - routing_key = queue name
- 📮 **Default behavior** - No explicit exchange declaration
- ⚡ **Simplest pattern** - Good for simple point-to-point
- 📌 **Use Case:** Simple task queues, basic message passing

#### Execution Flow

```
TIMELINE:
┌──────────────────────────────────────┐
│ Receiver declares queue: "hello"     │
│ Receiver starts consuming            │
└──────────┬───────────────────────────┘
           │
           ▼
  Sender publishes:
  exchange: ''
  routing_key: 'hello'
  message: 'Hello, World!'
           │
    Default Exchange routes:
    routing_key='hello' → queue name='hello'
           │
           ▼
      Queue receives message
           │
           ▼
      Receiver consumes:
      "Hello, World!"
```

---

### 2️⃣ Pub/Sub Fanout Pattern (Python)

**Folder:** `rabbitmq-python/pub-sub-fanout/`

#### Code Structure

**Sender (send.py):**

```python
import pika
import sys

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare FANOUT exchange
channel.exchange_declare(
    exchange='pub-sub',
    exchange_type='fanout'
)

# Get message from user
message = ' '.join(sys.argv[1:]) or "info: Hello World!"

# Publish (routing key ignored)
channel.basic_publish(
    exchange='pub-sub',
    routing_key='',     # ← Ignored in fanout
    body=message
)

print(" [x] Sent %r" % message)
connection.close()
```

**Receiver (receive.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare FANOUT exchange
channel.exchange_declare(
    exchange='pub-sub',
    exchange_type='fanout'
)

# Create anonymous queue
result = channel.queue_declare(queue='', exclusive=True)
queue_name = result.method.queue

# Bind to exchange
channel.queue_bind(
    exchange='pub-sub',
    queue=queue_name
)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r" % body)

channel.basic_consume(
    queue=queue_name,
    on_message_callback=callback,
    auto_ack=True
)

channel.start_consuming()
```

#### Key Features

- 📢 **Pub/Sub pattern** - Multiple subscribers
- 🆓 **Anonymous queues** - Exclusive, auto-delete
- 🔄 **Broadcasting** - All subscribers get all messages
- 📌 **Use Case:** Real-time notifications, log distribution

---

### 3️⃣ Topic Exchange Pattern (Python)

**Folder:** `rabbitmq-python/Topic Exchange/`

#### Code Structure

**Sender (send.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare TOPIC exchange
channel.exchange_declare(
    exchange='topic_logs',
    exchange_type='topic'
)

routing_key = 'system.error'
message = 'System Error Occurred'

# Publish with routing key
channel.basic_publish(
    exchange='topic_logs',
    routing_key=routing_key,
    body=message
)

print(" [x] Sent:", message)
connection.close()
```

#### Key Features

- 🎯 **Topic routing** - Pattern-based subscriptions
- 📊 **Hierarchical** - Dot-separated routing keys
- 🔍 **Selective** - Subscribe to relevant topics only
- 📌 **Use Case:** Topic-based event distribution

---

### 4️⃣ Headers Exchange Pattern (Python)

**Folder:** `rabbitmq-python/header exchange/`

#### Code Structure

**Structure similar to JavaScript headers exchange**

#### Key Features

- 🏷️ **Header-based routing** - Custom attributes
- 📦 **Complex filtering** - Based on message properties
- 🔀 **Flexible matching** - AND/OR logic

---

### 5️⃣ Work Queue Pattern (Python)

**Folder:** `rabbitmq-python/worker queue/`

#### What is Work Queue / Task Queue?

Work Queue distributes tasks among multiple workers. Each task goes to exactly ONE worker (competing consumers pattern). Perfect for long-running operations.

#### Architecture Diagram

```
         PRODUCER                    RABBITMQ              WORKERS

    ┌──────────────┐              ┌──────────────┐
    │   Producer   │              │    Queue     │      ┌─────────────┐
    │   Sends      │──task1──────→│"worker_queue"│─────→│  Worker 1   │
    │   Tasks      │              │              │      │(processing) │
    │              │──task2──────→│              │      └─────────────┘
    │              │              │              │
    │              │──task3──────→│              │      ┌─────────────┐
    │              │              │              │─────→│  Worker 2   │
    │              │──task4──────→│              │      │(processing) │
    └──────────────┘              │              │      └─────────────┘
                                  │              │
                                  │ [Task Queue] │      ┌─────────────┐
                                  │              │─────→│  Worker 3   │
                                  │              │      │ (idle)      │
                                  └──────────────┘      └─────────────┘

DISTRIBUTION:
Task 1 → Worker 1
Task 2 → Worker 2
Task 3 → Worker 1 (after Task 1 completes)
Task 4 → Worker 3
```

#### Code Structure

**Sender (send.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare DURABLE queue (survives server restart)
channel.queue_declare(
    queue='worker_queue',
    durable=True
)

message = 'Hello World!'

# Publish with persistent delivery
channel.basic_publish(
    exchange='',
    routing_key='worker_queue',
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,  # ← Make message persistent
    )
)

print(" [x] Sent %r" % message)
connection.close()
```

**Receiver (receive.py):**

```python
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# Declare DURABLE queue
channel.queue_declare(
    queue='worker_queue',
    durable=True
)

def callback(ch, method, properties, body):
    print(f" [x] Received {body.decode()}")
    # Do work...
    time.sleep(body.decode().count(b'.'))

    # ACKNOWLEDGE after completion
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Fair dispatch - one message per worker
channel.basic_qos(prefetch_count=1)

channel.basic_consume(
    queue='worker_queue',
    on_message_callback=callback
)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

#### Key Features

```
┌─────────────────────────────────────┐
│ WORK QUEUE CHARACTERISTICS          │
├─────────────────────────────────────┤
│ ✓ Competing Consumers               │
│   (Each message to ONE consumer)    │
│                                     │
│ ✓ Load Balancing                    │
│   (Distribute work among workers)   │
│                                     │
│ ✓ Durability                        │
│   (Queue survives server crash)     │
│                                     │
│ ✓ Message Persistence               │
│   (Message survives server crash)   │
│                                     │
│ ✓ Fair Dispatch (prefetch_count=1) │
│   (Don't send until previous done)  │
│                                     │
│ ✓ Acknowledgments                   │
│   (Confirm task completion)         │
└─────────────────────────────────────┘
```

#### Execution Flow

```
TIMELINE:

Producer:
  task1 → Queue
  task2 → Queue
  task3 → Queue
  task4 → Queue

RabbitMQ Queue holds: [task1, task2, task3, task4]

Worker 1 (prefetch=1):
  Receives: task1
  Processing... (5 seconds)
  ack(task1) ✓
  RabbitMQ: "One message done, send next"
  Receives: task3

Worker 2 (prefetch=1):
  Receives: task2
  Processing... (2 seconds)
  ack(task2) ✓
  RabbitMQ: "One message done"
  Receives: task4

Result:
  [COMPLETE] task2 (Worker 2, 2s)
  [COMPLETE] task4 (Worker 2, 3s)
  [COMPLETE] task1 (Worker 1, 5s)
  [COMPLETE] task3 (Worker 1, 4s)

NOTE: Tasks go to available workers, not round-robin!
Fair dispatch ensures efficient resource usage.
```

#### Why Durability Matters

```
SCENARIO: RabbitMQ server crashes during processing

WITHOUT durable=True & delivery_mode=2:
  ❌ All messages in queue lost
  ❌ Task data lost forever
  ❌ No retry possible

WITH durable=True & delivery_mode=2:
  ✅ Queue persisted to disk
  ✅ Messages persisted to disk
  ✅ After restart: Queue and messages recovered
  ✅ Unacknowledged messages redelivered to workers
```

---

## Comparison Table

### Exchange Type Comparison

| Feature               | Direct                         | Fanout           | Topic                | Headers           |
| --------------------- | ------------------------------ | ---------------- | -------------------- | ----------------- |
| **Routing Decision**  | Exact routing key              | Broadcast to all | Pattern matching     | Message headers   |
| **Routing Key**       | Exact match required           | Ignored          | Wildcard patterns    | Ignored           |
| **Binding Key**       | Specific value                 | Empty string     | Pattern with `*` `#` | Header attributes |
| **Multiple Bindings** | Yes (one queue, multiple keys) | No               | Yes                  | Yes               |
| **Complexity**        | Low                            | Very Low         | Medium               | High              |
| **Use Case**          | Error/severity routing         | Notifications    | Event topics         | Complex filtering |

### Pattern Comparison

```
JAVASCRIPT (4 patterns):
├─ Direct Exchange      → Selective routing by severity
├─ Fanout Exchange      → Broadcast to all subscribers
├─ Topic Exchange       → Pattern-based routing (order.*, *.error)
└─ Headers Exchange     → Custom header-based routing

PYTHON (5 patterns):
├─ Default Exchange     → Direct queue by name
├─ Pub/Sub Fanout       → Broadcast (same as JS)
├─ Topic Exchange       → Pattern routing (same as JS)
├─ Headers Exchange     → Custom attributes (same as JS)
└─ Work Queue           → Task distribution with acknowledgments
```

---

## When to Use Each Pattern

### Decision Tree

```
                    ┌─── Need to route to MULTIPLE consumers? ───┐
                    │                                             │
                   YES                                           NO
                    │                                             │
                    ▼                                             ▼
            ┌──────────────────┐                          ┌──────────────┐
            │ FANOUT EXCHANGE  │                          │ SIMPLE QUEUE │
            │ Broadcast ALL    │                          │ Point-to-Pt  │
            │ No routing logic │                          └──────────────┘
            └────────┬─────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
      Want pattern          Need header-based
      matching?             filtering?
         │                          │
        YES                        YES
         │                          │
         ▼                          ▼
    ┌─────────────┐        ┌──────────────────┐
    │ TOPIC       │        │ HEADERS EXCHANGE │
    │ EXCHANGE    │        │ Custom attributes│
    │ (order.*)   │        └──────────────────┘
    └─────────────┘
         │
      NO, exact match only
         │
         ▼
    ┌─────────────┐
    │ DIRECT      │
    │ EXCHANGE    │
    │ (exact key) │
    └─────────────┘
```

### Real-World Scenarios

#### Scenario 1: Logging System

```
Requirement: Send different log levels to different outputs
  error   → Email alert system
  warning → Log file
  info    → Console

Solution: DIRECT EXCHANGE
  Binding: "error"   → Alert Queue
  Binding: "warning" → File Queue
  Binding: "info"    → Console Queue
```

#### Scenario 2: News/Stock Market

```
Requirement: Multiple users subscribe to different stocks
  Apple stock    → 500 users listening
  Google stock   → 300 users listening
  Tesla stock    → 1000 users listening

Solution: TOPIC EXCHANGE or FANOUT
  TOPIC: Each user subscribes to "stock.AAPL", "stock.GOOG", etc.
  FANOUT: All users get all stock updates (then filter client-side)
```

#### Scenario 3: Image Processing

```
Requirement: Distribute image processing tasks among workers
  20 images waiting
  3 available workers

Solution: WORK QUEUE
  Each worker gets 1 image at a time
  After completing, receives next image
  Fair distribution of load
```

#### Scenario 4: Complex Event Routing

```
Requirement: Route based on message content type AND priority
  PDF + High Priority  → Urgent Queue
  PDF + Low Priority   → Standard Queue
  Text + Any Priority  → Archive Queue

Solution: HEADERS EXCHANGE
  Binding 1: x-match:all, type:pdf, priority:high
  Binding 2: x-match:all, type:pdf, priority:low
  Binding 3: x-match:any, type:text
```

---

## Setup & Running Guide

### Prerequisites

```bash
# Install RabbitMQ
# On Windows: Download from https://www.rabbitmq.com/docs/download
# On Linux: sudo apt-get install rabbitmq-server
# On Mac: brew install rabbitmq

# Start RabbitMQ server
rabbitmq-server

# Access Management UI
# http://localhost:15672 (default: guest/guest)
```

### Running JavaScript Examples

```bash
# Install Node.js and dependencies
npm install amqplib

# Terminal 1: Run Consumer/Subscriber
node consumer.js              # direct-exchange
node subscriber.js            # fanout-exchange
node consumer1.js             # topic-exchange
node consumer.js              # headers-exchange

# Terminal 2: Run Producer/Publisher
node producer.js              # direct-exchange
node publisher.js             # fanout-exchange
node producer.js              # topic-exchange
node producer.js              # headers-exchange
```

### Running Python Examples

```bash
# Install Python and dependencies
pip install pika

# Terminal 1: Run Receiver/Subscriber
python receive.py             # default exchange
python receive.py             # pub-sub-fanout
python receive.py             # Topic Exchange
python receive.py             # worker queue

# Terminal 2: Run Sender
python send.py "Your message"
```

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to localhost:5672"

```
Problem: RabbitMQ server not running
Solution:
  1. Start RabbitMQ service
  2. Check if port 5672 is open
  3. Verify connection string: amqp://localhost or amqp://127.0.0.1
```

### Issue 2: "Queue already exists with different properties"

```
Problem: Trying to declare queue/exchange with different settings
Solution:
  1. Delete the queue in RabbitMQ Management UI (http://localhost:15672)
  2. Or change queue/exchange name in code
  3. Or stop and restart RabbitMQ service
```

### Issue 3: "Message not being received"

```
Problem:
  1. Queue not bound to exchange
  2. Consumer not started before producer
  3. Routing key doesn't match

Solution:
  1. Verify binding with: rabbitmqctl list_bindings
  2. Start consumer BEFORE producer
  3. Check routing key/pattern in binding
```

### Issue 4: "Messages lost when RabbitMQ restarts"

```
Problem: Queue or messages not persistent
Solution:
  JavaScript:
    assertQueue(queue, {durable: true})
    publish(..., {persistent: true})

  Python:
    queue_declare(queue='...', durable=True)
    publish(..., delivery_mode=2)
```

---

## Quick Command Reference

### RabbitMQ CLI Commands

```bash
# List all queues
rabbitmqctl list_queues

# List all exchanges
rabbitmqctl list_exchanges

# List all bindings
rabbitmqctl list_bindings

# Purge a queue (delete all messages)
rabbitmqctl purge_queue queue_name

# Delete a queue
rabbitmqctl delete_queue queue_name

# Delete an exchange
rabbitmqctl delete_exchange exchange_name

# Show users
rabbitmqctl list_users

# Reset RabbitMQ (WARNING: Deletes all data!)
rabbitmqctl reset
```

---

## Summary & Key Takeaways

### Directory Structure Overview

```
RabbitMQ Codes/
├─ rabbitmq-nodejs/              (4 JavaScript patterns)
│  ├─ direct-exchange/           Exact routing key match
│  ├─ fanout-exchange/           Broadcast to all
│  ├─ topic-exchange/            Pattern matching (*, #)
│  └─ headers-exchange/          Header-based routing
│
└─ rabbitmq-python/              (5 Python patterns)
   ├─ default exchange/          Direct queue routing
   ├─ pub-sub-fanout/            Broadcast pattern
   ├─ Topic Exchange/            Pattern matching
   ├─ header exchange/           Header-based routing
   └─ worker queue/              Task distribution
```

### Key Concepts Mastered

✅ **Producer** sends messages to **Exchange**  
✅ **Exchange** routes to **Queues** based on type  
✅ **Queue** holds messages until **Consumer** processes  
✅ **Consumer** acknowledges after successful processing  
✅ **Bindings** define relationship between exchanges and queues

### Exchange Types

✅ **Direct** - Exact routing key matching  
✅ **Fanout** - Broadcast to all bound queues  
✅ **Topic** - Pattern matching with wildcards  
✅ **Headers** - Message header attribute matching

### Best Practices

✅ Use **durable queues** for important data  
✅ Mark **messages as persistent** when durability matters  
✅ Use **acknowledgments** to ensure delivery  
✅ Set **prefetch=1** for fair worker distribution  
✅ Always **close connections** after use

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Total Patterns Documented:** 9 (4 JS + 5 Python)
