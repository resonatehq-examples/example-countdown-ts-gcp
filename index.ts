import { Resonate } from "@resonatehq/gcp";
import type { Context } from "@resonatehq/sdk";

const resonate = new Resonate({ verbose: true });

async function notify(_ctx: Context, url: string, msg: string) {
	await fetch(url, {
		method: "POST",
		body: msg,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}

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

resonate.register("countdown", countdown);

export const handler = resonate.handlerHttp();
