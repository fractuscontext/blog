---
title: "Jack of All Trades, Master of None"
description: "Why building software in general feels soul-draining in the post-LLM era"
date: 2026-11-09
draft: false
---

This week I've been having existential dread. It's the very last teaching week of semester 2, and looking back, I'd say I'm a jack of all trades, master of none.

There is a lot I want to say here, and my brain will keep jumping between sections while I write. I'll try to keep the jumps in order this time.

## Purpose versus target

People keep saying you should learn for fun and you shouldn't set a target for yourself, and I get it. The thing is, the difference is between purpose and target: what you want to build versus what you will build. Purpose and target are two sides of the same coin. It's also easy to conflate target and purpose.

People say a target kills joy. Let's take an inappropriate analogy here: for a trans woman, thinking about voice training can kill the joy, because the voice is a target she has to reach. For a femboy, the same voice practice doesn't make "him" dread anything, because the voice is play, not a target.

As a software engineering student, I find homelabbing and DevOps more fun than the usual side projects. That isn't traditional, since most programmers find building silly stuff like [porting Doom into a PDF](https://github.com/ading2210/doompdf) or building snake games more enjoyable.

For example, I have a project where I [build Wine on macOS using Nix](https://github.com/fractuscontext/nix-macOS_Wine_builds), because there are no Wine builds for macOS in nixpkgs and I'm afraid of supply chain attacks in community binaries. It's quite a fun project, because I learned how to deal with build systems, like runtime dependencies and Justfiles, along the way.

One problem was making the binaries portable. With Nix, the runtime libraries are hard-linked to `/nix/store/`, so I needed a program that acts as dylibbundler but works for Nix.

Writing that bundler was also the first time my theoretical DSA knowledge came into real use, beyond superficial LeetCode questions. I originally wrote the bundler in Python, but Nix deps are far more complicated than in normal package managers. On paper the deps form a simple DAG, but mind you, the actual linking resolves through `lib1 -> lib2 inode link -> actual lib2 -> lib3 inode link`.

I first learned C99 and Python 3.6 back in 2016, and I've always preferred Python because of its "toy" nature. For this project, though, Go turned out to be the better tool because it provides `debug/macho` out of the box, so I recently learned Go just for this project.

I was quite impressed by how similar Go's syntax is to Python's. The dread and "procrastination" come from overengineering, overthinking how to structure the code, and agonising over learning Go the "traditional non-AI way", the way I learned Python back then. The port has stalled indefinitely because of that dread.

### Where the joy went

The fun from programming (and writing in general) comes from a sweet spot where tiredness and fulfilment balance, and sadly, you need motivation before doing anything.

The problem is that you start something because you "saw" the big picture of what you can create and you crave the dopamine hit of something new, but during the process you forget the purpose. You end up asking AI to wrap the work up for you, and eventually you end up asking AI what the purpose was in the first place.

Writing code or writing an article isn't like "I need to finish cleaning dishes" or "I need to finish this assignment", so strategies for the [doorway effect](https://en.wikipedia.org/wiki/Event_perception#Relation_to_episodic_memory) don't work here. You see, the purpose of coding also isn't necessarily "re-implementing something", and writing isn't necessarily "writing cheatsheets for C++ syntax" or "retrospectives for what we can do better next sprint".

Coding and writing are much like creating a game. Not having a fixed purpose is one of the reasons [Daikatana was that bad](https://www.pcgamer.com/the-history-of-ion-storm/) (a mid-development engine switch, five lead programmers, and no clear hierarchy), and why [FFXV took 10 years](https://en.wikipedia.org/wiki/Development_of_Final_Fantasy_XV). Yet not having a fixed purpose is also what made NieR Replicant great: it started as a Drakengard sequel, and [Yoko Taro's team treated it as an experiment](https://automaton-media.com/en/news/nier-series-producer-declined-to-work-on-super-famous-existing-series-to-make-the-first-nier-game/) they never expected to be a hit. It's the flip side of the coin.

## A society of delivery

Ever since AI was invented, we've been living in a society of delivery. Every 40 days we get an [MCP-batteries-included LaTeX editor](https://x.com/AyakaAteliers/status/2118872551925649817), a new [Typst editor (as of Nov 2026)](https://web.archive.org/web/20261107154421/https://days-since-last-typst-editor.samake.se/), and I don't know what the point of all those editors is. Developers [pushed nearly 7.4 billion commits](https://web.archive.org/web/20261029121056/https://www.tomshardware.com/software/github-report-highlights-massive-influx-of-ai-generated-code-sixfold-increase-in-activity-over-one-year-required-extra-4-million-cpu-cores-and-160pb-of-storage/), and I'm not sure how many of those commits anybody needed.

Ironically, most of them are frontend editors for LaTeX that still rely on LuaLaTeX and TeX Live under the hood. The truly impressive thing shouldn't be someone reinventing a LaTeX wrapper; it should be somebody writing a parser that works out which packages a LaTeX document is using and feeds them back to Nix, so I don't have to hardcode them into `texliveSmall.withPackages` on my Nix derivation.

It's much like when I published a new package on CTAN ([user-persona](https://ctan.org/pkg/user-persona?lang=en)) to help people (future me) write user personas, which is not yet in nixpkgs or old TeX Live releases. Or much like Tectonic, except the CDN for Tectonic went down two weeks ago.

- What people think AI slop is: AI posters, Will Smith eating spaghetti, Midjourney art.

- AI slop according to tech YouTubers: "Hello, today we're gonna look at this slop project trying to reverse-engineer Adobe Photoshop using Claude AI." At least that project has code, and the code builds. Yes, the quality is bad, but bad quality is just bad engineering, not slop... until it is abandoned.

- Slop IRL: [watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover), an "app" that is at heart an agent skill: a prompt asking AI to remove the AI watermark from your text, wrapped around scripts that are mostly regex. I find it hard to believe the repo has 26K stars.

At the same time, the impressiveness of AI breaks the minds of developers. I was working on an assignment for a concurrent video player that stacks effects. During testing, I obviously needed characterisation tests on every run to ensure the behaviour of the new codebase remained identical to the old one. The path of least resistance would have been to download a Shrek trailer from The Pirate Bay and calculate the hash. The AI instead suggested that I create a JShell script to emit a tiny test video using `FFmpegFrameRecorder`.

AI is quite impressive here because I don't think any human would have thought of that. I think we are living in an era where AI is becoming the senior dev and students are becoming the junior dev, not the other way around.

Even before LLMs were widely used, people in 2023 were already saying [the internet isn't fun anymore](https://web.archive.org/web/20231010032842/https://www.newyorker.com/culture/infinite-scroll/why-the-internet-isnt-fun-anymore). In terms of content, Web 1.0 (and early Web 2.0) was about expressing yourself (or Broadcast Yourself): GeoCities websites, Annoying Orange.

Today, it seems to be a problem of "delivery": content used to exist because someone had something to express, and now content exists to be delivered. One obvious example is MrBeast, whose channel we all know is [engineered around retention metrics](https://web.archive.org/web/20250304014547/https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/), and the videos [don't even make money themselves](https://web.archive.org/web/20250321051727/https://fortune.com/2025/03/11/youtube-biggest-star-mrbeast-makes-more-money-chocolate-videos); they're the pipeline that sells the chocolate. They aren't there to say anything; the purpose of each video is to keep the (monetisation/fake productivity) pipeline running.

I don't like the word "LARP", but ever since TikTok became a thing, its use has exploded. We also live in an upside-down world where advocates, indie hackers, and scientists with actual passion get called "LARPers" for everything they say, while actual LARPers become Key Opinion Leaders, much like a bully I know who somehow rebranded as a thought leader for gym content and an advocate for sexual abuse survivors.

## AI and writing

AI also kills the joy in writing when you are neurodivergent: you have a lot to say because your brain keeps jumping between sections, much like how I'm writing this right now (going from the coin paragraph to dylib, to the internet being less fun, to how I learned programming, to AI sucking the joy out of writing).

While that messy nonlinear jumping indeed makes writing interesting and authentic, I think AI-assisted writing can keep it, while entirely AI-generated writing obviously cannot.

I spent 3 hours writing this; without AI, it would have taken 8 hours, since organising scattered sentences into one coherent paragraph and expanding text to avoid slippery slopes are hard [(some research supports this)](https://journals.sagepub.com/doi/full/10.24384/rbe3-k236).

A "second brain" sounds cringe, and it is cringe in practice, because you get nothing out of it except flashy interconnected nodes, a TikTok larping video, and an over-engineered grocery list [(from video: second brain cringelords by Eric Morrison)](https://www.youtube.com/watch?v=6NukGtwJb7Y). You burn tokens for useless stuff, and it [actively works against your brain](https://arxiv.org/abs/2506.08872), since [actively recalling and reflecting on what you know](https://doi.org/10.1111/j.1467-9280.2006.01693.x) is what makes memories stick, and [offloading it all to a vault](https://www.science.org/doi/10.1126/science.1207745) skips exactly that.

The thing here is we definitely want to work with our brain, not work against it. Instead of a second brain, you can record your own raw rants, set up a simple RAG to query them, and write a long, not-very-necessary reflection on why you thought that way later (just like this article). If you need a grocery list, you just need a grocery list, not a "second brain".

## Where AI actually impressed me

Last week was the very first week I actually tried MCP.

I'd been quite impressed by all these "using Claude to create animation" products:

- The good ones: [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)
- The bad ones: slop clones of Fern [(from video: The Death of Educational Content on YouTube)](https://www.youtube.com/watch?v=-Gnrp_caPvo)

Regardless of what people made, I was quite impressed and shocked.

Back then, I didn't use MCP because setting up all that stuff sounded tedious. Just think about all these fancy words: MCP, Harness, Hermes agent, Skills. In hindsight, those words are full of crap; they're literally just prompts and JSON-RPC.

The straw that broke the camel's back was not having enough time to finish an assignment that needed a [wireframe](https://frame0.app), which finally forced me to try [MCP](https://web.archive.org/web/20260307021612/https://docs.frame0.app/ai-assistant/). Seeing Claude Code directly control the OS and apps was genuinely impressive, and also scary, considering Claude Code can write directly to your filesystem via a Node.js CJS script.

Controlling the UI is impressive because, as we all know, LLMs render images in tiles, and Claude wasn't natively multimodal back then (it is now). Even today, Claude Opus still has a hard time recognising Choromatsu, the monkey from the Sony Walkman ad, if online search is disabled.

## The race, and its hard limits

Every single race towards AI is simultaneously a race to the top and a race to the bottom. The race to the top means putting as much training data and compute into it as possible (Claude); the race to the bottom means spending as little as possible to train or deploy it (DeepSeek), which technically is doing the same thing from different perspectives.

Either way, it is going to hit a hard wall within a few years, both computationally and sociologically.

The computational hard limit is the easiest problem to spot, best summed up by that recent Sam Altman quote everyone memed on:

> "From a global allocation perspective, actually, it's quite terrible to have everybody, like, have a bunch of the world's limited supply of DRAM sitting in their own computer. And being used five percent of the time."

The sociological hard limit is the one I actually want to talk about. AI is trained on human data, and mind you, 44% of Australians aged 15 to 74 read at literacy Level 2 or below (a low level), while 38% read at Level 3 ([ABS PIAAC 2011-12](https://www.abs.gov.au/statistics/people/education/programme-international-assessment-adult-competencies-australia/latest-release)).

Those literacy numbers somewhat explain what happened when I asked Claude to write me an email disputing a room cleanliness claim. The first line Claude output was "I deny your claim", followed by "I've completed [responsibilities] with meticulous attention", and then it kept vomiting statutes.

Ironically, "most" statutes were correctly referenced. Whether or not you're a law major (which I'm not), the more statutes you cite, the more likely you are to misrepresent one. Yet the email missed the one thing that needs no law degree: propositional logic.

Most humans conflate "I deny your claim" with "Your claim isn't sufficient, and I note and disagree with what you have said", and an AI trained on human writing seemed to behaviour-match what most panicked renters or TV dramas would say.

## Still a lot to talk about

This article was titled this way because I originally wanted to talk about why building software has been so soul-draining for me lately, and what I would be doing now if I hadn't picked Software Engineering in the first place. Psychology? Sociology? Law?

There is a lot more to talk about. Again, as I mentioned earlier, I spent about 3.5 hours writing this article. I wrote every single sentence, and AI's sole role was to cut and reorder them into something coherent.

I can't believe that back then I had to do all of this by myself. Maybe the difference is the whole point: AI-assisted writing keeps the messy jumps that make the writing mine, while entirely AI-generated writing can't.
