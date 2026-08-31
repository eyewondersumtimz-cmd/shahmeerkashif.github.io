# M. Shahmeer — Portfolio

A single-page portfolio site. No build step, no npm, no framework.
Upload the folder to any host and it works.

---

## Editing the content

**You only ever need to edit one file: `assets/js/data.js`.**

Everything on the page — your name, phone, email, services, projects,
process steps and tech list — comes from that file. Open it in any text
editor, change the text between the quotes, save, refresh.

### Change your email (do this first)

In `assets/js/data.js`:

```js
email: "mahadnoorr@gmail.com",   // <-- change to your business email
```

### Add a project

Copy an existing block in the `projects:` list and edit it:

```js
{ title: "Client Name",
  tag:   "E-commerce",          // the small red label
  year:  "2026",
  text:  "One or two sentences on what you built and why it mattered.",
  work:  ["Website", "SEO"],    // the little chips
  url:   "https://client.com",  // leave "" to hide the link
  img:   "" },                  // see below
```

### Add a project screenshot

1. Put the image in `assets/img/` (e.g. `assets/img/client.jpg`).
2. Set `img: "assets/img/client.jpg"` on that project.

Leave `img: ""` and the card draws a squared-paper tile with the client's
initial instead, so
the layout never looks broken while you are still collecting screenshots.
Resize screenshots to about **1200px wide** before adding them — full-size
phone photos will slow the page down.

---

## Deploying

Upload the **entire folder contents** to your host's `public_html`
(or a subfolder). That includes the hidden `.htaccess` file — in FileZilla
turn on *Server → Force showing hidden files* or you will miss it.

`.htaccess` switches on gzip compression and caching. Without it the 3D
library ships uncompressed at 654KB instead of about 165KB, so do not
skip it on an Apache host.

### If your edits do not show up

Browsers cache CSS and JS hard. Two things handle this:

1. `.htaccess` tells browsers to revalidate **your** files (`data.js`,
   `style.css`, `app.js`, `scene.js`) on every visit, while caching only
   the never-changing vendored libraries for a year. So re-uploading
   `data.js` takes effect immediately.
2. The asset links in `index.html` carry a version, e.g.
   `assets/js/data.js?v=6`. If you ever still see a stale version, bump
   every `?v=6` in `index.html` to `?v=7` and re-upload.

While editing locally, hard-refresh with **Ctrl+Shift+R** — a normal
refresh will happily serve you the old file.

---

## The theme

Squared maths-notebook paper. The grid is two repeating CSS gradients
(fine squares plus a heavier line every fifth), with a red margin rule
down the left. Cards are index cards with hard offset shadows, project
thumbnails get a strip of masking tape, and the availability card is a
sticky note.

**There is not a single `blur()` or `backdrop-filter` in the stylesheet,
deliberately.** The previous dark theme used three large blurred shapes
and a frosted header; those were the main cause of the lag. Repeating
gradients cost essentially nothing to draw by comparison.

To change the paper, edit these in `assets/css/style.css`:

```css
--paper:#fbfaf4;      /* page colour            */
--rule:#aab2bb;       /* grid lines             */
--rule-strong:#7c8792;/* every 5th line, darker */
--sq:38px;            /* square size (30px on mobile) */
--ink-blue:#2b4c8c; /* biro          */
--ink-red:#c23b3b;  /* red pen       */
```

---

## How the 3D behaves

The hero is a rotating wireframe solid, drawn like a geometry figure —
edges in biro, vertices marked in red. It is **lines only**: no particle
field, and no geometry is uploaded to the GPU per frame, only the
transform matrices change. That is what makes it cheap.

The device is measured before anything is drawn:

| Level  | Who gets it                                        | What runs                        |
|--------|----------------------------------------------------|----------------------------------|
| `high` | Desktop, 8GB+ RAM, 8+ cores                        | Solid + guide circle, full pixel ratio, antialiasing |
| `mid`  | Ordinary desktops and laptops                      | Same, lower pixel ratio          |
| `low`  | Phones, tablets, small screens, 2GB RAM, slow link | Solid only, no guide circle, pixel ratio capped at 1.5 |
| `off`  | No WebGL, broken GPU driver, reduced motion, Data Saver | CSS compass circles — **three.js is never downloaded** |

Things that keep it from lagging:

- **No smooth-scroll library on phones.** Lenis does not smooth touch
  scrolling anyway (that setting is off by default and unstable on older
  iOS), so on a touch device it would be an extra frame loop and a set of
  scroll listeners for nothing. Phones use native scrolling, which is
  already smooth. On phones the page also does no per-frame work at all
  while sitting still — it updates on the scroll event instead.


- **A watchdog measures real frame times.** Feature detection only guesses;
  this checks. If the measured rate stays under 24fps it steps down a
  level, and if the lowest level is still too slow it shuts the scene off
  and keeps the paper background. Nobody gets stuck on a stuttering page.
- Rendering **stops completely** when the hero scrolls out of view or the
  tab loses focus, so it never drains a phone battery in the background.
- Pixel ratio is capped, so a 3x phone screen does not render 9x the pixels.
- On desktop a single `requestAnimationFrame` loop drives both the smooth
  scroll and the 3D, so they can never disagree about the time.
- On the `off` tier the 654KB library is never requested at all —
  that load is about 77KB instead of about 690KB.

### Testing the levels

Add `?gfx=` to the URL to force a level on any machine:

- `index.html?gfx=high`
- `index.html?gfx=low`
- `index.html?gfx=off` ← check this one looks good, plenty of visitors get it

**Note for this machine:** your PC reports *Microsoft Basic Render Driver*,
meaning Windows has no working GPU driver and WebGL runs on the CPU. The
site correctly detects this and gives you the `off` tier. Forcing
`?gfx=high` there **will** be slow — that is the detection being right,
not a bug.

### Checking what it decided

Open the console (F12) and type:

```js
__scene()
```

It reports the tier, whether the scene is drawing, and the frame rate the
watchdog is currently measuring. Returns `undefined` on the `off` tier,
because nothing is running.

---

## If something is not working

**The 3D is not showing.** Open the browser console (F12). If `data-tier`
on the `<html>` element says `off`, the device was judged incapable — that
is intentional. Force it with `?gfx=high` to confirm the scene itself works.

**Content is invisible.** It should not be: entrance animations are scoped
to a `.js` class and there is a 2-second failsafe that reveals everything
if the scroll observer fails. If you ever see a blank section, check the
console for a JavaScript error.

**Smooth scrolling feels wrong.** Adjust `lerp` in `assets/js/app.js`
(`initScroll`). Lower is slower and floatier, higher is snappier.
`0.09` is the current value; `1` disables smoothing entirely.

---

## Files

```
index.html            page structure (rarely needs editing)
favicon.svg           tab icon
.htaccess             compression + caching — upload this
assets/css/style.css  all styling
assets/js/data.js     >>> YOUR CONTENT — edit this one <<<
assets/js/scene.js    3D hero + device tiering
assets/js/app.js      rendering, scroll, nav, form
assets/js/three.min.js  3D library (vendored, r160)
assets/js/lenis.min.js  smooth scroll (vendored, 1.3.26)
assets/js/lenis.css     required by lenis
```

Both libraries are **vendored** — copied into the project rather than
loaded from a CDN. The site cannot break because someone else's server
went down or changed a version.

### Credits

- [three.js](https://github.com/mrdoob/three.js) — MIT
- [Lenis](https://github.com/darkroomengineering/lenis) by darkroom.engineering — MIT
