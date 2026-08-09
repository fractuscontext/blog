---
title: "DSA basics: What is Time Complexity & RA Machine"
date: 2026-03-13 21:00:00
author: '@fractuscontext'
reuse: "CC BY-SA"
tags: []
---

To measure code speed, we compare our actual code's operation count to a simplified reference "ruler".

| Function | What it is | Example |
| :--- | :--- | :--- |
| $f(n)$ | **Your actual function** (exact operations in your code) | $3n^2 + 2n + 5$ |
| $g(n)$ | **The reference function** (simplified "ruler") | $n^2$ |

## The 5 Bound Types

This notation tells you how **$f(n)$** and **$g(n)$** compare asymptotically as the input size ($n$) approaches infinity.

| Bound Type | Notation | Plain English | Analogy | Limit ($n \to \infty$) |
| :--- | :--- | :--- | :--- | :--- |
| **Strict Upper** | $o(g(n))$ | $f$ grows **strictly slower** than $g$ | $<$ | $= 0$ |
| **Upper** | $O(g(n))$ | $f$ grows **no faster** than $g$ | $\le$ | Constant or $0$ |
| **Tight** | $\Theta(g(n))$ | $f$ and $g$ have the **same growth rate** | $\approx$ | Positive constant |
| **Lower** | $\Omega(g(n))$ | $f$ grows **at least as fast** as $g$ | $\ge$ | Positive constant or $\infty$ |
| **Strict Lower** | $\omega(g(n))$ | $f$ grows **strictly faster** than $g$ | $>$ | $= \infty$ |

## Mathematical Definition

In computer science, we use two anchor points to prove these bounds:

* **$c$ (The Multiplier):** A fixed positive constant used to scale the reference function.
* **$n_0$ (The Threshold):** The point on a graph beyond which the inequality holds for all $n \ge n_0$.

## The Five Rules of Growth

### 1. Big O ($O$): The Ceiling (Upper Bound)

* **The Rule:** $f(n) \le c \cdot g(n)$ for some $c > 0$ and all $n \ge n_0$.
* **Meaning:** Growth stays *at or below* the reference curve (Worst-case ceiling).

### 2. Big Omega ($\Omega$): The Floor (Lower Bound)

* **The Rule:** $f(n) \ge c \cdot g(n)$ for some $c > 0$ and all $n \ge n_0$.
* **Meaning:** Growth stays *at or above* the reference curve (Best-case floor).

### 3. Big Theta ($\Theta$): The Sandwich (Tight Bound)

* **The Rule:** $c_1 \cdot g(n) \le f(n) \le c_2 \cdot g(n)$ for constants $c_1, c_2 > 0$ and all $n \ge n_0$.
* **Meaning:** $f(n)$ is asymptotically bounded above and below by the same curve.

### 4. Little o ($o$): Strictly Under

* **The Rule:** $f(n) < c \cdot g(n)$ for *all* $c > 0$ and sufficiently large $n$.
* **Meaning:** $f(n)$ grows strictly slower than $g(n)$ (i.e., $g(n)$ dominates completely).

### 5. Little omega ($\omega$): Strictly Over

* **The Rule:** $f(n) > c \cdot g(n)$ for *all* $c > 0$ and sufficiently large $n$.
* **Meaning:** $f(n)$ grows strictly faster than $g(n)$ (i.e., $f(n)$ dominates completely).

## Proof via Limits

To evaluate these asymptotic bounds using calculus, compare the ratio of the functions as $n \to \infty$

* i.e. $f(n) = 3n^2 + 5n + 10$ becomes $n^2$

### Tight Bound: $\Theta(g(n))$

This is the "exact" growth rate.

$$\lim_{n \to \infty} \frac{f(n)}{g(n)} = C \quad (0 < C < \infty)$$

* **Result:** $3n^2 + 5n = \Theta(n^2)$ because $\lim_{n \to \infty} \frac{3n^2 + 5n}{n^2} = 3$, which is a positive constant.

### Upper Bound: $O(g(n))$

This is the "ceiling." $f(n)$ grows no faster than $g(n)$.

$$\lim_{n \to \infty} \frac{f(n)}{g(n)} = C \quad (0 \le C < \infty)$$

* **Result:** $3n^2 = O(n^2)$ and $3n^2 = O(n^3)$ because the limits evaluate to $3$ and $0$, respectively.

### Lower Bound: $\Omega(g(n))$

This is the "floor." $f(n)$ grows at least as fast as $g(n)$.

$$\lim_{n \to \infty} \frac{f(n)}{g(n)} > 0 \quad (\text{positive constant or } \infty)$$

* **Result:** For $f(n) = 3n^2$, both $\Omega(n^2)$ and $\Omega(n)$ are valid because the limits evaluate to $3$ and $\infty$, respectively.

### Strict Upper Bound: $o(g(n))$

This is a "loose ceiling." $g(n)$ must eventually grow strictly faster than $f(n)$.

$$\lim_{n \to \infty} \frac{f(n)}{g(n)} = 0$$

* **Result:** $3n^2 = o(n^3)$ because the limit evaluates to $0$.

### Strict Lower Bound: $\omega(g(n))$

This is a "loose floor." $g(n)$ must be strictly slower than $f(n)$.

$$\lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty$$

* **Result:** $3n^2 = \omega(n)$ because the limit evaluates to $\infty$.

### What about "$O(1)$" (Constant Time)

When $g(n) = 1$, the operation count **does not depend on the input size ($n$)**.

* **$\Theta(1)$ (Exact Constant):** The algorithm always takes a constant number of operations (e.g., accessing an array element by index: `arr[0]`).
* **$O(1)$ (Constant Ceiling):** The algorithm takes *at most* a constant amount of time.
* **$\Omega(1)$ (Constant Floor):** The algorithm takes *at least* some constant amount of time. *(Since any executed instruction requires non-zero time, $\Omega(1)$ is a trivial lower bound for almost every program).*

## Examples

| Function $f(n)$ | Tight Bound $\Theta$ | Valid Upper $O$ | Valid Lower $\Omega$ | Strict Upper $o$ | Strict Lower $\omega$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **$5n + 3$** | **$\Theta(n)$** | $O(n^2)$ | $\Omega(1)$ | $o(n^2)$ | $\omega(1)$ |
| **$3n^2 + 2n$** | **$\Theta(n^2)$** | $O(n^3)$ | $\Omega(n)$ | $o(n^3)$ | $\omega(n)$ |
| **$7\log n$** | **$\Theta(\log n)$** | $O(n)$ | $\Omega(1)$ | $o(n)$ | $\omega(1)$ |
| **$2^n + n^3$** | **$\Theta(2^n)$** | $O(3^n)$ | $\Omega(n^3)$ | $o(3^n)$ | $\omega(n^3)$ |

## Asymptotically Incomparable Functions

Sometimes neither function bounds the other due to **oscillation**.

**Example:**

* Let $f(n) = n$
* Let $g(n) = n^{1 + \sin(n)}$

Because $\sin(n)$ oscillates continuously between $-1$ and $1$:

1. When $\sin(n) = -1$, $g(n) = n^0 = 1$, making $f(n)$ larger.
2. When $\sin(n) = 1$, $g(n) = n^2$, making $g(n)$ larger.

Since their relative order oscillates indefinitely as $n \to \infty$, $f(n)$ and $g(n)$ are **asymptotically incomparable**.

### Data-Dependent Bounds (No Single Tight Bound)

```cpp
for (int i = 0; i < n; i++) {
    if (arr[i] == target) {  // Data-dependent
        for (int j = 0; j < n; j++) {
            sum++;
        }
    }
}
```

* **Best Case ($\Omega(n)$):** Target is never found. The inner loop never executes; only the outer loop runs ($T_{\text{best}}(n) = \Theta(n)$).
* **Worst Case ($O(n^2)$):** Every element matches the target. The inner loop executes on every iteration ($T_{\text{worst}}(n) = \Theta(n^2)$).
* **Conclusion:** Without assumptions about the input data distribution, there is **no single $\Theta$ bound** describing the algorithm across all inputs.

## The RA Machine Architecture

The Random Access (RA) model is a theoretical abstraction bridging the gap between Turing machines and real silicon. Instead of a single sequential tape, the RA model provides an infinite array of discrete registers and an accumulator.

![Architecture Diagram](data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjAwIDQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8IS0tIFN0eWxlcyAtLT4KICA8c3R5bGU+CiAgICAuYm94IHsgZmlsbDogI2Y5ZjlmOTsgc3Ryb2tlOiAjMzMzOyBzdHJva2Utd2lkdGg6IDI7IH0KICAgIC5sYWJlbCB7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7IGZvbnQtc2l6ZTogMTRweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IGZpbGw6ICMzMzM7IHRleHQtYW5jaG9yOiBtaWRkbGU7IH0KICAgIC5zdWItbGFiZWwgeyBmb250LWZhbWlseTogbW9ub3NwYWNlOyBmb250LXNpemU6IDEycHg7IGZpbGw6ICM2NjY7IHRleHQtYW5jaG9yOiBtaWRkbGU7IH0KICAgIC5hcnJvdyB7IHN0cm9rZTogIzMzMzsgc3Ryb2tlLXdpZHRoOiAyOyBmaWxsOiBub25lOyB9CiAgICAuYXJyb3ctaGVhZCB7IGZpbGw6ICMzMzM7IH0KICAgIC5hY3Rpb24geyBmb250LWZhbWlseTogbW9ub3NwYWNlOyBmb250LXNpemU6IDExcHg7IGZpbGw6ICMwMDU2YjM7IGZvbnQtd2VpZ2h0OiBib2xkOyB9CiAgPC9zdHlsZT4KCiAgPCEtLSBEZWZpbml0aW9ucyBmb3IgYXJyb3doZWFkcyAtLT4KICA8ZGVmcz4KICAgIDxtYXJrZXIgaWQ9ImFycm93aGVhZCIgbWFya2VyV2lkdGg9IjEwIiBtYXJrZXJIZWlnaHQ9IjciIHJlZlg9IjAiIHJlZlk9IjMuNSIgb3JpZW50PSJhdXRvIj4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIwIDAsIDEwIDMuNSwgMCA3IiBjbGFzcz0iYXJyb3ctaGVhZCI+PC9wb2x5Z29uPgogICAgPC9tYXJrZXI+CiAgPC9kZWZzPgoKICA8IS0tIElucHV0IFRhcGUgLS0+CiAgPHJlY3QgeD0iMTUwIiB5PSIyMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSI0MCIgY2xhc3M9ImJveCI+PC9yZWN0PgogIDxsaW5lIHgxPSIxNTAiIHkxPSIyOCIgeDI9IjM1MCIgeTI9IjI4IiBzdHJva2U9IiMzMzMiIHN0cm9rZS1kYXNoYXJyYXk9IjQiPjwvbGluZT4KICA8dGV4dCB4PSIyNTAiIHk9IjQ1IiBjbGFzcz0ibGFiZWwiPklOUFVUIFRBUEU8L3RleHQ+CiAgCiAgPCEtLSBDUFUgLyBBTFUgLS0+CiAgPHJlY3QgeD0iNTAiIHk9IjEzMCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIxMDAiIGNsYXNzPSJib3giPjwvcmVjdD4KICA8dGV4dCB4PSIzMDAiIHk9IjE1NSIgY2xhc3M9ImxhYmVsIj5DUFUgLyBBTFU8L3RleHQ+CiAgPHJlY3QgeD0iODAiIHk9IjE3MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjOTk5Ij48L3JlY3Q+CiAgPHRleHQgeD0iMTcwIiB5PSIxOTAiIGNsYXNzPSJzdWItbGFiZWwiPlsgUHJvZ3JhbSBDb3VudGVyIChQQykgXTwvdGV4dD4KICA8cmVjdCB4PSIzNDAiIHk9IjE3MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjOTk5Ij48L3JlY3Q+CiAgPHRleHQgeD0iNDMwIiB5PSIxOTAiIGNsYXNzPSJzdWItbGFiZWwiPlsgQWNjdW11bGF0b3IgKHIwKSBdPC90ZXh0PgoKICA8IS0tIE1lbW9yeSAvIFJlZ2lzdGVycyAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMzIwIiB3aWR0aD0iMzUwIiBoZWlnaHQ9IjYwIiBjbGFzcz0iYm94Ij48L3JlY3Q+CiAgPHRleHQgeD0iMjI1IiB5PSIzNDUiIGNsYXNzPSJsYWJlbCI+TUVNT1JZIC8gUkVHSVNURVJTPC90ZXh0PgogIDx0ZXh0IHg9IjIyNSIgeT0iMzY1IiBjbGFzcz0ic3ViLWxhYmVsIj5yMSB8IHIyIHwgcjMgfCByNCB8IC4uLiB8IHJfaW5mPC90ZXh0PgoKICA8IS0tIE91dHB1dCBUYXBlIC0tPgogIDxyZWN0IHg9IjQzMCIgeT0iMzIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiBjbGFzcz0iYm94Ij48L3JlY3Q+CiAgPHRleHQgeD0iNDkwIiB5PSIzNDUiIGNsYXNzPSJsYWJlbCI+T1VUUFVUPC90ZXh0PgoKICA8IS0tIEZsb3cgTGluZXMgLS0+CiAgPCEtLSBJbnB1dCB0byBDUFUgLS0+CiAgPHBhdGggZD0iTSAzNTAsNDAgTCA1MDAsNDAgTCA1MDAsMTMwIiBjbGFzcz0iYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjYXJyb3doZWFkKSI+PC9wYXRoPgogIDx0ZXh0IHg9IjM2MCIgeT0iMzUiIGNsYXNzPSJhY3Rpb24iPlsgUkVBRCBdPC90ZXh0PgoKICA8IS0tIENQVSB0byBNZW1vcnkgKFN0b3JlKSAtLT4KICA8bGluZSB4MT0iMTUwIiB5MT0iMjMwIiB4Mj0iMTUwIiB5Mj0iMzIwIiBjbGFzcz0iYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjYXJyb3doZWFkKSI+PC9saW5lPgogIDx0ZXh0IHg9Ijg1IiB5PSIyNzUiIGNsYXNzPSJhY3Rpb24iPlsgU1RPUkUgXTwvdGV4dD4KICA8IS0tIE1lbW9yeSB0byBDUFUgKExvYWQpIC0tPgogIDxsaW5lIHgxPSIyNTAiIHkxPSIzMjAiIHgyPSIyNTAiIHkyPSIyMzAiIGNsYXNzPSJhcnJvdyIgbWFya2VyLWVuZD0idXJsKCNhcnJvd2hlYWQpIj48L2xpbmU+CiAgPHRleHQgeD0iMjU1IiB5PSIyNzUiIGNsYXNzPSJhY3Rpb24iPlsgTE9BRCBdPC90ZXh0PgoKICA8IS0tIENQVSB0byBPdXRwdXQgKFdyaXRlKSAtLT4KICA8bGluZSB4MT0iNDkwIiB5MT0iMjMwIiB4Mj0iNDkwIiB5Mj0iMzIwIiBjbGFzcz0iYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjYXJyb3doZWFkKSI+PC9saW5lPgogIDx0ZXh0IHg9IjUwMCIgeT0iMjc1IiBjbGFzcz0iYWN0aW9uIj5bIFdSSVRFIF08L3RleHQ+Cgo8L3N2Zz4=)

* **Accumulator (`r0`):** All arithmetic and logic operations occur here.
* **Registers (`r1` to $r_\infty$):** Memory cells holding arbitrarily large integers.
* **Input/Output Tapes:** Sequential read-only input and write-only output.

## The Instruction Set

*(Note: In the x86 mappings below, `eax` corresponds to Accumulator `r0`, and `ebx`/`esi` correspond to general registers).*

| RA Instruction | Operation | C++ Equivalent | x86 Assembly Equivalent |
| :--- | :--- | :--- | :--- |
| **`LOAD ri`** | `r0 ← ri` | `r0 = reg[i];` | `mov eax, ebx` |
| **`LOADI c`** | `r0 ← c` | `r0 = c;` | `mov eax, c` |
| **`LOAD *ri`** | `r0 ← reg[ri]` | `r0 = reg[reg[i]];` | `mov eax, dword ptr [esi]` |
| **`STORE ri`** | `ri ← r0` | `reg[i] = r0;` | `mov ebx, eax` |
| **`STORE *ri`** | `reg[ri] ← r0` | `reg[reg[i]] = r0;` | `mov dword ptr [esi], eax` |
| **`ADD ri`** | `r0 ← r0 + ri` | `r0 += reg[i];` | `add eax, ebx` |
| **`SUB ri`** | `r0 ← r0 - ri` | `r0 -= reg[i];` | `sub eax, ebx` |
| **`MULT ri`** | `r0 ← r0 * ri` | `r0 *= reg[i];` | `imul ebx` |
| **`DIV ri`** | `r0 ← r0 / ri` | `r0 /= reg[i];` | `idiv ebx` |
| **`INC ri`** | `ri ← ri + 1` | `reg[i]++;` | `inc ebx` |
| **`DEC ri`** | `ri ← ri - 1` | `reg[i]--;` | `dec ebx` |
| **`JUMP label`** | `pc ← label` | `goto label;` | `jmp label` |
| **`JUMPZ label`** | `if r0 == 0 jump` | `if (r0 == 0) goto label;` | `cmp eax, 0; je label` |
| **`JUMPP label`** | `if r0 > 0 jump` | `if (r0 > 0) goto label;` | `cmp eax, 0; jg label` |
| **`READ ri`** | `ri ← input` | `std::cin >> reg[i];` | *(Syscall)* |
| **`WRITE`** | `output ← r0` | `std::cout << r0;` | *(Syscall)* |
| **`HALT`** | Stop execution | `exit(0);` | `hlt` |

---

### Example 1: Iterative Summation (The N-Numbers Problem)

**The Problem:**

1. Read an integer $N$ from the input tape.
2. Sum $N$ sequential values starting at register `r100` (i.e., `r[100]` through `r[100 + N - 1]`).
3. Output the final sum to the tape.

**The Code Solution:**

```asm
READ r1      // Tape -> r1 (r1 holds counter N)
LOADI 100    // r0 = 100
STORE r2     // r2 = 100 (pointer to array elements)
LOADI 0      // r0 = 0
STORE r3     // r3 = 0 (running sum)

LOOP:
       LOAD r1      // Check loop counter
       JUMPZ FINISH // If N == 0, terminate loop

       LOAD *r2     // r0 = reg[r2] (dereference pointer)
       ADD r3       // r0 = reg[r2] + running_sum
       STORE r3     // running_sum = r0

       INC r2       // Advance memory pointer
       DEC r1       // Decrement counter N
       JUMP LOOP    // Next iteration

FINISH:
       LOAD r3      // Load total sum into Accumulator
       WRITE        // Output Accumulator to tape
       HALT
```

### Example 2: Pointer Indirection (Nested Lookup)

**The Problem:**

1. Read the base address $A$ of array `a` from the input tape.
2. Read index `i` from the input tape.
3. Array `a` is stored contiguously starting at register $A$ (`reg[A] = a[0]`, `reg[A+1] = a[1]`, etc.).
4. Compute `a[a[i]]` and write the result to the output tape.

*(Assume $A \ge 100$ to prevent collisions with working registers `r1`–`r4`).*

```text
INPUT TAPE:
[ Row 1: A ] <-- Tape Head (Base address)
[ Row 2: i ] <-- Index

MAIN MEMORY (Registers):
r1     : [ base address A ]
r2     : [ index i ]
r3     : [ pointer to a[i] ]
r4     : [ pointer to a[a[i]] ]
...
r[A]   : [ a[0] ]
r[A+1] : [ a[1] ]
```

And this is how we should it:

1. **Read inputs:** We need to pull `A` and `i` off the tape and store them in working registers (`r1` and `r2`).

2. **Find `a[i]`:** The memory address of `a[i]` is simply the base address plus the index (`A + i`). We calculate this, store the pointer in `r3`, and then use indirect loading (`LOAD *r3`) to get the actual value of `a[i]`.

3. **Find `a[a[i]]`:** Now we repeat the process. The memory address of `a[a[i]]` is the base address plus our newly found value (`A + a[i]`). We calculate this, store the pointer in `r4`, and indirectly load it to get our final answer.

**The Code Solution:**

```asm
READ r1      // r1 = A
READ r2      // r2 = i

LOAD r1      // r0 = A
ADD r2       // r0 = A + i
STORE r3     // r3 = A + i (pointer to a[i])

LOAD *r3     // r0 = a[i] (dereference first pointer)
ADD r1       // r0 = A + a[i] (address of a[a[i]])
STORE r4     // r4 = A + a[i]

LOAD *r4     // r0 = a[a[i]] (dereference second pointer)
WRITE        // Output result
HALT
```
