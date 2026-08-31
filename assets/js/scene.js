/* ============================================================
   scene.js — the hero's geometry diagram.

   Drawn like a figure in a maths notebook: a rotating wireframe
   solid in ink, with its vertices marked.

   Performance rules:
   1. Lines only. No particle field, and NOTHING is uploaded to
      the GPU per frame — the geometry is static and only the
      transform matrices change. That is the single biggest
      difference from a particle scene.
   2. Capability is measured, not assumed.
   3. A watchdog measures real frame times and downgrades itself
      if the device turns out slower than it claimed.
   4. Stop rendering the moment nobody is looking.
   ============================================================ */
(function () {
  "use strict";

  var host = document.getElementById("hero-canvas");
  if (!host) return;

  /* ---------- 1. what can this device actually handle? ---------- */
  function detectTier() {
    // Testing override: ?gfx=off|low|mid|high forces a level.
    var forced = (location.search.match(/[?&]gfx=(off|low|mid|high)\b/) || [])[1];
    if (forced) return forced;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return "off";

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) return "off";
    var slowLink = conn && /^(slow-)?2g$/.test(conn.effectiveType || "");

    var gl = null;
    try {
      var c = document.createElement("canvas");
      gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
    } catch (e) { return "off"; }
    if (!gl) return "off";

    // Software rasterisers report as WebGL but render on the CPU.
    // "Microsoft Basic Render Driver" is Windows' fallback when the GPU
    // driver is missing or broken — common, and painfully slow.
    var SOFTWARE = ["swiftshader", "llvmpipe", "software", "basic render", "warp", "generic renderer"];
    try {
      var dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) {
        var r = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();
        for (var k = 0; k < SOFTWARE.length; k++) {
          if (r.indexOf(SOFTWARE[k]) > -1) return "off";
        }
      }
    } catch (e) { /* blocked by privacy settings */ }

    var mem   = navigator.deviceMemory || 4;
    var cores = navigator.hardwareConcurrency || 4;
    var small = Math.min(window.innerWidth, window.innerHeight) < 700;
    var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    if (mem <= 2 || cores <= 2)     return "low";
    if (touch || small || slowLink) return "low";
    if (mem >= 8 && cores >= 8)     return "high";
    return "mid";
  }

  var TIER = "off";
  var renderer, scene, camera, world, solid, joints, guide;
  var running = false;

  /* Deliberately small numbers. A subdivided icosahedron at detail 2 is
     already 320 faces; the diagram reads better at detail 0-1 anyway. */
  /* detail stays at 0 everywhere: a 20-face icosahedron reads as a clean
     geometry figure, while detail 1 (80 faces) turns into a dense web that
     fights the headline for attention. Higher tiers spend their budget on
     resolution and the guide circle instead. */
  var CFG = {
    low:  { detail: 0, dpr: 1.5,  guide: false, aa: false },
    mid:  { detail: 0, dpr: 1.75, guide: true,  aa: true  },
    high: { detail: 0, dpr: 2,    guide: true,  aa: true  }
  };

  var INK  = 0x2b4c8c;   // blue biro
  var RED  = 0xc23b3b;   // red pen, for the marked vertices

  function start() {
    var cfg = CFG[TIER];

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: cfg.aa,
        powerPreference: "high-performance"
      });
    } catch (e) { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.dpr));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.z = 15;

    world = new THREE.Group();
    scene.add(world);

    // The solid, drawn as edges only — a geometry figure, not a shaded model.
    var geo = new THREE.IcosahedronGeometry(4.6, cfg.detail);
    solid = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.3 })
    );
    world.add(solid);

    // Vertices marked in red pen, the way you would label a diagram.
    joints = new THREE.Points(geo, new THREE.PointsMaterial({
      color: RED, size: 0.14, transparent: true, opacity: 0.5, depthWrite: false
    }));
    world.add(joints);

    // Faint construction circle, like a compass line left on the page.
    if (cfg.guide) {
      guide = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.Path().absarc(0, 0, 7.2, 0, Math.PI * 2).getSpacedPoints(72)
        ),
        new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.2 })
      );
      guide.rotation.x = Math.PI * 0.46;
      world.add(guide);
    }

    layout();
    running = true;
    host.classList.add("is-live");
  }

  /* Keep the figure out of the headline. On a wide screen it sits to the
     right, the way a worked diagram sits beside the writing. On a narrow
     screen there is nowhere to put it, so it centres and shrinks instead
     and the text simply sits over it. */
  function layout() {
    if (!world || !camera) return;
    var w = host.clientWidth, h = host.clientHeight;
    var wide = w > 1000, mid = w > 700;

    // Wide: beside the writing. Mid: pushed right and down, out of the
    // headline. Narrow: dropped below the text and faded well back, since
    // at that width the copy spans the full column and nothing can avoid it.
    world.position.x = wide ? 5.4 : (mid ? 3.8 : 1.2);
    world.position.y = wide ? 0.4 : (mid ? -1.4 : -3.2);

    var s = wide ? 1 : (mid ? 0.82 : 0.6);
    world.scale.setScalar(s);

    // Fade it back as the space gets tighter, so the text always wins.
    var fade = wide ? 1 : (mid ? 0.75 : 0.5);
    if (solid)  solid.material.opacity  = 0.30 * fade;
    if (joints) joints.material.opacity = 0.50 * fade;
    if (guide)  guide.material.opacity  = 0.20 * fade;

    // Pull the camera back on tall, narrow screens so the figure is not
    // cropped by the viewport edges. render() adds the scroll offset to
    // this base rather than setting z outright, or it would undo us.
    baseZ = 15 + (wide ? 0 : 3) + (h > w ? 2 : 0);
    camera.position.z = baseZ;
  }
  var baseZ = 15;

  /* ---------- input ---------- */
  var pointer = { x: 0, y: 0 }, target = { x: 0, y: 0 }, scrollProg = 0;

  if (!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)) {
    window.addEventListener("pointermove", function (e) {
      target.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  window.__setSceneScroll = function (p) { scrollProg = p || 0; };

  /* ---------- visibility ---------- */
  var visible = true, focused = !document.hidden;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    focused = !document.hidden;
    if (focused) { samples = 0; slowRuns = 0; }   // don't judge the device on a resume stutter
  });

  /* ---------- resize ---------- */
  var rt;
  function resize() {
    if (!renderer) return;
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CFG[TIER].dpr));
    renderer.setSize(w, h);
    layout();
  }
  function onResize() { clearTimeout(rt); rt = setTimeout(resize, 150); }

  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(host);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  window.addEventListener("load", resize);

  /* ---------- 2. the watchdog ----------
     Feature detection guesses; this measures. If real frame times are
     bad we step down a tier, and if the lowest tier is still bad we shut
     the scene off and keep the paper background. A visitor should never
     be stuck on a stuttering page just because their GPU lied. */
  var samples = 0, accum = 0, slowRuns = 0;
  var ORDER = ["high", "mid", "low"];

  /* The watchdog runs inside render(). It must never rebuild or dispose
     the renderer there — the rest of the frame would then be drawing
     against a disposed or freshly-replaced object. So it only raises a
     flag, which is applied at the top of the NEXT frame. */
  var pendingDowngrade = false;

  function downgrade() {
    var i = ORDER.indexOf(TIER);
    if (i > -1 && i < ORDER.length - 1) {
      TIER = ORDER[i + 1];
      document.documentElement.setAttribute("data-tier", TIER);
      teardown();
      start();
    } else {
      stopForGood();
    }
    samples = 0; accum = 0; slowRuns = 0;
  }

  function teardown() {
    running = false;
    if (!renderer) return;
    scene.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer = null;
  }

  function stopForGood() {
    teardown();
    TIER = "off";
    document.documentElement.setAttribute("data-tier", "off");
    host.classList.remove("is-live");
    window.__renderScene = null;
  }

  function watch(dt) {
    // Ignore absurd deltas (tab resume, breakpoint, GC pause).
    if (dt <= 0 || dt > 0.25) return;
    accum += dt; samples++;
    if (samples < 60) return;

    var fps = samples / accum;
    samples = 0; accum = 0;

    // Two bad runs in a row before acting, so one hiccup is not enough.
    // 24 rather than 30: some displays and battery-saver modes legitimately
    // cap at 30fps, and those should not be treated as a struggling device.
    if (fps < 24) { if (++slowRuns >= 2) pendingDowngrade = true; }
    else slowRuns = 0;
  }

  /* ---------- 3. the loop ----------
     app.js owns the single rAF loop and passes its timestamp in, so the
     smooth scroll and this scene always agree on the current time. */
  var last = 0;

  function render(now) {
    // Apply a deferred tier change before anything is drawn, then skip
    // this frame — the scene it refers to no longer exists.
    if (pendingDowngrade) {
      pendingDowngrade = false;
      downgrade();
      return;
    }

    if (!running || !renderer || !visible || !focused) return;

    var t  = (now || 0) * 0.001;
    var dt = last ? Math.min(t - last, 0.05) : 0.016;
    last = t;
    watch(dt);

    pointer.x += (target.x - pointer.x) * 0.05;
    pointer.y += (target.y - pointer.y) * 0.05;

    // Only transforms change — no geometry is touched, so there is no
    // per-frame upload to the GPU at all.
    world.rotation.y += dt * 0.16;
    world.rotation.x  = pointer.y * 0.25 + scrollProg * 0.45;
    world.rotation.z  = pointer.x * 0.08;

    solid.rotation.y  -= dt * 0.06;
    joints.rotation.y  = solid.rotation.y;

    if (guide) guide.rotation.z += dt * 0.1;

    camera.position.z = baseZ + scrollProg * 5;
    camera.lookAt(world.position.x * 0.45, 0, 0);

    renderer.render(scene, camera);
  }
  window.__renderScene = render;

  /* Diagnostics. Type __scene() in the browser console to see which tier
     the device landed on, whether the scene is drawing, and what frame
     rate the watchdog is measuring. */
  window.__scene = function () {
    return {
      tier: TIER, running: running, visible: visible, focused: focused,
      samplesInWindow: samples, secondsInWindow: +accum.toFixed(3),
      fpsSoFar: accum > 0 ? +(samples / accum).toFixed(1) : null,
      consecutiveSlowRuns: slowRuns,
      canvasAttached: !!(renderer && renderer.domElement && renderer.domElement.parentNode)
    };
  };

  /* ---------- 4. the gate ---------- */
  function hasSize() { return host.clientWidth > 0 && host.clientHeight > 0; }

  // three.js is ~654KB. Devices that will never render must not pay for it.
  function loadThree(cb) {
    if (typeof THREE !== "undefined") return cb();
    var s = document.createElement("script");
    s.src = "assets/js/three.min.js";
    s.async = true;
    s.onload = function () { if (typeof THREE !== "undefined") cb(); };
    s.onerror = function () { /* stay on the paper background */ };
    document.head.appendChild(s);
  }

  function decide() {
    TIER = detectTier();
    document.documentElement.setAttribute("data-tier", TIER);
    if (TIER === "off") return;      // no download at all
    loadThree(start);
  }

  if (hasSize()) {
    decide();
  } else if ("ResizeObserver" in window) {
    var gate = new ResizeObserver(function () {
      if (!hasSize()) return;
      gate.disconnect();
      decide();
    });
    gate.observe(host);
  } else {
    var tries = 0;
    var iv = setInterval(function () {
      if (hasSize()) { clearInterval(iv); decide(); }
      else if (++tries > 40) clearInterval(iv);
    }, 100);
  }
})();
