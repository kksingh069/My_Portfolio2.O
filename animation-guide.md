# Premium Scroll Animation Guide
### For AI Agents — Awwwards / Godly Level Motion Craft

> **Stack used in this project:** GSAP + ScrollTrigger + Lenis + Next.js (App Router) + Framer Motion  
> **Goal:** Replicate the cinematic, zero-flicker, scroll-driven animations seen on award-winning websites.

---

## Table of Contents

1. [The Mental Model — How Pro Sites Think About Scroll](#1-the-mental-model)
2. [The Anti-Flicker Rules — Why Animations Flash and How to Stop It](#2-the-anti-flicker-rules)
3. [Smooth Scroll Foundation — Lenis + GSAP Sync](#3-smooth-scroll-foundation)
4. [Parallax — The Right Way](#4-parallax-the-right-way)
5. [On-Scroll Reveal Patterns](#5-on-scroll-reveal-patterns)
6. [Text Animation Systems](#6-text-animation-systems)
7. [Expansion & Scale Animations](#7-expansion--scale-animations)
8. [Pinned Scroll Storytelling Sections](#8-pinned-scroll-storytelling-sections)
9. [Stagger Choreography](#9-stagger-choreography)
10. [Section Transition System](#10-section-transition-system)
11. [Performance Rules — Keeping 60 FPS](#11-performance-rules)
12. [Component-Level Patterns for This Project](#12-component-level-patterns-for-this-project)
13. [Easing Reference Cheatsheet](#13-easing-reference-cheatsheet)

---

## 1. The Mental Model

### How Pro Sites Think About Scroll

Award-winning sites treat the scroll position as a **timeline scrubber**, not a trigger for one-shot events.

```
Scroll position 0% ────────────────────── 100%
                 │                           │
                 ▼                           ▼
         Section enters                Section exits
         (start animation)             (end/reverse)
```

Every element on screen has a **scroll range** it belongs to. The animation's progress is **directly tied to how far into that range the user has scrolled** — this is called **scrubbing**. It feels physically accurate because it IS physically accurate.

**The three layers of a pro scroll system:**

| Layer | Tool | What It Does |
|-------|------|-------------|
| Inertia / Momentum | Lenis | Adds weight and smoothness to native scroll |
| Scroll-to-Animation Mapping | GSAP ScrollTrigger | Maps scroll position to animation progress |
| Animation Execution | GSAP tweens / Framer Motion | Performs the actual property changes |

**Key insight:** The user never sees "an animation play". They see the page *responding to their body*. That is the difference between a template and an Awwwards site.

---

## 2. The Anti-Flicker Rules

> Flickering is the #1 sign of amateur animation. Here is why it happens and how to stop it permanently.

### Why Flickering Happens

**Cause 1: FOUC (Flash of Unstyled Content)**  
Elements appear in their final animated state for 1 frame before GSAP sets the initial state.

**Cause 2: Layout Shift on Load**  
Fonts load late, images resize, the page reflowing mid-animation.

**Cause 3: Wrong Layer Promotion**  
Animating `width`, `height`, `top`, `left` instead of `transform` triggers layout recalculation every frame.

**Cause 4: ScrollTrigger fires before Lenis is ready**  
Native scroll position ≠ Lenis virtual scroll position.

**Cause 5: React Strict Mode double-mount**  
In dev, effects run twice, creating duplicate ScrollTrigger instances.

---

### The Anti-Flicker Checklist

#### Rule 1: Set initial states BEFORE paint using `gsap.set()`

```jsx
// ✅ CORRECT — runs synchronously before browser paints
useLayoutEffect(() => {
  gsap.set(".my-element", { autoAlpha: 0, y: 60 });
  // Now create the ScrollTrigger that reveals it
}, []);

// ❌ WRONG — useEffect runs after paint, causing a 1-frame flash
useEffect(() => {
  gsap.set(".my-element", { autoAlpha: 0, y: 60 });
}, []);
```

**Always use `useLayoutEffect` for GSAP setup in Next.js client components.**

#### Rule 2: Use `autoAlpha` not `opacity` + `visibility`

`autoAlpha` is a GSAP shorthand that sets both `opacity: 0` and `visibility: hidden` together.  
When `autoAlpha` reaches 0, the element becomes `visibility: hidden` — removing it from pointer events and preventing sub-pixel rendering artifacts.

```js
// ✅ Use this
gsap.set(el, { autoAlpha: 0 });
gsap.to(el, { autoAlpha: 1 });

// ❌ Avoid this alone — leaves invisible element in pointer flow
gsap.set(el, { opacity: 0 });
```

#### Rule 3: Only animate GPU-accelerated properties

```
✅ GPU (compositor thread — no layout, no paint):
   transform: translateX/Y/Z, scaleX/Y, rotate, skewX/Y
   opacity
   filter: blur() (with will-change)
   clip-path (most modern browsers)

❌ CPU (triggers layout recalculation every frame = jank):
   width, height, top, left, right, bottom
   margin, padding
   border-width
   font-size
```

```js
// ✅ Correct parallax
gsap.to(el, { y: -100 }); // uses transform: translateY

// ❌ Causes layout thrash
gsap.to(el, { top: -100 }); // triggers layout recalculation
```

#### Rule 4: Promote animated layers with `will-change`

```css
/* Apply ONLY to elements that will animate */
.parallax-layer,
.reveal-element,
.pinned-section {
  will-change: transform;
}

/* Remove after animation completes */
/* GSAP does this automatically when you set willChange: "auto" at end */
```

> **Warning:** Do NOT apply `will-change: transform` to everything. It forces the GPU to hold those textures in VRAM, which can cause more jank on low-end devices. Only apply it to elements actively being animated.

#### Rule 5: ScrollTrigger must sync with Lenis

```jsx
// In your SmoothScroll.jsx or similar setup file:
useEffect(() => {
  const lenis = new Lenis({
    wrapper: document.getElementById('smooth-wrapper'),
    content: document.getElementById('smooth-content'),
    smooth: 1.5,
  });

  // THIS IS CRITICAL — Lenis must drive ScrollTrigger's scroll position
  lenis.on('scroll', ScrollTrigger.update);

  // Also tell GSAP ticker to run Lenis each frame
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0); // Prevent GSAP from skipping frames

  ScrollTrigger.refresh();

  return () => lenis.destroy();
}, []);
```

#### Rule 6: Wrap all GSAP code in `gsap.context()` and clean up

```jsx
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // All ScrollTrigger and tweens here
    gsap.from(".element", {
      scrollTrigger: { trigger: ".element", start: "top 80%" },
      y: 60,
      autoAlpha: 0,
    });
  }, sectionRef); // scoped to this component's DOM

  return () => ctx.revert(); // Kills all tweens + triggers on unmount
}, []);
```

This prevents ScrollTrigger instances from leaking between React re-renders.

#### Rule 7: Always call `ScrollTrigger.refresh()` after dynamic content loads

```jsx
useLayoutEffect(() => {
  // After fonts load, images load, dynamic content renders:
  const id = setTimeout(() => ScrollTrigger.refresh(), 200);
  return () => clearTimeout(id);
}, []);
```

---

## 3. Smooth Scroll Foundation

### Lenis Setup (Project-Specific)

This project uses `ScrollSmoother` from GSAP (GSAPs premium smooth scroller). The `SmoothScroll.jsx` already wraps `#smooth-wrapper` / `#smooth-content`. Always put sections inside this wrapper.

```jsx
// SmoothScroll.jsx (already set up in this project)
const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,       // Higher = more inertia / more cinematic
  effects: true,     // Enables data-speed and data-lag attributes
  smoothTouch: 0.1,  // Slight smoothing on touch (don't go too high)
});
```

### Using `data-speed` for Effortless Parallax

When `effects: true` is set on ScrollSmoother, you get **zero-code parallax** via HTML attributes:

```jsx
// data-speed="0.8" = moves at 80% of scroll speed (lags behind = goes up slower)
// data-speed="1.2" = moves at 120% of scroll speed (leads ahead = goes up faster)
// data-speed="auto" = GSAP calculates perfect parallax automatically

<div data-speed="0.8">
  <img src="/food.jpg" />  {/* Image parallaxes naturally */}
</div>

<h2 data-speed="0.9">Headline</h2>   {/* Text moves slightly slower than scroll */}
<p data-speed="1.1">Description</p>  {/* Text moves slightly faster than scroll */}
```

### Using `data-lag` for Inertia / Delayed Following

```jsx
// data-lag="0.3" = element follows scroll position with 0.3s delay
// Creates the "floating" feel seen on luxury sites

<div data-lag="0.2" className="floating-card">
  {/* This card will slightly trail behind scroll with a lazy, premium feel */}
</div>
```

---

## 4. Parallax — The Right Way

### Layer-Based Parallax (The Depth Illusion)

The core principle: **elements closer to the viewer move faster, elements further away move slower.**

```
Fast  ←──── Foreground elements (data-speed="1.3")
Medium ←──── Main content     (data-speed="1.0")
Slow  ←──── Background image  (data-speed="0.6")
Slowest ←── Background color / gradient (data-speed="0.3")
```

### Manual Parallax with ScrollTrigger

For precise control over parallax:

```jsx
useLayoutEffect(() => {
  const ctx = gsap.context(() => {

    // Background image parallax — moves up at 30% of scroll speed
    gsap.to(".hero-bg-image", {
      yPercent: -30, // moves up by 30% of its own height
      ease: "none",  // LINEAR easing is mandatory for scrub parallax
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,   // Ties animation to scroll position directly
      },
    });

    // Foreground text moves up faster (deeper parallax = more immersion)
    gsap.to(".hero-headline", {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

  }, sectionRef);

  return () => ctx.revert();
}, []);
```

### `scrub` Values Explained

```js
scrub: true      // Instant — animation tracks scroll 1:1 (feels mechanical)
scrub: 0.5       // 0.5s lag — feels slightly smooth
scrub: 1.5       // 1.5s lag — feels cinematic and weighted ← USE THIS
scrub: 3         // 3s lag — very floaty, use only for background elements
```

> **Rule:** Background elements = `scrub: 2-3`. Foreground content = `scrub: 1-1.5`. Never use `scrub: true` (no smoothing) for visible elements.

### Image Parallax Without Overflow Issues

Images that parallax must have their container set to `overflow: hidden`:

```jsx
<div className="image-container" style={{ overflow: 'hidden', height: '500px' }}>
  {/* Image is taller than its container, and parallaxes within it */}
  <img
    src="/food.jpg"
    className="parallax-image"
    style={{ height: '130%', width: '100%', objectFit: 'cover' }}
  />
</div>
```

```js
// GSAP translates the image within the overflow:hidden container
gsap.to(".parallax-image", {
  yPercent: -15,
  ease: "none",
  scrollTrigger: {
    trigger: ".image-container",
    start: "top bottom",
    end: "bottom top",
    scrub: 1.5,
  },
});
```

---

## 5. On-Scroll Reveal Patterns

### Pattern 1: Fade Up (Most Common)

The standard Awwwards reveal. Content fades in while rising from below.

```js
gsap.from(".reveal-element", {
  y: 80,           // Starts 80px below final position
  autoAlpha: 0,    // Starts invisible
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".reveal-element",
    start: "top 85%",   // Triggers when element top is at 85% of viewport
    end: "top 50%",
    // No scrub — this plays as a timed animation, not scroll-linked
    once: true,         // Only plays once (no replay on scroll back)
  },
});
```

### Pattern 2: Clip Reveal (Used on Godly Sites)

Content appears to "wipe in" from a clipping mask. Very premium.

```css
/* CSS */
.clip-reveal-wrapper {
  overflow: hidden;
}
.clip-reveal-inner {
  will-change: transform;
}
```

```js
// JS — inner element slides up into visibility through the overflow:hidden parent
gsap.from(".clip-reveal-inner", {
  yPercent: 105,     // Starts fully below the overflow:hidden container
  duration: 1.4,
  ease: "power4.out",
  scrollTrigger: {
    trigger: ".clip-reveal-wrapper",
    start: "top 88%",
    once: true,
  },
});
```

### Pattern 3: Horizontal Slide-In

For cards, images, or feature panels that slide in from a side.

```js
// From left
gsap.from(".slide-from-left", {
  x: -100,
  autoAlpha: 0,
  duration: 1.1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".slide-from-left", start: "top 80%", once: true },
});

// From right — use for alternating layouts
gsap.from(".slide-from-right", {
  x: 100,
  autoAlpha: 0,
  duration: 1.1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".slide-from-right", start: "top 80%", once: true },
});
```

### Pattern 4: Scale Reveal (Used on Luxury Product Sites)

Element starts slightly smaller and scales to 100%.

```js
gsap.from(".scale-reveal", {
  scale: 0.88,
  autoAlpha: 0,
  duration: 1.3,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".scale-reveal",
    start: "top 85%",
    once: true,
  },
});
```

### Pattern 5: Scrubbed Reveal (Scroll-Linked Entry)

The element's reveal is controlled exactly by scroll position — feels like the user is "pulling" it in.

```js
gsap.from(".scrubbed-reveal", {
  y: 60,
  autoAlpha: 0,
  ease: "none",   // Must be none for scrub
  scrollTrigger: {
    trigger: ".scrubbed-reveal",
    start: "top 90%",
    end: "top 55%",
    scrub: 1.5,
  },
});
```

---

## 6. Text Animation Systems

### Split-Text Line Reveals (The Awwwards Signature Move)

Each line of text appears to rise from behind a mask. This is the #1 technique on award sites.

```jsx
import SplitType from 'split-type'; // Already in package.json

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    const splitText = new SplitType(".animated-headline", {
      types: "lines,words",
      lineClass: "split-line",
    });

    // Each split-line acts as overflow:hidden container
    // Words/chars inside are the elements that animate

    gsap.from(splitText.lines, {
      yPercent: 110,         // Start below the line (hidden by overflow:hidden)
      autoAlpha: 0,
      stagger: 0.12,         // Each line staggers 120ms after the previous
      duration: 1.3,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".animated-headline",
        start: "top 82%",
        once: true,
      },
    });

  }, sectionRef);

  return () => ctx.revert();
}, []);
```

```css
/* Required CSS — each split line must clip its child */
.split-line {
  overflow: hidden;
  display: block;
}
```

### Character-by-Character Stagger

For hero statements, large single words. Very premium.

```js
const split = new SplitType(".hero-word", { types: "chars" });

gsap.from(split.chars, {
  yPercent: 120,
  autoAlpha: 0,
  stagger: 0.03,    // 30ms per character
  duration: 0.9,
  ease: "power3.out",
  delay: 0.3,
});
```

### Kinetic Horizontal Scrolling Text (Ticker)

Continuously scrolling text marquee — seen on luxury brands.

```js
// Infinite horizontal scroll — loops seamlessly
const text = document.querySelector(".marquee-track");
const totalWidth = text.scrollWidth;

gsap.to(".marquee-track", {
  x: -totalWidth / 2,   // Only half because content is duplicated
  duration: 20,
  ease: "none",
  repeat: -1,           // Infinite
});
```

---

## 7. Expansion & Scale Animations

### Pattern: Image Expands from Card to Fullscreen

Used on portfolio/gallery sites. A card image expands to fill the viewport on click/scroll.

```js
// On trigger (scroll or click):
gsap.to(".card-image", {
  width: "100vw",
  height: "100vh",
  borderRadius: 0,
  duration: 1.2,
  ease: "power4.inOut",
});
```

> **Note:** This uses `width`/`height` which causes layout. For true zero-jank expansion, use GSAP FLIP plugin instead (see below).

### GSAP FLIP — The Correct Way to Expand Elements

FLIP (First Last Invert Play) is how pro sites animate layout changes without triggering layout thrash.

```js
import { Flip } from "gsap/Flip";
gsap.registerPlugin(Flip);

// 1. Capture the FIRST state (element in card)
const state = Flip.getState(".card-image");

// 2. Change to the LAST state (element expanded, full-screen class applied)
element.classList.add("fullscreen");

// 3. FLIP handles the transition automatically — no width/height animation
Flip.from(state, {
  duration: 1.0,
  ease: "power4.inOut",
  scale: true,           // Use scale instead of width/height
  absolute: true,        // Keeps element in flow during animation
});
```

### Scroll-Linked Container Expansion

Container grows as you scroll into it — used on storytelling sections.

```js
gsap.to(".expanding-section", {
  width: "90vw",       // Use transform-based approach for performance
  // Better: use scaleX
  scrollTrigger: {
    trigger: ".expanding-section",
    start: "top 70%",
    end: "top 20%",
    scrub: 1.5,
  },
});

// ✅ Better — use scale instead of width for GPU acceleration:
gsap.fromTo(".expanding-section",
  { scaleX: 0.7, transformOrigin: "center center" },
  {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".expanding-section",
      start: "top 70%",
      end: "top 20%",
      scrub: 1.5,
    },
  }
);
```

### Perfectly Centered Fullscreen Expansion (The "Story Reveal")

When you want an image to start small in the center and expand to consume the entire screen **perfectly symmetrically** (without distorting or expanding faster on one axis than another):

**Do NOT use fixed `vh`/`vw` values.** Use a uniform percentage `clip-path: inset(%)`.

```css
.story-image-wrapper {
  position: absolute;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 10;
  
  /* Start with a perfectly proportioned crop (e.g., 35% off all sides) */
  /* This guarantees the initial box has the exact same aspect ratio as the screen */
  clip-path: inset(35%); 
  will-change: clip-path;
}

.story-image {
  width: 100%; height: 100%;
  object-fit: cover;
  transform: scale(1.1); /* Slight zoom for parallax effect */
  will-change: transform;
}
```

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".story-section",
    start: "top top",
    end: "+=150%",    // Pin duration
    scrub: 1.0,
    pin: true,
  },
});

// Since clip-path uses uniform percentages, it animates identically on X and Y axes
tl.to(".story-image-wrapper", {
  clipPath: "inset(0%)", // Opens fully
  ease: "none",
}, 0);

tl.to(".story-image", {
  scale: 1, // Settles to native size
  ease: "none",
}, 0);
```

### Border Radius Collapse on Scroll

Premium sites show cards with large border-radius that collapse to 0 as they enter.

```js
gsap.from(".premium-card", {
  borderRadius: "2rem",
  scale: 0.95,
  ease: "none",
  scrollTrigger: {
    trigger: ".premium-card",
    start: "top 85%",
    end: "top 30%",
    scrub: 1.5,
  },
});
```

---

## 8. Pinned Scroll Storytelling Sections

Pinning keeps a section **fixed on screen** while the user scrolls through a story. Used on Apple product pages, luxury brand sites.

### Basic Pin

```js
gsap.to(".storytelling-section", {
  scrollTrigger: {
    trigger: ".storytelling-section",
    start: "top top",
    end: "+=200%",   // Pin for 2x viewport height of scroll distance
    pin: true,
    anticipatePin: 1, // Prevents jump at pin start — ALWAYS include this
    scrub: 1,
  },
});
```

### Pinned Section with Timeline (Multiple Stages)

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".pinned-section",
    start: "top top",
    end: "+=300%",
    pin: true,
    anticipatePin: 1,
    scrub: 1.5,
  },
});

// Stage 1: First element appears
tl.from(".stage-1", { autoAlpha: 0, y: 60 });

// Stage 2: First element exits, second enters
tl.to(".stage-1", { autoAlpha: 0, y: -60 }, "+=0.3");
tl.from(".stage-2", { autoAlpha: 0, y: 60 }, "<");

// Stage 3: Text + image reveal together
tl.to(".stage-2", { autoAlpha: 0 }, "+=0.3");
tl.from(".stage-3", { autoAlpha: 0, scale: 0.9 }, "<");
```

### Horizontal Scroll Section (Pinned)

```js
const sections = gsap.utils.toArray(".horizontal-panel");

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-scroll-track",
    pin: true,
    anticipatePin: 1,
    scrub: 1,
    snap: 1 / (sections.length - 1), // Snap to each panel
    end: () => "+=" + document.querySelector(".horizontal-scroll-track").offsetWidth,
  },
});
```

---

## 9. Stagger Choreography

Stagger is the signature of premium sites — elements don't all appear at once, they cascade.

### Basic Grid Stagger

```js
gsap.from(".grid-item", {
  y: 60,
  autoAlpha: 0,
  duration: 1.0,
  stagger: {
    amount: 0.6,     // Total time spread across all elements = 600ms
    from: "start",   // "start", "end", "center", "random", "edges"
  },
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".grid-container",
    start: "top 80%",
    once: true,
  },
});
```

### From-Center Stagger (Premium Effect)

```js
gsap.from(".feature-cards", {
  y: 80,
  autoAlpha: 0,
  duration: 1.1,
  stagger: {
    amount: 0.8,
    from: "center",   // Cards closest to center appear first
  },
  ease: "power4.out",
  scrollTrigger: { trigger: ".features-section", start: "top 75%", once: true },
});
```

### Sequential Section Entry with Varying Delays

```js
const ctx = gsap.context(() => {
  // Label, number, title, body all enter in sequence
  const tl = gsap.timeline({
    scrollTrigger: { trigger: ".content-block", start: "top 80%", once: true },
  });

  tl.from(".block-label",  { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out" })
    .from(".block-number", { y: 50, autoAlpha: 0, duration: 0.9, ease: "power3.out" }, "-=0.5")
    .from(".block-title",  { y: 60, autoAlpha: 0, duration: 1.0, ease: "power4.out" }, "-=0.6")
    .from(".block-body",   { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, "-=0.5");
}, sectionRef);
```

---

## 10. Section Transition System

### How Top-5% Sites Handle Section Transitions

They never let a section just "be there". As sections scroll past, they either:
1. **Fade out** (opacity goes to 0 as bottom leaves viewport)
2. **Scale down** (subtly shrink as they exit)
3. **Blur out** (filter: blur increases as they scroll away)
4. **Slide out** (translate upward as next section pushes them)

### The Fade-Scale Exit (Already in This Project)

```js
// Already implemented in SectionReveal.jsx
gsap.to(section, {
  autoAlpha: 0,
  scrollTrigger: {
    trigger: section,
    start: "bottom 18%",
    end: "bottom -8%",
    scrub: 1.8,
  },
});
```

### Adding Scale to Exit (More Premium)

```js
gsap.to(section, {
  autoAlpha: 0,
  scale: 0.97,             // Subtle scale-down as it exits
  transformOrigin: "center top",
  scrollTrigger: {
    trigger: section,
    start: "bottom 20%",
    end: "bottom -5%",
    scrub: 1.5,
  },
});
```

### Overlapping Sections (The "data-parallax-exit" True Slide-Over)

To make a section perfectly pin in place and have the **next section physically slide over it**, use GSAP pinning with `pinSpacing: false`. 

We built this directly into `SectionReveal.jsx`. Simply add `data-parallax-exit="true"` to any `<section>` tag in the project!

```js
// Under the hood in SectionReveal.jsx:
const parallaxExits = gsap.utils.toArray("[data-parallax-exit='true']");
parallaxExits.forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: "top top",     // Pin exactly when it hits the top of the viewport
    end: "bottom top",    // Unpin after scrolling the height of the section
    pin: true,
    pinSpacing: false,    // Allows the NEXT section to naturally scroll over this one!
  });
});
```

**How to use it:**
```jsx
// Just add the attribute to ANY section!
<section className="my-cool-section" data-parallax-exit="true">
  <h1>I will fade and slide back while the next section covers me</h1>
</section>
```

---

## 11. Performance Rules

> The difference between 60fps and 20fps is the difference between premium and broken.

### Rule 1: Batch all ScrollTrigger.refresh() calls

```js
// ❌ Bad — causes multiple reflows
ScrollTrigger.refresh();
ScrollTrigger.refresh();
ScrollTrigger.refresh();

// ✅ Good — defer until after all DOM work is done
requestAnimationFrame(() => ScrollTrigger.refresh());
```

### Rule 2: Use `force3D: true` for elements that animate on scroll

```js
gsap.set(".parallax-element", { force3D: true });
// This forces the browser to promote the element to its own GPU layer immediately
```

### Rule 3: Avoid animating inside `requestAnimationFrame` manually

```js
// ❌ Bad — manual rAF + GSAP = double frame calculation
const animate = () => {
  gsap.set(el, { y: scrollY * 0.5 });
  requestAnimationFrame(animate);
};

// ✅ Good — let GSAP's ticker handle it
gsap.ticker.add(() => {
  gsap.set(el, { y: window.scrollY * 0.5 });
});
```

### Rule 4: Use `quickSetter` for high-frequency property updates

```js
// For cursor following, parallax driven by mousemove, etc.
const setX = gsap.quickSetter(".element", "x", "px");
const setY = gsap.quickSetter(".element", "y", "px");

// Now call setX/setY in mousemove — no per-frame tween overhead
document.addEventListener("mousemove", (e) => {
  setX(e.clientX);
  setY(e.clientY);
});
```

### Rule 5: Kill ScrollTrigger instances properly

```js
// In component cleanup:
return () => {
  ctx.revert();                    // Kills all GSAP in context
  ScrollTrigger.getAll().forEach(t => t.kill()); // Explicit kill if needed
};
```

### Rule 6: Lazy-initialize heavy animations

```js
// Only create ScrollTrigger when element is near viewport
// Use IntersectionObserver to gate GSAP initialization:
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      initAnimation(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: "200px" }); // 200px lookahead

document.querySelectorAll(".lazy-animate").forEach(el => observer.observe(el));
```

---

## 12. Component-Level Patterns for This Project

### Pattern: HeroSection

```
On page load (not scroll):
- Aurora/WebGL: immediate, already animating
- Headline words: slide up from mask, staggered, delay 0.5s
- Rule line: scaleX from 0 to 1, delay 1.4s

On scroll (hero → about transition):
- Hero section: parallax downward (yPercent: -20 on overlay)
- Hero background: parallax at 60% scroll speed
- Fade out: autoAlpha 0 as bottom of hero exits viewport
```

### Pattern: About Section

```
Trigger: top enters 85% of viewport

Enter sequence:
1. Arc SVG: strokeDashoffset animates (scrub: 1.5)
2. Liquid Ether background: already animating (no scroll dependency)
3. Headline lines: clip reveal stagger (each line rises from overflow:hidden)
4. Description paragraph: fade up, delay after headline

Exit:
- autoAlpha fades as section bottom leaves viewport (already in SectionReveal.jsx)
```

### Pattern: Menu / Gallery Section

```
Enter:
- Section title: split-text line reveal
- Cards: stagger from center, scale from 0.92 to 1
- Card images: internal parallax (image taller than card, moves at 0.8x scroll speed)

Hover (not scroll):
- Card scale: 1.02
- Image pan: slight y offset based on cursor position
- Overlay: opacity from 0 to 0.4

Exit:
- Section fades + slight scale-down (SectionReveal handles this)
```

### Pattern: Stat / Numbers Section

```
Enter:
- Number counter: countUp animation (GSAP from 0 to final number)
- Label: fade up after number starts counting

Technique:
gsap.from(numberEl, {
  textContent: 0,
  duration: 2,
  ease: "power2.out",
  snap: { textContent: 1 },  // Snaps to whole numbers
  scrollTrigger: { trigger: numberEl, start: "top 80%", once: true },
});
```

---

## 13. Easing Reference Cheatsheet

> Easing is the single most important factor in whether an animation feels premium or amateurish.

### GSAP Easing Guide for This Project

```
power1.out   → Very gentle ease-out. Use for subtle micro-animations.
power2.out   → Moderate ease-out. Use for small UI interactions (hover, toggles).
power3.out   → Strong ease-out. Use for most scroll reveals, text animations.
power4.out   → Very strong, dramatic ease-out. Use for hero elements, big reveals.
expo.out     → Extreme fast-then-slow. Use for premium kinetic text, fly-ins.

power3.inOut → Symmetrical cinematic. Use for scrubbed parallax transitions.
power4.inOut → Heavy, weighty. Use for pinned section transitions, FLIP animations.

none / linear → Zero easing. MANDATORY for scrub: animations (parallax, etc.)
```

### Custom Bezier Curves (Apple-Level Smoothness)

```js
// The "Apple ease" — used on iPhone product pages
ease: "cubic-bezier(0.77, 0, 0.175, 1)"

// The "Expo out" — for dramatic reveals
ease: "cubic-bezier(0.16, 1, 0.3, 1)"

// Cinematic, weighted — good for section entries
ease: "cubic-bezier(0.4, 0, 0.2, 1)"

// In GSAP:
ease: CustomEase.create("custom", "M0,0 C0.16,1 0.3,1 1,1")
```

### Duration Guidelines

```
Micro-interactions (hover):       0.2s – 0.4s
Element reveals (scroll):         0.8s – 1.4s
Section transitions:              1.0s – 1.6s
Hero / page-level animations:     1.2s – 2.0s
Pinned storytelling stages:       scrub-driven (no fixed duration)
```

> **Rule:** If an animation feels fast, halve the speed. If it feels slow, it probably isn't — wait 500ms more before judging. Award sites almost always run slower than you initially think is correct.

---

## Summary: The Anti-Flicker + Premium Checklist

Before shipping any animated section, verify:

- [ ] Initial states set in `useLayoutEffect` with `gsap.set()` (not `useEffect`)
- [ ] Using `autoAlpha` instead of just `opacity`
- [ ] Only animating `transform` and `opacity` (no width/height/top/left)
- [ ] `will-change: transform` applied to parallax and pinned elements only
- [ ] GSAP wrapped in `gsap.context()` with cleanup (`ctx.revert()`)
- [ ] `ScrollTrigger.refresh()` called after page fully loads
- [ ] Lenis/ScrollSmoother synced with ScrollTrigger via the scroll event
- [ ] Parallax using `ease: "none"` with `scrub`
- [ ] Non-scrubbed reveals using `ease: "power3.out"` to `"power4.out"`
- [ ] Images in parallax containers are taller than their `overflow:hidden` parents
- [ ] `anticipatePin: 1` on all pinned sections
- [ ] Stagger used for any group of 2+ elements that reveal together
- [ ] Durations are LONGER than your first instinct (1s+ for reveals)
- [ ] `once: true` on ScrollTrigger for elements that shouldn't re-animate
