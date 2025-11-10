import type { Request, Response } from "@google-cloud/functions-framework";
import { Resonate } from "@resonatehq/gcp";
import type { Context } from "@resonatehq/sdk";

const resonate = new Resonate();

export function* countdown(
	ctx: Context,
	count: number,
	delay: number,
	url: string,
) {
	yield* ctx.run(() => {
		console.log(`Countdown ${ctx.id}: ${url}`);
	});

	for (let i = count; i > 0; i--) {
		// send notification to ntfy.sh
		yield* ctx.run(notify, url, `Countdown: ${i}`);
		// sleep
		yield* ctx.sleep(delay * 60 * 1000);
	}
	// send the last notification to ntfy.sh
	yield* ctx.run(notify, url, `Done`);
}

async function notify(_ctx: Context, url: string, msg: string) {
	await fetch(url, {
		method: "POST",
		body: msg,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}

resonate.register("countdown", countdown);

export const handler = async (req: Request, res: Response) => {
	const start = Date.now();
	res.on("finish", () => {
		console.log(`Execution '${req.body.task.id}': ${Date.now() - start}ms`);
	});
	return resonate.handlerHttp()(req, res);
};
