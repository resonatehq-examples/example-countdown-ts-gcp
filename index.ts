import { Resonate } from "@resonatehq/gcp";
import type { Context } from "@resonatehq/sdk";

const resonate = new Resonate({ verbose: true });

function* factorial(ctx: Context, n: number): Generator<any, number, any> {
	if (n <= 1) {
		return 1;
	}
	return n * (yield ctx.rpc("factorial", n - 1));
}

resonate.register("factorial", factorial);

export const handler = resonate.handlerHttp();
