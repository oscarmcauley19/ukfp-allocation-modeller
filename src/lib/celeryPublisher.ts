import amqp from "amqplib";
import { randomUUID } from "crypto";
import { config } from "../config/config";

/**
 * Very small helper to publish a Celery-compatible task message to RabbitMQ.
 *
 * NOTE: Celery's wire/protocol is not formally part of a public stable API;
 * this helper implements the minimal message shape observed for JSON-serialized
 * Celery tasks: publish to the `celery` exchange with routing key `celery`,
 * content-type `application/json` and headers containing the task name and id.
 *
 * This is intentionally minimal — it works for basic use-cases matching the
 * existing Python worker that registers `celery_app.run_simulation`.
 */

export async function publishTask(
  taskName: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {},
) {
  const connection = await amqp.connect(config.RABBITMQ_URL);
  try {
    const channel = await connection.createChannel();
    const exchange = "celery";
    await channel.assertExchange(exchange, "direct", { durable: true });

    const taskId = randomUUID();

    // Celery expects the body to be a JSON-serialized list: [args, kwargs]
    const body = Buffer.from(
      JSON.stringify({
        args,
        kwargs,
        callbacks: null,
        errbacks: null,
        chain: null,
        chord: null,
      }),
    );

    const options = {
      contentType: "application/json",
      contentEncoding: "utf-8",
      headers: {
        lang: "py",
        task: taskName,
        id: taskId,
        shadow: null,
        eta: null,
        expires: null,
        retries: 0,
        timelimit: [null, null],
        root_id: taskId,
        parent_id: null,
        argsrepr: JSON.stringify(args),
        kwargsrepr: JSON.stringify(kwargs),
        origin: "node",
      },
      persistent: true,
    } as amqp.Options.Publish;

    // routingKey 'celery' is the default used by kombu/Celery
    channel.publish(exchange, "celery", body, options);

    await channel.close();
    return taskId;
  } finally {
    await connection.close();
  }
}

export default publishTask;
