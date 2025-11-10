# Countdown on Google Cloud Functions

A Countdown powered by Resonate and Google Cloud Functions. The Countdown, sends periodic notifications to [ntfy.sh](https://ntfy.sh).

## How It Works

This example demonstrates how Resonate's programming model enables our users to write dead simple code, that runs on serverless runtime.

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
		// sleep
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

### 4. Setup the Google Cloud Function locally

```
npm run build && npm run dev
```

### 5. Start the function execution

```
resonate invoke <promiseId> --func countdown --arg 5 --arg 1 --arg https://ntfy.sh/<workspace> --target <functionUrl>
```

Example

```
resonate invoke foo.1 --func countdown --arg 5 --arg 0.5 --arg https://ntfy.sh/resonatehq --target http://localhost:8080/
```

## Troubleshooting

If everything is configured correctly, you will see notifications poping up at the ntfy.sh workspace you set on the url

![ntfy logo](assets/ntfy.png)

If you are still having trouble, please open an issue on the [GitHub repository](https://github.com/resonatehq-examples/example-countdown-ts-gcp/issues).
