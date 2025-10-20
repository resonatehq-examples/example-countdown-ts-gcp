# Countdown Workflow with Resonate + Google Cloud Functions

This project demonstrates how to build a **long-running, resumable workflow** using [Resonate](https://resonatehq.io/) deployed on **Google Cloud Functions (GCF)**.

The example workflow (`countdown`) sends periodic notifications to a given URL (e.g. [ntfy.sh](https://ntfy.sh)) at a defined interval, fully managed by the **Resonate Server**, which handles workflow state, suspension, and resumption across function invocations.

---

## Overview

Traditional serverless functions are **ephemeral** — they can’t persist state or pause execution between steps.
**Resonate** introduces a lightweight event loop that allows you to write **generator-based workflows** which can be:

* **Suspended** during sleeps or awaits
* **Resumed** later from the exact point of suspension
* **Distributed** across many short-lived function invocations

In this project:

* The `countdown` function sends notifications every `delay` minutes.
* After each notification, it suspends (`ctx.sleep`).
* The **Resonate Server** resumes it later by invoking the function again via HTTP.

---

## 🧩 Architecture

```
┌────────────────────────────┐
│   Resonate CLI / Client    │
│  resonate invoke countdown │
└─────────────┬──────────────┘
              │
              ▼
┌──────────────────────────────┐
│      Resonate Server         │
│  - Manages workflow state    │
│  - Suspends & resumes flows  │
│  - Invokes Cloud Functions   │
└─────────────┬───────────────┘
              │
              ▼
┌──────────────────────────────┐
│  Google Cloud Function       │
│  - Registers “countdown”     │
│  - Executes workflow logic   │
│  - Reports progress to URL   │
└─────────────┬───────────────┘
              │
              ▼
┌──────────────────────────────┐
│ External Service (ntfy.sh)   │
│ Receives notifications       │
└──────────────────────────────┘
```

---

## Requirements

### 1. **Resonate Server**

You need a single running instance of the **Resonate Server**.
It acts as the orchestrator and must be network-accessible by your Cloud Function.

You can deploy it on **Google Cloud Run** for managed scalability.

---

### 2. **Google Cloud Function**

#### Required environment

* **Runtime:** Node.js 20+
* **Entrypoint:** `handler`
* **Dependencies:**

  ```bash
  npm install @resonatehq/gcp
  ```

Make sure your function’s URL is publicly reachable by the Resonate Server.

---

## 🚀 Triggering the Workflow

Once both components are deployed (Resonate Server and Cloud Function), you can start the workflow using the **Resonate CLI**.

Example:

```bash
resonate invoke <promise-id> \
  --func countdown \
  --arg 5 \
  --arg 1 \
  --arg https://ntfy.sh/resonatehq \
  --server <url-hosting-the-server> \
  --target <url-for-google-cloud-function>
```

### Explanation of parameters:

* `--func countdown` → The workflow name registered in your Cloud Function.
* `--arg 5` → Countdown starting number.
* `--arg 1` → Delay between notifications (in minutes).
* `--arg https://ntfy.sh/resonatehq` → Target URL to send notifications to.
* `--server ...` → The public URL of your Resonate Server instance.
* `--target ...` → The public URL of your deployed Cloud Function.

---

## 🧩 Workflow Logic

The core workflow (`countdown`) looks like this:

```ts
export function* countdown(ctx: Context, count: number, delay: number, url: string) {
  for (let i = count; i > 0; i--) {
    // Send notification to ntfy.sh
    yield* ctx.run(notify, url, `Countdown: ${i}`);
    // Suspend workflow for N minutes
    yield* ctx.sleep(delay * 60 * 1000);
  }
  // Final notification
  yield* ctx.run(notify, url, `Done`);
}
```

Each `yield*` point suspends execution, allowing the Resonate Server to persist and later resume the workflow seamlessly.
