---
title: "Modern Concurrency is black magic btw"
description: "The Illusion of Free Concurrency: The Math, Memory, and Mechanics of M:N Threading"
date: 2026-08-25
draft: true
---

Every few months, a developer discovers lightweight concurrency, sees a benchmark showing **1,000,000 concurrent tasks**, and immediately asks:

> *"If I have 1,000 virtual threads doing heavy maths on a 2-core machine, how does the scheduler switch between them? Where does the listener/allocator thread live?"*

And shortly after writing a 5-line test with an infinite loop:

> *"Wait... why did my second thread never start and my entire server just freeze?"*

Every time I'm writing a FastAPI wrapper or diving into modern **Java (Project Loom / Virtual Threads)**, async feels like pure magic because I've never truly addressed the elephant in the room: **how does concurrency actually work under the hood?**

## It's 2005: The Boss-Worker Model

It's now 2005, the world first commercially, consumer-use multi-core cpu, Athlon 64 X2 has released. You are a programmer at Microsoft, leading a top-secret project called IIS for Project Longhorn, how do you prepare for the future?

To handle the incoming flood of network traffic without melting the server's operating system, you implement the classic **Boss-Worker thread pool** (often called the Listener + Dispatch pattern). Here is how you architect it:

1. **The Boss Thread (The Listener):** You dedicate exactly one thread purely to listening for incoming network connections. This thread does absolutely no heavy lifting. Its only job is to aggressively `accept()` incoming sockets and immediately toss them into a shared, synchronised queue.

2. **The Worker Threads (The Dispatch Pool):** Instead of spinning up a new thread for every single user, which would crush the OS with memory allocation and context-switching overhead: you pre-allocate a fixed pool of $N$ worker threads.

3. **The Handoff:** These $N$ workers sit in a continuous loop, eagerly monitoring the shared queue. When the Boss thread drops a new connection in, an idle Worker wakes up, grabs the socket, runs the business logic (parsing the request, reading from disk), sends the response, and then goes back to sleep, waiting for the next task.

```text
Incoming Sockets ──► [ Boss Thread ] ──► [ Shared Queue ]
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
               [ Worker Thread 1 ]     [ Worker Thread 2 ]     [ Worker Thread N ]
```

This was the gold standard for C++, C#, and Java for well over a decade.

But there was a fatal flaw in this architecture, **Blocking I/O**:

If you have a pool of 200 worker threads and all 200 make a database query that takes 500ms, waiting on a database to respond.

Then the Boss thread's queue overflows, new connections get dropped, and the server refuses traffic, even if your CPU cores are sitting at 0% utilisation.

## Java, Project Loom & Modern Threads

...but, wake up. Wake up, my friend. It's the dawn of a new day and you have things to do (and new concepts to learn)!
Prior to Java 21, concurrency in Java was strictly **1:1**: 1 Java `Thread` mapped directly to 1 OS kernel thread. If a thread blocked waiting on a database query or an HTTP response, an entire OS thread sat completely idle.

Project Loom (probably learned from Golang) decouples Java threads from OS kernel threads by introducing an **$M:N$ threading model**: millions of virtual threads ($M$) mapped across a small pool of carrier OS threads ($N$).

Now, what are the new *threads*? Specifically, what is the difference between a Platform Thread, a Carrier Thread, and a Virtual Thread in Java 21+? 🥺

```text
─────────────────────────────────────────────────────────────────────────
                        Virtual Thread (Loom)
    - User-mode thread managed entirely by the JVM runtime
    - Stored directly in Java heap memory (~1-2 KB dynamic call stack)
    - Millions can exist simultaneously without exhausting the OS
─────────────────────────────────────────────────────────────────────────
                                   │  Mounts onto during execution
                                   ▼
─────────────────────────────────────────────────────────────────────────
                            Carrier Thread
    - A standard OS Platform Thread running in a JVM ForkJoinPool
    - Executes the bytecodes of whichever virtual thread is mounted on it
    - Free to execute another virtual thread the moment the current one yields/unmounts
─────────────────────────────────────────────────────────────────────────
                                   │  Maps 1:1 to
                                   ▼
─────────────────────────────────────────────────────────────────────────
                        Platform Thread (OS)
    - Traditional Java Thread (`java.lang.Thread`)
    - 1:1 wrapper around an Operating System Kernel Thread
    - Managed directly by the OS kernel scheduler
    - Spawning 5,000 threads == allocating ~5–10 GB of fixed stack memory
─────────────────────────────────────────────────────────────────────────
```

### Life Without a Boss Thread

If you spawn 1,000 virtual threads on a 2-core machine (2 carrier threads), where do the remaining 998 threads live?

A common misconception is assuming there is still a dedicated **"Boss / Allocator Thread"** running in the background, handing out jobs: *"Hey Carrier 1, take task #42! Hey Carrier 2, take task #43!"*

**There is no Boss Thread.**

In Project Loom, the scheduler is a **`ForkJoinPool`** where the carrier threads operate autonomously using **Work-Stealing**:

```text
                        [ Incoming Tasks / Unparked Continuations ]
                                             │
                                             ▼
                         ┌──────────────────────────────────────┐
                         │     Global Submission Queue (FIFO)   │
                         └──────────────────────────────────────┘
                                      │            │
                                      ▼            ▼
               ┌───────────────────────────┐      ┌───────────────────────────┐
               │     Carrier Thread 0      │      │     Carrier Thread 1      │
               │  ┌─────────────────────┐  │      │  ┌─────────────────────┐  │
               │  │  Local Deque (LIFO) │  │◄────┐│  │  Local Deque (LIFO) │  │
               │  │ [VT-4] [VT-3] [VT-2]│  │     ││  │ [VT-7] [VT-6] [VT-5]│  │
               │  └─────────────────────┘  │     ││  └─────────────────────┘  │
               │   - Executing VT-1        │     ││   - Executing VT-8        │
               └───────────────────────────┘     │└───────────────────────────┘
                                                 │ (Work Stealing: Carrier 1
                                                 └─ pops from tail of Carrier 0)
```

### The Work-Stealing Lifecycle

1. **Global Queue:** Tasks spawned from outside the pool (like the `main` thread) land in the global FIFO queue.
2. **Local Deque:** When a virtual thread spawns *another* virtual thread, it pushes it into its own carrier's private double-ended queue (deque) to maximize CPU cache locality (L1/L2).
3. **Execution Order:** When a carrier finishes its task, it looks for work in this exact sequence:
   * **1.** Pop from its own **Local Deque** (LIFO for hot data cache).
   * **2.** Pop from the **Global Queue** (FIFO).
   * **3.** **Steal from another carrier's deque tail** (FIFO) if both above are empty.

### Mounting, Unmounting, and Continuations

* **Mounting:** A carrier pops a virtual thread continuation from the queue, swaps its stack pointer to the continuation's frame, and begins executing bytecode directly on the CPU.
* **Unmounting (Cooperative Yield):** When the virtual thread performs a blocking operation (`Socket.read()`, `Thread.sleep()`, `Lock.lock()`):
  1. The JDK runtime intercepts the call before it reaches the OS kernel.
  2. The virtual thread's call stack is copied to heap memory, and the continuation yields.
  3. The carrier thread is now instantly free to pick up the next virtual thread from the queue.
* **Resuming:** When the OS kernel signals via `epoll`/`kqueue`/`IOCP` that the network socket has bytes ready, the JVM unparks the continuation and drops it back into the `ForkJoinPool`. Any free carrier picks it up and resumes execution right where it left off.

### What About `while(true)`?

Because there is no external Boss Thread forcibly pulling threads off the CPU, virtual threads rely on **cooperative scheduling**. What happens when a virtual thread refuses to cooperate?

```java
public class PinningDemo {
    public static void main(String[] args) throws InterruptedException {
        int availableProcessors = Runtime.getRuntime().availableProcessors();
        String parallelismProp = System.getProperty("jdk.virtualThreadScheduler.parallelism", "default (all cores)");

        System.out.println("ℹ️  Available CPU Cores detected: " + availableProcessors);
        System.out.println("⚙️  Virtual Thread Scheduler Parallelism: " + parallelismProp);
        System.out.println("▶️  Main thread started.");

        // Thread 1: CPU-Bound task (no I/O, no sleep)
        Thread.startVirtualThread(() -> {
            System.out.println("😾 Thread 1 started (Infinite CPU Loop...)");
            while (true) {
                // Doing heavy math!
            }
        });

        // Give Thread 1 a tiny fraction of a millisecond to start
        Thread.sleep(100);

        // Thread 2: Lightweight task
        Thread.startVirtualThread(() -> {
            System.out.println("🐣 Thread 2 ran successfully!");
        });

        // Main thread waits 2 seconds then exits
        Thread.sleep(2000);
        System.out.println("🛑 Main thread exiting.");
    }
}
```

* **On a multi-core machine (e.g. 8 cores):** Thread 1 saturates Carrier 0. Carrier 1 picks up Thread 2 from the queue, executes it, and prints the output.
* **On a single-core runner (`-Djdk.virtualThreadScheduler.parallelism=1`):**
  * Thread 1 mounts to Carrier 0.
  * Because `while(true) {}` performs no I/O, no blocking locks, and no yields, **the continuation never unmounts**.
  * Carrier 0 is completely hijacked.
  * **Result:** **Thread 2 NEVER runs.** The queue is never checked again, and the process locks up indefinitely.

Virtual threads are not magic preemptive threads. If you run pure CPU-bound loops without yields, they will starve the carrier pool just like any traditional thread pool.

### The Economics of Scale

Why did the traditional 1:1 model collapse under modern web scale?

* $M$ = Number of concurrent tasks
* $N$ = Number of physical CPU cores (carrier threads)
* $S_{\text{OS}}$ = OS Thread fixed reserved stack size ($\approx 1\text{ MB}$ to $2\text{ MB}$)
* $S_{\text{User}}$ = Dynamic user-space frame size on the heap ($\approx 1\text{ KB}$ to $2\text{ KB}$)

#### 1:1 Traditional OS Threads

$$\text{Memory Required} = M \times S_{\text{OS}}$$

For $M = 10,000$ active concurrent connections:
$$\text{Memory} = 10,000 \times 1\text{ MB} = \mathbf{10\text{ GB RAM}}$$
*(Just allocating empty thread stacks exhausts system RAM before any logic even executes).*

#### $M:N$ Virtual Threads (Loom / Go / BEAM)

$$\text{Memory Required} = (M \times S_{\text{User}}) + (N \times S_{\text{OS}})$$

For $M = 10,000$ connections on an $N = 4$ core server:
$$\text{Memory} = (10,000 \times 2\text{ KB}) + (4 \times 1\text{ MB}) \approx 20\text{ MB} + 4\text{ MB} = \mathbf{24\text{ MB RAM}}$$

$$\text{Memory Reduction} = \frac{10,000\text{ MB}}{24\text{ MB}} \approx \mathbf{416\times\text{ reduction in memory}}$$

### Little’s Law: The Limits of Concurrency

<details>
<summary><b>Click to expand: The Math of Throughput & Latency</b></summary>

* **Little’s Law:** $L = \lambda \times W$
  *(where $L$ = concurrent tasks $M$, $\lambda$ = throughput req/sec, $W$ = average task duration / latency)*
* **Latency Composition:** $W = T_{\text{CPU}} + T_{\text{I/O}}$
* **CPU Duty Cycle ($\alpha$):** $\alpha = \frac{T_{\text{CPU}}}{W}$ *(the fraction of time a task actually spends calculating on the CPU)*
* **Max Concurrency Limit ($M_{\text{max}}$):** $M_{\text{max}} = \frac{N}{\alpha} = N \times \frac{W}{T_{\text{CPU}}}$ *(for $N$ CPU cores)*
* **Max Throughput Limit ($\lambda_{\text{max}}$):** $\lambda_{\text{max}} = \frac{N}{T_{\text{CPU}}}$

**When I/O-Bound Workloads ($\alpha \ll 1$)**

* Tasks spend almost all their time waiting on the network or database ($T_{\text{I/O}} \gg T_{\text{CPU}}$), making $\alpha$ tiny (e.g., $\alpha = 0.005$).
* **Result:** High multiplexing capacity. A few carrier threads ($N$) can easily juggle hundreds of thousands of virtual tasks ($M \gg N$) by context-switching during I/O waits.

**CPU-Bound Workloads ($\alpha = 1.0$)**

* Pure compute tasks have zero I/O wait ($T_{\text{I/O}} = 0 \implies W = T_{\text{CPU}} \implies \alpha = 1.0$).
* **Result:** Capacity strictly collapses to hardware limits ($M_{\text{max}} = N$). Spawning $1,000,000$ virtual threads on a 4-core machine does not make the math run faster: it just adds scheduling overhead while excess tasks starve in queues.

</details>

## Python & FastAPI: The Single-Threaded Illusion of "Async"

A common trap for developers coming to Python is assuming that slapping `async` on a function magically creates a background thread or runs tasks in parallel.

**It does not.**

In Python's `asyncio` (and ASGI frameworks like FastAPI / Starlette / Uvicorn), there is **no parallelism**. The entire engine runs on a **single OS thread** executing an **Event Loop** (just like Arduino).

```text
        ┌─────────────────────────────────────────────────────────┐
        │                  Asyncio Event Loop                     │
        │               (Strictly 1 OS Worker Thread)             │
        └─────────────────────────────────────────────────────────┘
                       │                           │
          Ready Queue  │                           │ epoll / kqueue Selector
                       ▼                           ▼
            ┌──────────────────────┐    ┌───────────────────────────┐
            │ Coroutine A          │    │ Coroutine B               │
            │ (Executing Bytecode) │    │ (Waiting on OS Socket)    │
            └──────────────────────┘    └───────────────────────────┘
```

### How Cooperative Multitasking Works

1. Exactly **one line of Python bytecode** executes at any given moment.
2. When Coroutine A hits an explicit `await` expression (e.g., `await client.get(...)` or `await asyncio.sleep(1)`), it **voluntarily yields control** back to the event loop.
3. The event loop registers the socket descriptor with the OS kernel (`epoll`/`kqueue`), grabs the next task from the ready queue, and runs it until *that* task reaches an `await`.
4. If a coroutine **never yields** (e.g., parsing a 200MB JSON string, calculating primes, or calling synchronous `time.sleep()`), **the event loop stops dead, freezing the entire server for all connected clients.**

### How FastAPI Handles `def` vs `async def`

Because running synchronous blocking code directly on the event loop causes catastrophic outages, FastAPI splits handlers into two distinct execution strategies:

```python
import time
import asyncio
from fastapi import FastAPI

app = FastAPI()

# 1. Standard synchronous endpoint (`def`):
# FastAPI detects standard `def` and automatically offloads execution
# to an internal AnyIO background worker thread pool.
@app.post("/upload-sync")
def upload_sync(data: bytes):
    time.sleep(2)  # SAFE: Blocks one worker thread, event loop stays responsive.
    return {"status": "ok"}


# 2. Asynchronous endpoint (`async def`):
# Runs DIRECTLY on the single-threaded Event Loop!
@app.post("/upload-async")
async def upload_async(data: bytes):
    # ❌ DANGER: Blocking code here freezes the entire server process.
    # time.sleep(2) or heavy_crypto_calc() -> Zero other requests can be handled!

    # ✅ CORRECT: Voluntarily yields control back to the event loop.
    await asyncio.sleep(2)
    return {"status": "ok"}
```

In Python, `async` does not mean *"run this in the background."* It means *"I promise to periodically yield this single CPU thread while I am waiting on I/O."*

### What About Python 3.13+ Free Threading (PEP 703)?

```text
  Traditional CPython (with GIL)             Free-Threaded CPython (No-GIL)
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│ Thread 1 ──► [ GIL Mutex ]      │        │ Thread 1 ──────► [ Core 0 ]     │
│ Thread 2 ──► (Waiting on GIL)   │        │ Thread 2 ──────► [ Core 1 ]     │
│ Thread 3 ──► (Waiting on GIL)   │        │ Thread 3 ──────► [ Core 2 ]     │
└─────────────────────────────────┘        └─────────────────────────────────┘
  Only 1 thread executes bytecode            True hardware parallelism across
      at any given nanosecond                    all physical CPU cores
```

For three decades, the **Global Interpreter Lock (GIL)** ensured that standard Python threads could never execute bytecode in parallel across multiple CPU cores—forcing developers to rely on heavy, IPC-based `multiprocessing` (serializing state over pipes via `pickle`).

With **PEP 703 (Free-threaded Python 3.13+)**, the GIL can be disabled (`python3.13t` / `--disable-gil`). Standard `threading.Thread` instances can finally achieve true multi-core hardware parallelism, bridging the gap between Python's high-level ergonomics and bare-metal multi-threaded performance.
