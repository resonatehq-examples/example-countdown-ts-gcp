# Countdown on Google Cloud Functions

A Countdown powered by Resonate and Google Cloud Functions. The Countdown, sends periodic notifications to [ntfy.sh](https://ntfy.sh).

## How It Works

This example demonstrates how a countdown can be implemented with Resonate's Distributed Async/Await using a naive for loop. On `yield ctx.sleep` the countdown function suspends, immediatelly completing the Google Cloud Function execution. After the specified sleep duration, Resonate will resume the countdown function by starting a new Google Cloud Function execution.

```typescript
export function* countdown(
	ctx: Context,
	count: number,
	delay: number,
	url: string,
) {
	for (let i = count; i > 0; i--) {
		// send notification to ntfy.sh
		yield* ctx.run(notify, url, `Countdown: ${i}`);
		// sleep results in a suspension point causing
		// the Google Cloud Function execution to terminate
		yield* ctx.sleep(delay * 60 * 1000);
	}
	// send the last notification to ntfy.sh
	yield* ctx.run(notify, url, `Done`);
}
```

**Key Concepts:**
- **Suspension:** Executions can be paused for given number of time via `ctx.sleep`

---

## Installation & Usage

### 1. Start Resonate server

You can install Resonate with [Homebrew](https://docs.resonatehq.io/operate/run-server#install-with-homebrew) or download the latest release from [Github](https://github.com/resonatehq/resonate/releases)

```
resonate dev
```

### 2. Clone the repository

```
git clone https://github.com/resonatehq-examples/example-countdown-ts-gcp
cd example-countdown-ts-gcp
```

### 3. Install dependencies

```
npm install
```

### 4. Run the Google Cloud Function locally

```
npm run dev
```

### 5. Invoke the countdown function

```
resonate invoke <promiseId> --func countdown --arg 5 --arg 1 --arg https://ntfy.sh/<workspace> --target <functionUrl>
```

Example

```
resonate invoke foo.1 --func countdown --arg 5 --arg 1 --arg https://ntfy.sh/resonatehq-$RANDOM --target http://localhost:8080
```

### 5. Visit the url printed

```
Countdown <promiseId>: https://ntfy.sh/resonatehq-<number>
```

Example

```
Countdown foo.1: https://ntfy.sh/resonatehq-22012
```

## Troubleshooting

If everything is configured correctly, you will see notifications poping up at the ntfy.sh workspace you set on the url

![ntfy logo](assets/ntfy.png)

If you are still having trouble, please open an issue on the [GitHub repository](https://github.com/resonatehq-examples/example-countdown-ts-gcp/issues).
