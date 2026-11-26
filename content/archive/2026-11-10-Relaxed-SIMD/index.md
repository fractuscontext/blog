---
title: "Probing CPU & real UA via Relaxed SIMD & Service Worker"
author:
  name: "Claire Tam"
  url: "/about/"
description: "How Service Worker & WASM reveal a spoofed user agent and the CPU architecture when Canvas and WebGL are turned off."
date: 2026-11-10
lastmod: 2026-11-24
draft: false
reuse: "MIT"
tags: [privacy, demo]
---

 This demo probes your OS and CPU using only WASM relaxed SIMD and Service Workers...

No OpenGL or HTML5 Canvas needed (handy for a product download page that picks the right build by default).

On my end, I run LibreWolf with Canvas/WebGL off and [User-Agent Switcher](https://github.com/ray-lothian/UserAgent-Switcher), yet pages served from a service worker [don't get the UA override](https://github.com/ray-lothian/UserAgent-Switcher/issues/274) leaked my real UA, and Relaxed SIMD/FMA leaking CPU Model. [(See here)](#example-of-leaking)

This [post](https://web.archive.org/web/20260518211919/https://blog.azerpas.com/writing/wasm-simd-fingerprinting/) explains how WASM SIMD CPU timing probes can actually fingerprint users. Ad companies and retailers can misuse the same trick to treat visitors differently, for example, [quoting shoppers different prices](https://web.archive.org/web/20170504234313/http://www.cbs46.com/story/27923981/cbs-investigates-online-shopping-disparities).

## Probe Results

<p>
  <button id="reload">Reload page if SW is not populated</button>
  <button id="download-zip">Get the probe scripts (.zip)</button>
  <span id="download-status"></span>
</p>

<table border="1" cellpadding="4" cellspacing="0">
  <!-- Filled by render(); the status rows below stay in place across re-renders. -->
  <tbody id="results"></tbody>
  <tbody>
    <tr><th align="left">Service worker</th><td id="status" colspan="3">Checking...</td></tr>
    <tr><th align="left">Service worker probe</th><td id="probe-status" colspan="3">Waiting...</td></tr>
  </tbody>
</table>

## Example of leaking

LibreWolf on an Apple Silicon Mac, with User-Agent Switcher set to pose as Chrome on Linux. The page itself sees the spoofed values, but the service worker and the WASM probe do not:

![Probe results table. Client Hints and the page's navigator both report the spoofed identity: Chrome 154 on Linux x86_64, platform "Linux amd64", architecture x86, 64-bit. The service worker column reports the real user agent, Firefox 158 on "Intel Mac OS X 10.15", platform "MacIntel", both marked "differs". Both report 8 CPU cores. The hardware column, measured through WASM relaxed SIMD, reports architecture ARM, FMA yes, relaxed SIMD yes, CPU "ARM (AArch64)".](./macos-librewolf.png "LibreWolf with a spoofed Chrome/Linux UA: the service worker leaks Firefox on macOS, and relaxed SIMD reveals an ARM CPU")

The service worker leaks the real browser and OS (Firefox 158, macOS), and relaxed SIMD shows the CPU is ARM rather than x86. Firefox's UA says "Intel Mac" even on Apple Silicon, so the hardware probe is the only thing that reveals the real chip.

<script src="avx-probe.js"></script>
<script src="probe-ui.js"></script>
<script src="download.js"></script>
