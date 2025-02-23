import amqp, { Connection, Channel } from "amqplib";

class RabbitMQ {
  private static instance: RabbitMQ;
  private connection!: Connection;
  private channel!: Channel;
  private readonly url: string;

  private constructor() {
    this.url = process.env.RABBITMQ_URL || "amqp://localhost";
  }

  public static async getInstance(): Promise<RabbitMQ> {
    if (!RabbitMQ.instance) {
      RabbitMQ.instance = new RabbitMQ();
      await RabbitMQ.instance.connect();
    }
    return RabbitMQ.instance;
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log("Connected to RabbitMQ");

      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed. Reconnecting...");
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on("error", (err) => {
        console.error("RabbitMQ error:", err);
      });
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  public async publish(queue: string, message: object): Promise<boolean> {
    if (!this.channel) throw new Error("RabbitMQ channel is not initialized");

    await this.channel.assertQueue(queue, { durable: true });
    const sent = this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    return sent;
  }

  public async consume(queue: string, callback: (msg: any) => void): Promise<void> {
    if (!this.channel) throw new Error("RabbitMQ channel is not initialized");

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (msg) => {
      if (msg) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }
}

export default RabbitMQ;
