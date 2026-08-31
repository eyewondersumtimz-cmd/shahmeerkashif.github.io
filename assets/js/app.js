/* ============================================================
   app.js — content rendering, scroll, and interaction.

   Everything visible on the page is built from data.js, so the
   markup in index.html stays a skeleton and the client-facing
   copy lives in exactly one editable file.
   ============================================================ */
(function () {
  "use strict";

  var S = window.SITE || {};
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine    = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Text goes in through textContent, never innerHTML, so an
     apostrophe or an ampersand in data.js can never break the page. */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- icons (inline, so there is no icon-font request) ---------- */
  var ICONS = {
    layout: "M3 3h18v18H3zM3 9h18M9 9v12",
    cart:   "M3 3h2l2.4 12.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6M9 21h.01M18 21h.01",
    cpu:    "M6 6h12v12H6zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
    brush:  "M12 3l6 6-9 9H3v-6zM15 6l3 3",
    wrench: "M21 4a6 6 0 0 1-8 8l-7 7-3-3 7-7a6 6 0 0 1 8-8l-3.5 3.5 2 2L21 4z",
    /* process stations */
    talk:   "M4 5h16v11H9l-5 4V5zM8 9h8M8 12.5h5",
    plan:   "M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7",
    build:  "M9 8l-4 4 4 4M15 8l4 4-4 4M13 6l-2 12",
    launch: "M12 2c3.6 2.6 5.4 6.2 5.4 10.4L14.8 15H9.2l-2.6-2.6C6.6 8.2 8.4 4.6 12 2zM9.2 15l-2 4 3.4-1.2M14.8 15l2 4-3.4-1.2M12 9.4h.01",
    /* value bar */
    shield: "M12 3l7 3v6c0 4-3 6.6-7 9-4-2.4-7-5-7-9V6l7-3zM9 12l2 2 4-4",
    people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M17 6.2a3 3 0 0 1 0 5.6M18 15c2 .6 3 2 3 5",
    target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.4h.01",
    gauge:  "M4.5 18a9 9 0 1 1 15 0M12 14l4-4M12 14h.01",
    /* contact console */
    send:   "M21.5 3 2.5 10.2l7.3 2.9 2.9 7.4L21.5 3zM9.8 13.1 21.5 3",
    user:   "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c0-3.6 3.4-5.6 7.5-5.6s7.5 2 7.5 5.6",
    mail:   "M3 6h18v12H3zM3 6.6 12 13l9-6.4",
    phone:  "M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.56 3.5a1 1 0 0 1-.25 1l-2.2 2.3z",
    chev:   "M6 9.5 12 15.5 18 9.5",
    wallet: "M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7V6a2 2 0 0 1 2-2h11M16.5 13h.01",
    pencil: "M4 20h4L20 8l-4-4L4 16v4zM14.5 5.5l4 4",
    arrow:  "M4 12h15M13 6l6 6-6 6",
    bolt:   "M13 2 4.5 13.5H11l-1 8.5L18.5 10H12l1-8z",
    check:  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l2.6 2.6L16 9.2",
    /* hero nav + readouts */
    home:   "M3 11 12 3l9 8M5.5 9.5V21h13V9.5M10 21v-6h4v6",
    layers: "M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
    case:   "M3 8h18v12H3zM9 8V5.5h6V8M3 13h18",
    atom:   "M12 12a2 2 0 1 0 0-.01M12 3c4.5 6 4.5 12 0 18M12 3c-4.5 6-4.5 12 0 18M3.5 8.5c6.5-2.5 10.5-2.5 17 0M3.5 15.5c6.5 2.5 10.5 2.5 17 0",
    medal:  "M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9 13l-2 8 5-2.6L17 21l-2-8",
    chart:  "M4 20V9M10 20V4M16 20v-7M4 20h16",
    globe:  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9h17M3.5 15h17M12 3c-3 4.5-3 13.5 0 18M12 3c3 4.5 3 13.5 0 18",
    badge:  "M12 3 4.5 6.4v5.2c0 4.2 3.1 7.6 7.5 9.4 4.4-1.8 7.5-5.2 7.5-9.4V6.4L12 3zM9 12l2.2 2.2L15 10.5",
    clock:  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3.2 2"
  };
  function icon(name) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", ICONS[name] || ICONS.layout);
    svg.appendChild(p);
    return svg;
  }

  /* ============================================================
     1. HERO + IDENTITY
     ============================================================ */
  function buildIdentity() {
    $$("[data-name]").forEach(function (n) { n.textContent = S.name || ""; });
    $$("[data-role]").forEach(function (n) { n.textContent = S.role || ""; });
    $$("[data-location]").forEach(function (n) { n.textContent = S.location || ""; });
    $$("[data-intro]").forEach(function (n) { n.textContent = S.intro || ""; });
    $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

    // Tagline is split into words so each can rise independently.
    var tagline = $("[data-tagline]");
    if (tagline && S.tagline) {
      tagline.textContent = "";
      S.tagline.split(" ").forEach(function (word, i) {
        var w = el("span", "word");
        var inner = el("span", "word-in", word);
        inner.style.transitionDelay = (reduced ? 0 : 0.045 * i) + "s";
        w.appendChild(inner);
        tagline.appendChild(w);
        tagline.appendChild(document.createTextNode(" "));
      });
      // rAF for the smooth case; the timeout covers tabs that load in the
      // background, where rAF is throttled and may not run for a long time.
      requestAnimationFrame(function () { tagline.classList.add("in"); });
      setTimeout(function () { tagline.classList.add("in"); }, 1200);
    }

    var stats = $("[data-stats]");
    if (stats) {
      (S.stats || []).forEach(function (s) {
        var b = el("div", "stat");
        b.appendChild(el("div", "stat-v", s.value));
        b.appendChild(el("div", "stat-l", s.label));
        stats.appendChild(b);
      });
    }
  }

  /* ============================================================
     1b. THE ORBIT — tech badges circling the portrait.

     Entirely CSS-animated: two rings counter-rotate, and each badge
     counter-rotates against its own ring so the logo stays upright.
     Nothing here runs per frame in JavaScript, so it costs the same
     whether there are five badges or fifty.
     ============================================================ */
  /* ---------- monitor chrome ----------
     A title bar with the traffic-light dots and a filename, shared by
     the service and project machines. */
  function slug(t) {
    return String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function machineBar(label) {
    var bar = el("div", "mbar");
    var dots = el("span", "mdots");
    for (var i = 0; i < 3; i++) dots.appendChild(document.createElement("i"));
    bar.appendChild(dots);
    bar.appendChild(el("span", "mfile", label));
    return bar;
  }

  var NS = "http://www.w3.org/2000/svg";

  function iconSVG(d, color) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", color || "currentColor");
    svg.appendChild(p);
    return svg;
  }

  /* ============================================================
     EFFECTS BUDGET
     Decoration is not free. This grades the page's ambient motion to
     the machine it is running on and stamps the result on <html>, so
     the CSS can switch whole groups of animation off rather than
     hoping they are cheap.
       full - everything
       lite - slower rings, no drifting icons, no vortex sweep
       none - nothing ambient moves
     ============================================================ */
  function effectsBudget() {
    // Testing override: ?fx=full|lite|none forces a level.
    var forced = (location.search.match(/[?&]fx=(full|lite|none)/) || [])[1];
    if (forced) return forced;

    if (reduced) return "none";

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) return "none";

    var mem    = navigator.deviceMemory || 4;
    var cores  = navigator.hardwareConcurrency || 4;
    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    if (mem <= 2 || cores <= 2) return "none";
    if (coarse) return "lite";
    if (mem <= 4 || cores <= 4) return "lite";
    return "full";
  }

  /* ============================================================
     THE PORTAL SYSTEM
     ============================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function brackets(node) {
    ["tl", "tr", "bl", "br"].forEach(function (c) { node.appendChild(el("span", "brk brk-" + c)); });
  }
  function fx() { return document.documentElement.getAttribute("data-fx") || "lite"; }

  /* ---------- the portal answers when the system is touched ---------- */
  var portalTimer;
  function portalReact() {
    var p = $("[data-portal]");
    if (!p || fx() === "none") return;
    p.classList.remove("react");
    void p.offsetWidth;
    p.classList.add("react");
    clearTimeout(portalTimer);
    portalTimer = setTimeout(function () { p.classList.remove("react"); }, 900);
  }

  /* ---------- left: the wired navigation ---------- */
  function buildNav() {
    var host = $("[data-navmods]");
    if (!host) return;

    (S.navModules || []).forEach(function (m, i) {
      var a = el("a", "navmod");
      a.href = m.to;
      a.style.setProperty("--i", i);
      a.setAttribute("data-target", m.to);
      a.appendChild(el("span", "nm-n", m.n));
      a.appendChild(el("span", "nm-t", m.label));
      var ic = el("span", "nm-ico");
      ic.appendChild(icon(m.icon || "layers"));
      a.appendChild(ic);
      brackets(a);
      host.appendChild(a);
    });

    $$(".navmod", host).forEach(function (a, i) {
      function on()  { setWire(i, true); }
      function off() { setWire(i, false); }
      a.addEventListener("pointerenter", on);
      a.addEventListener("pointerleave", off);
      a.addEventListener("focus", on);
      a.addEventListener("blur", off);
      // click: energy runs down the cable, then the portal responds
      a.addEventListener("click", function () {
        setWire(i, true);
        setTimeout(portalReact, 420);
        setTimeout(function () { setWire(i, false); }, 1000);
      });
    });
  }

  function setWire(i, lit) {
    var g = $('[data-wire="' + i + '"]');
    if (!g) return;
    g.classList.remove("wire-on");
    if (lit) { void g.getBoundingClientRect(); g.classList.add("wire-on"); }
  }

  /* ---------- the cables ----------
     Built from measured geometry, then stroked four times over: a wide
     dark casing, a soft outer edge, a dim cyan core, and a bright core
     that only appears on hover. Clamps are placed along the real path
     with getPointAtLength, so they always sit on the cable. */
  function drawWires() {
    var svg = $("[data-wires]"), portal = $("[data-portal]"), sys = $(".sys");
    if (!svg || !portal || !sys) return;
    if (getComputedStyle(svg).display === "none") return;

    var mods = $$(".navmod");
    if (!mods.length) return;

    var base = sys.getBoundingClientRect(), pr = portal.getBoundingClientRect();
    var cx = pr.left - base.left + pr.width / 2;
    var cy = pr.top - base.top + pr.height / 2;
    var r  = pr.width / 2;
    var n  = mods.length;

    svg.setAttribute("viewBox", "0 0 " + Math.round(base.width) + " " + Math.round(base.height));
    svg.textContent = "";

    var firstBox = mods[0].getBoundingClientRect();
    var startX = firstBox.right - base.left;
    var runway = Math.max(60, (cx - r) - startX);   // free space between panels and rim

    /* Pass one: work out where every cable starts and lands, and which
       of them actually need to bend. Channels are then handed out only
       to the benders, spread across the whole runway — sharing columns
       between all seven was what packed them into one bundle. */
    var plan = mods.map(function (m, i) {
      var bx = m.getBoundingClientRect();
      var t = n > 1 ? 1 - 2 * (i / (n - 1)) : 0;        // +1 top .. -1 bottom
      var ang = Math.PI + t * (62 * Math.PI / 180);
      return {
        x0: bx.right - base.left,
        y0: bx.top - base.top + bx.height / 2,
        x1: cx + r * Math.cos(ang),
        y1: cy + r * Math.sin(ang)
      };
    });
    plan.forEach(function (q) { q.bends = Math.abs(q.y1 - q.y0) >= 14; });

    var benders = plan.filter(function (q) { return q.bends; }).length;
    var slot = 0;
    plan.forEach(function (q) {
      if (!q.bends) { q.ch = null; return; }
      var f = benders > 1 ? slot / (benders - 1) : 0.5;
      q.ch = q.x0 + runway * (0.15 + f * 0.66);
      slot++;
    });

    mods.forEach(function (m, i) {
      var q = plan[i];
      var x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, ch = q.ch;

      var dy = y1 - y0;
      var dir = dy > 0 ? 1 : -1;
      var d;

      if (!q.bends) {
        d = "M" + x0 + " " + y0 + " L" + x1 + " " + y1;      // straight run
      } else {
        var R = 12;                                          // corner radius
        var vStart = y0 + dir * R, vEnd = y1 - dir * R;
        if (dir > 0 ? vEnd < vStart : vEnd > vStart) { vStart = vEnd = (y0 + y1) / 2; }
        d = "M" + x0 + " " + y0 +
            " H" + (ch - R) +
            " Q" + ch + " " + y0 + " " + ch + " " + vStart +
            " V" + vEnd +
            " Q" + ch + " " + y1 + " " + (ch + R) + " " + y1 +
            " L" + x1 + " " + y1;
      }

      var g = svgEl("g", { "data-wire": i });
      g.appendChild(svgEl("path", { "class": "w-edge", d: d }));
      g.appendChild(svgEl("path", { "class": "w-case", d: d }));
      g.appendChild(svgEl("path", { "class": "w-core", d: d }));
      var live = svgEl("path", { "class": "w-live", d: d });
      g.appendChild(live);
      g.appendChild(svgEl("path", { "class": "w-pulse", d: d }));
      svg.appendChild(g);

      /* Two clamps only, and only where there is room for them — the
         previous three-per-cable read as visual noise once seven cables
         sat side by side. */
      var total = live.getTotalLength();
      if (total > 190) {
        [0.42, 0.78].forEach(function (f) {
          var pt = live.getPointAtLength(total * f);
          g.appendChild(svgEl("rect", {
            "class": "w-clamp", x: pt.x - 3, y: pt.y - 4.5, width: 6, height: 9, rx: 2
          }));
        });
      }
      g.appendChild(svgEl("rect", { "class": "w-clamp", x: x0 - 2, y: y0 - 5, width: 5, height: 10, rx: 2 }));
      g.appendChild(svgEl("circle", { "class": "w-plug", cx: x1, cy: y1, r: 4 }));
    });
  }

  /* ---------- the stack, docked around the ring ----------
     One carrier rotation plus one counter-rotation per chip, so every
     logo stays upright while the ring turns. All transform, nothing
     per frame in JavaScript. */
  function buildRingMods() {
    var host = $("[data-ringmods]");
    if (!host) return;
    var icons = window.TECH_ICONS || [];
    if (!icons.length) { host.remove(); return; }

    /* Chip count is chosen for spacing, not for showing off: at a 375px
       portal the orbit is ~1050px around, so twelve 34px chips still
       leave a clear 50px gap between each. Fewer on small screens and
       on modest machines, where they stop being readable first. */
    var level = fx();
    var max = window.innerWidth < 760 ? 6 : (level === "full" ? 12 : 10);
    var list = icons.slice(0, Math.min(max, icons.length));
    var step = 360 / list.length;

    list.forEach(function (ic, i) {
      var seat = el("span", "rm");
      seat.style.setProperty("--a", (step * i) + "deg");
      seat.style.setProperty("--k", i);          // staggers the bob and relay

      var spin = el("span", "rm-spin");
      var chip = el("span", "rm-chip");
      chip.style.setProperty("--brand", ic.c);
      chip.appendChild(iconSVG(ic.d, "currentColor"));
      chip.appendChild(el("span", "rm-name", ic.n));
      // touching a module makes the core answer
      chip.addEventListener("pointerenter", portalReact);

      spin.appendChild(chip);
      seat.appendChild(spin);
      host.appendChild(seat);
    });

    host.setAttribute("role", "img");
    host.setAttribute("aria-label",
      "Technologies: " + list.map(function (x) { return x.n; }).join(", "));
  }

  /* ---------- binary particles ---------- */
  function buildBits() {
    var host = $("[data-bits]");
    if (!host || fx() !== "full") return;
    var SPOTS = [
      [16, 20, 9, -.30, -.24], [76, 18, 8, -.24, -.30], [86, 56, 10, -.34, -.06],
      [22, 74, 9, -.24,  .22], [54, 10, 11, -.06, -.36], [10, 52, 8, -.36,  .02],
      [70, 84, 9, -.18,  .30], [40, 88, 8, -.08,  .34]
    ];
    SPOTS.forEach(function (sp, i) {
      var b = el("span", "bit", i % 2 ? "1" : "0");
      b.style.left = sp[0] + "%"; b.style.top = sp[1] + "%";
      b.style.setProperty("--bd", sp[2] + "s");
      b.style.setProperty("--bdl", (-i * 1.1) + "s");
      b.style.setProperty("--bx", (sp[3] * 100) + "px");
      b.style.setProperty("--by", (sp[4] * 100) + "px");
      host.appendChild(b);
    });
  }

  /* ---------- SYSTEM OUTPUT, with a small visualisation each ---------- */
  function vizFor(kind) {
    var s = svgEl("svg", { "class": "out-viz", viewBox: "0 0 56 20", "aria-hidden": "true" });
    if (kind === "bars") {
      [7, 11, 8, 15, 12, 18].forEach(function (h, i) {
        s.appendChild(svgEl("rect", { "class": "vz-fill", x: i * 9.5, y: 20 - h, width: 5, height: h, rx: 1 }));
      });
    } else if (kind === "nodes") {
      var pts = [[4, 14], [17, 6], [30, 15], [43, 7], [52, 13]];
      pts.forEach(function (p, i) {
        if (i) s.appendChild(svgEl("line", {
          "class": "vz-stroke", x1: pts[i - 1][0], y1: pts[i - 1][1], x2: p[0], y2: p[1]
        }));
      });
      pts.forEach(function (p) { s.appendChild(svgEl("circle", { "class": "vz-fill", cx: p[0], cy: p[1], r: 2.4 })); });
    } else if (kind === "ring") {
      s.appendChild(svgEl("circle", { "class": "vz-dim", cx: 28, cy: 10, r: 8 }));
      s.appendChild(svgEl("circle", {
        "class": "vz-arc", cx: 28, cy: 10, r: 8,
        "stroke-dasharray": "36 50", transform: "rotate(-90 28 10)"
      }));
    } else {
      s.appendChild(svgEl("path", { "class": "vz-stroke", d: "M2 16 L12 11 L21 14 L31 6 L41 9 L54 3" }));
    }
    return s;
  }

  function buildOutput() {
    var host = $("[data-output]");
    if (!host) return;
    (S.systemOutput || []).forEach(function (o) {
      var li = document.createElement("li");
      var ic = el("span", "out-ic");
      ic.appendChild(icon(o.icon || "chart"));
      li.appendChild(ic);
      li.appendChild(el("span", "out-l", o.label));
      var v = el("span", "out-v", "0" + (o.suffix || ""));
      v.setAttribute("data-count", o.value);
      v.setAttribute("data-suffix", o.suffix || "");
      li.appendChild(v);
      li.appendChild(vizFor(o.viz));
      host.appendChild(li);
    });
    ["#system-output", "#experience"].forEach(function (sel) {
      var n = $(sel); if (n) brackets(n);
    });
  }

  function runCounters() {
    var cells = $$("[data-count]");
    if (!cells.length) return;
    function snap() {
      cells.forEach(function (c) {
        c.textContent = c.getAttribute("data-count") + c.getAttribute("data-suffix");
      });
    }
    if (reduced) return snap();

    var DUR = 900, start = null;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / DUR), e = 1 - Math.pow(1 - p, 3);
      cells.forEach(function (c) {
        var target = parseInt(c.getAttribute("data-count"), 10) || 0;
        c.textContent = Math.round(target * e) + c.getAttribute("data-suffix");
      });
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // rAF is throttled in a background tab; never leave the readout on zero.
    setTimeout(snap, DUR + 700);
  }

  /* ---------- CORE EXPERIENCE ---------- */
  function buildModules() {
    var host = $("[data-modules]");
    if (!host) return;
    (S.coreExperience || []).forEach(function (name) {
      var li = document.createElement("li");
      li.appendChild(el("span", "mdot"));
      li.appendChild(document.createTextNode(name));
      host.appendChild(li);
    });
  }

  /* Every [data-pic] on the page, not just the first: the hero portal
     and the about dossier both use one, and $() only returned the hero,
     which left the about photo with no src at all. */
  function buildPic() {
    $$("[data-pic-webp]").forEach(function (src) {
      if (S.PROFILE_IMAGE) src.srcset = S.PROFILE_IMAGE;
    });
    $$("[data-pic]").forEach(function (img) {
      img.src = S.PROFILE_FALLBACK || S.PROFILE_IMAGE || "";
      img.alt = (S.name || "") + ", " + (S.role || "");

      /* A <picture> does not fall back on its own. Once a <source>
         matches, that is the file the browser commits to, and if it
         fails — a truncated response, a proxy that mangles WebP, an
         old engine that took the source and then choked — the element
         renders alt text and the <img src> is never tried. So do the
         fallback by hand: drop the sources and reload from the PNG. */
      img.addEventListener("error", function onFail() {
        img.removeEventListener("error", onFail);
        var pic = img.parentNode;
        if (pic && pic.tagName === "PICTURE") {
          $$("source", pic).forEach(function (s) { pic.removeChild(s); });
        }
        var png = S.PROFILE_FALLBACK || S.PROFILE_IMAGE || "";
        img.src = png + (png.indexOf("?") < 0 ? "?" : "&") + "retry=1";
      });
    });
  }

  function buildConsole() {
    $$("[data-sysline]").forEach(function (n) { n.textContent = S.systemLine || ""; });
    var bar = $(".console-bar"); if (bar) brackets(bar);
    $$(".plate").forEach(brackets);
  }

  /* ============================================================
     THE NEURAL NETWORK
     One canvas, one rAF loop, capped at 30fps and paused whenever the
     hero is off screen or the tab is hidden. The backing store is
     rendered below device pixel ratio on purpose — this is a soft
     background, and fill rate is the thing that actually costs on a
     machine with no GPU.
     ============================================================ */
  function neuralNet() {
    var cv = $("[data-neuro]");
    if (!cv) return;
    var level = fx();
    /* Only the "full" tier gets the canvas. On a machine without a GPU
       every frame is rasterised on the CPU, and a full-viewport canvas
       is the most expensive thing on the page. */
    if (level !== "full") { cv.remove(); return; }

    var ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) { cv.remove(); return; }

    var COUNT = level === "full" ? 30 : 16;
    var LINK  = level === "full" ? 165 : 140;
    var SCALE = level === "full" ? 0.75 : 0.6;   // render below native, upscale
    var FRAME = level === "full" ? 33 : 50;      // ~30fps / ~20fps

    var w = 0, h = 0, nodes = [], links = [];

    function seed() {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        // deterministic-ish scatter, no Math.random at layout time
        var a = (i * 2.399963), rr = Math.sqrt((i + 0.5) / COUNT);
        nodes.push({
          x: (0.5 + Math.cos(a) * rr * 0.52) * w,
          y: (0.5 + Math.sin(a) * rr * 0.52) * h,
          vx: Math.cos(a * 3.1) * 0.05,
          vy: Math.sin(a * 2.7) * 0.05,
          ph: (i * 0.7) % (Math.PI * 2)
        });
      }
    }

    function size() {
      var r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      cv.width  = Math.round(w * SCALE);
      cv.height = Math.round(h * SCALE);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      seed();
    }

    /* one travelling pulse at a time, and a rare spark: the "random
       electrical events", kept to a strict budget */
    var pulse = null, sparkAt = 0, spark = null;

    function pick(t) {
      if (!pulse && links.length && t > (pulse === null ? 0 : 0)) {
        var l = links[(Math.floor(t / 900) % links.length + links.length) % links.length];
        if (l) pulse = { a: l[0], b: l[1], p: 0 };
      }
    }

    var last = 0, running = true, visible = true;

    function draw(t) {
      if (!running) return;
      requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      if (t - last < FRAME) return;
      var dt = Math.min(t - last, 60);
      last = t;

      ctx.clearRect(0, 0, w, h);

      // drift
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx * dt * 0.06;
        n.y += n.vy * dt * 0.06;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.ph += dt * 0.0009;
      }

      // links
      links.length = 0;
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          links.push([a, b]);
          var o = (1 - d / LINK) * 0.30;
          ctx.strokeStyle = "rgba(0,160,255," + o.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }

      // nodes, breathing
      for (var k = 0; k < nodes.length; k++) {
        var nd = nodes[k];
        var pu = 0.5 + 0.5 * Math.sin(nd.ph);
        ctx.fillStyle = "rgba(0,200,255," + (0.20 + pu * 0.45).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 1.3 + pu * 1.1, 0, 6.2832);
        ctx.fill();
      }

      // a pulse travelling one link
      pick(t);
      if (pulse) {
        var A = nodes[pulse.a], B = nodes[pulse.b];
        if (A && B) {
          pulse.p += dt * 0.0011;
          if (pulse.p >= 1) { pulse = null; }
          else {
            var px = A.x + (B.x - A.x) * pulse.p, py = A.y + (B.y - A.y) * pulse.p;
            ctx.fillStyle = "rgba(120,230,255,.85)";
            ctx.beginPath(); ctx.arc(px, py, 2, 0, 6.2832); ctx.fill();
          }
        } else pulse = null;
      }

      // a rare discharge: a short bright segment, every few seconds
      if (t > sparkAt) {
        sparkAt = t + 3000 + ((t | 0) % 5000);
        var s = nodes[(t | 0) % nodes.length];
        if (s) spark = { x: s.x, y: s.y, until: t + 320 };
      }
      if (spark && t < spark.until) {
        var f = 1 - (spark.until - t) / 320;
        ctx.strokeStyle = "rgba(160,240,255," + (0.7 * (1 - f)).toFixed(3) + ")";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(spark.x - 7, spark.y - 4);
        ctx.lineTo(spark.x + 2, spark.y + 1);
        ctx.lineTo(spark.x - 2, spark.y + 5);
        ctx.lineTo(spark.x + 8, spark.y + 9);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    }

    size();
    requestAnimationFrame(draw);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(size, 180);
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; },
                               { threshold: 0 }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () { last = 0; });
  }

  /* ============================================================
     PARALLAX — four planes, tiny travel, one write per frame.
     Pointer only: no gyroscope, and nothing on touch.
     ============================================================ */
  function initParallax() {
    if (fx() === "none" || !fine) return;
    var hero = $(".hero");
    if (!hero) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, queued = false;
    var PLANES = [["bg", 10], ["mid", 4], ["por", 6], ["fg", -5]];

    function apply() {
      queued = false;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      PLANES.forEach(function (p) {
        hero.style.setProperty("--px-" + p[0], (cx * p[1]).toFixed(2) + "px");
        hero.style.setProperty("--py-" + p[0], (cy * p[1]).toFixed(2) + "px");
      });
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) queue();
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(apply); } }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width  - 0.5;
      ty = (e.clientY - r.top)  / r.height - 0.5;
      queue();
    }, { passive: true });

    hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; queue(); });

    // the portal brightens while the pointer is over it
    var portal = $("[data-portal]");
    if (portal) {
      portal.addEventListener("pointerenter", portalReact);
    }
  }

  /* ---------- boot ---------- */
  function runBoot() {
    var hero = $(".hero");
    if (!hero) return;
    function go() {
      if (hero.classList.contains("booted")) return;
      hero.classList.add("booted");
      runCounters();
      setTimeout(drawWires, 420);
    }
    var skip = $("[data-boot-skip]");
    if (skip) skip.addEventListener("click", go);
    document.addEventListener("keydown", go, { once: true });
    setTimeout(go, fx() === "none" ? 0 : 1900);
    setTimeout(go, 4500);
  }

  function watchWires() {
    var t;
    function again() { clearTimeout(t); t = setTimeout(function () { drawWires(); drawRail(); }, 160); }
    window.addEventListener("resize", again, { passive: true });
    window.addEventListener("orientationchange", again, { passive: true });
    if ("ResizeObserver" in window) {
      var sys = $(".sys"); if (sys) new ResizeObserver(again).observe(sys);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
  }

  /* ---------- floating icons behind the whole page ----------
     Fixed layer, one composited surface, transform-only animation.
     Positions come from a fixed table rather than Math.random so the
     layout is the same on every load and can be reasoned about. */
  function buildFloaties() {
    // Only the "full" budget gets drifting icons. They are the single
    // most expensive piece of ambient decoration on the page: one
    // composited layer each, all animating at once.
    if (document.documentElement.getAttribute("data-fx") !== "full") return;

    var icons = window.TECH_ICONS || [];
    if (!icons.length) return;

    // x%, y%, size px, duration s, delay s
    var SPOTS = [
      [ 6,  12, 34, 26,  0], [ 88, 18, 28, 31, -4], [ 16, 46, 22, 24, -9],
      [ 78, 52, 36, 29, -2], [ 42, 78, 26, 33, -6], [ 92, 74, 24, 27, -11],
      [ 26, 88, 30, 30, -3], [ 62, 22, 20, 35, -7], [  4, 66, 26, 28, -13],
      [ 70, 92, 22, 32, -5], [ 34, 32, 24, 25, -8], [ 54, 58, 28, 34, -1]
    ];
    // Fewer on small screens — less to composite on a phone.
    var count = Math.min(SPOTS.length, 8);

    var layer = el("div", "floaties");
    layer.setAttribute("aria-hidden", "true");

    for (var i = 0; i < count; i++) {
      var sp = SPOTS[i];
      var ic = icons[i % icons.length];
      var n = el("span", "fl");
      n.style.left = sp[0] + "%";
      n.style.top  = sp[1] + "%";
      n.style.width = sp[2] + "px";
      n.style.height = sp[2] + "px";
      n.style.setProperty("--dur", sp[3] + "s");
      n.style.setProperty("--del", sp[4] + "s");
      n.appendChild(iconSVG(ic.d, "currentColor"));
      layer.appendChild(n);
    }
    document.body.insertBefore(layer, document.body.firstChild);
  }

  /* ============================================================
     2. CONTACT LINKS
     ============================================================ */
  function buildContact() {
    var tel = "tel:+" + (S.phoneRaw || "");
    var wa  = "https://wa.me/" + (S.phoneRaw || "") +
              "?text=" + encodeURIComponent("Hi Shahmeer, I saw your portfolio and I would like to discuss a project.");
    var mail = "mailto:" + (S.email || "");

    $$("[data-tel]").forEach(function (n) {
      n.href = tel;
      if (n.hasAttribute("data-fill")) n.textContent = S.phone || "";
    });
    $$("[data-wa]").forEach(function (n)  { n.href = wa; n.target = "_blank"; n.rel = "noopener"; });
    $$("[data-mail]").forEach(function (n){
      n.href = mail;
      if (n.hasAttribute("data-fill")) n.textContent = S.email || "";
    });

    /* Dedicated text spans, so setting the label cannot wipe an icon
       that shares the anchor — which is exactly what happened in the
       footer, where only the icon-less WhatsApp line survived. */
    $$("[data-fill-tel]").forEach(function (n) { n.textContent = S.phone || ""; });
    $$("[data-fill-mail]").forEach(function (n){ n.textContent = S.email || ""; });
  }

  /* ============================================================
     3. SERVICES
     ============================================================ */
  function buildServices() {
    var wrap = $("[data-services]");
    if (!wrap) return;
    (S.services || []).forEach(function (s, i) {
      var unit = el("div", "unit reveal");
      unit.style.setProperty("--d", (i % 3) * 0.08 + "s");

      var card = el("article", "card");
      card.appendChild(machineBar(slug(s.title) + ".service"));

      var screen = el("div", "card-screen");
      var ic = el("div", "card-ic");
      ic.appendChild(icon(s.icon));
      screen.appendChild(ic);
      screen.appendChild(el("h3", "card-t", s.title));
      screen.appendChild(el("p", "card-p", s.text));
      card.appendChild(screen);

      unit.appendChild(card);
      unit.appendChild(el("div", "mstand"));
      unit.appendChild(el("div", "mbase"));
      wrap.appendChild(unit);
    });
  }

  /* ============================================================
     4. PROJECTS
     ============================================================ */
  function buildProjects() {
    var wrap = $("[data-projects]");
    if (!wrap) return;

    (S.projects || []).forEach(function (p, i) {
      var unit = el("article", "unit reveal");
      unit.style.setProperty("--d", (i % 3) * 0.08 + "s");
      var card = el("div", "proj");
      card.appendChild(machineBar(p.url ? p.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
                                        : slug(p.title) + ".build"));

      // Visual: a real thumbnail if one is supplied, otherwise a
      // generated gradient keyed off the index so no two match.
      var vis = el("div", "proj-vis");
      if (p.img) {
        var im = el("img");
        im.src = p.img;
        im.alt = p.title + " — project screenshot";
        im.loading = "lazy";
        im.decoding = "async";
        vis.appendChild(im);
      } else {
        vis.classList.add("gen");
        vis.style.setProperty("--h", (24 + i * 31) % 360);
        vis.appendChild(el("span", "proj-mono", p.title.charAt(0)));
      }
      card.appendChild(vis);

      var body = el("div", "proj-body");
      var top  = el("div", "proj-top");
      top.appendChild(el("span", "proj-tag", p.tag));
      top.appendChild(el("span", "proj-yr", p.year));
      body.appendChild(top);

      body.appendChild(el("h3", "proj-t", p.title));
      body.appendChild(el("p", "proj-p", p.text));

      if (p.work && p.work.length) {
        var chips = el("div", "chips");
        p.work.forEach(function (w) { chips.appendChild(el("span", "chip", w)); });
        body.appendChild(chips);
      }

      /* The footer row is always present, whether or not there is a
         public link. Rendering it only for linked projects made those
         cards ~35px taller than the rest. */
      var foot = el("div", "proj-foot");
      if (p.url) {
        var a = el("a", "proj-link", "View live site");
        a.href = p.url; a.target = "_blank"; a.rel = "noopener";
        foot.appendChild(a);
      }
      body.appendChild(foot);

      /* The whole machine is clickable when the project is live, so a
         client does not have to hunt for the link. A real anchor, so it
         keyboard-focuses and opens in a new tab like any other link. */
      if (p.url) {
        var hit = el("a", "proj-hit");
        hit.href = p.url;
        hit.target = "_blank";
        hit.rel = "noopener";
        hit.setAttribute("aria-label", "Open " + p.title + " in a new tab");
        card.appendChild(hit);
      }

      card.appendChild(body);
      unit.appendChild(card);
      unit.appendChild(el("div", "mstand"));
      unit.appendChild(el("div", "mbase"));
      wrap.appendChild(unit);
    });
  }

  /* ============================================================
     5. PROCESS + STACK
     ============================================================ */
  /* ---------- the HUD frame ----------
     Drawn as SVG rather than clip-path + border so the corners stay
     crisp and the glow can be a second, wider stroke instead of a
     filter. preserveAspectRatio is "none" so the outline stretches to
     whatever the card ends up being; non-scaling-stroke keeps the line
     weight even when it does. */
  function hudFrame() {
    var svg = svgEl("svg", {
      "class": "hud-frame", viewBox: "0 0 200 320",
      preserveAspectRatio: "none", "aria-hidden": "true"
    });

    // outline: chamfered corners, a stepped notch top and bottom,
    // and a recess halfway down each side
    var d = "M0 30 L30 0 L74 0 L82 9 L118 9 L126 0 L172 0 L200 26 " +
            "L200 128 L189 140 L189 182 L200 194 L200 292 L172 320 " +
            "L126 320 L118 311 L82 311 L74 320 L30 320 L0 290 " +
            "L0 192 L11 180 L11 138 L0 126 Z";

    svg.appendChild(svgEl("path", { "class": "hf-glow", d: d, "vector-effect": "non-scaling-stroke" }));
    svg.appendChild(svgEl("path", { "class": "hf-line", d: d, "vector-effect": "non-scaling-stroke" }));

    // hatch blocks on the side recesses
    [[6, 146], [6, 156], [6, 166], [188, 146], [188, 156], [188, 166]].forEach(function (h) {
      svg.appendChild(svgEl("path", {
        "class": "hf-hatch",
        d: "M" + h[0] + " " + h[1] + " l7 -7",
        "vector-effect": "non-scaling-stroke"
      }));
    });

    // instrument row, top left
    [0, 1, 2, 3, 4].forEach(function (i) {
      svg.appendChild(svgEl("circle", { "class": "hf-dot", cx: 34 + i * 7, cy: 17, r: 1.6 }));
    });
    svg.appendChild(svgEl("path", { "class": "hf-tick", d: "M34 25 H72", "vector-effect": "non-scaling-stroke" }));
    svg.appendChild(svgEl("path", { "class": "hf-tick", d: "M34 30 H60", "vector-effect": "non-scaling-stroke" }));

    // sensor ring, top right
    svg.appendChild(svgEl("circle", { "class": "hf-ring", cx: 172, cy: 22, r: 6, "vector-effect": "non-scaling-stroke" }));
    svg.appendChild(svgEl("circle", { "class": "hf-dot", cx: 172, cy: 22, r: 1.8 }));

    // hash marks, bottom right
    [0, 1, 2].forEach(function (i) {
      svg.appendChild(svgEl("path", {
        "class": "hf-hatch", d: "M" + (150 + i * 6) + " 303 l5 -6",
        "vector-effect": "non-scaling-stroke"
      }));
    });
    return svg;
  }

  /* ---------- the launch platform ----------
     An isometric emitter: segmented rim, concentric grooves, a hot
     core and a column of light rising out of it. Static SVG — the
     only motion is the beam opacity, and that is budget-gated. */
  function launchPad() {
    var svg = svgEl("svg", {
      "class": "pad-svg", viewBox: "0 0 320 170", "aria-hidden": "true"
    });

    var defs = svgEl("defs", {});
    var g = svgEl("linearGradient", { id: "beamGrad", x1: "0", y1: "1", x2: "0", y2: "0" });
    [["0%", "0.85"], ["45%", "0.30"], ["100%", "0"]].forEach(function (st) {
      g.appendChild(svgEl("stop", { offset: st[0], "stop-color": "currentColor", "stop-opacity": st[1] }));
    });
    defs.appendChild(g);
    svg.appendChild(defs);

    var cx = 160, cy = 118;

    // floor rings, widest first
    [[150, 46], [124, 38], [100, 30]].forEach(function (r, i) {
      svg.appendChild(svgEl("ellipse", {
        "class": "pd-floor", cx: cx, cy: cy, rx: r[0], ry: r[1],
        opacity: (0.16 - i * 0.04).toFixed(2)
      }));
    });

    // the platform body
    svg.appendChild(svgEl("ellipse", { "class": "pd-body", cx: cx, cy: cy, rx: 92, ry: 28 }));

    // eight lit segments around the rim
    for (var i = 0; i < 8; i++) {
      var a0 = (i / 8) * Math.PI * 2 + 0.09;
      var a1 = ((i + 0.62) / 8) * Math.PI * 2;
      var p = [];
      [[92, 28], [72, 22]].forEach(function (r, k) {
        var pts = [];
        for (var t = 0; t <= 1; t += 0.25) {
          var a = a0 + (a1 - a0) * (k ? 1 - t : t);
          pts.push((cx + Math.cos(a) * r[0]).toFixed(1) + " " + (cy + Math.sin(a) * r[1]).toFixed(1));
        }
        p = p.concat(pts);
      });
      svg.appendChild(svgEl("path", { "class": "pd-seg", d: "M" + p.join(" L") + " Z" }));
    }

    // concentric grooves on the deck
    [[70, 21], [54, 16], [38, 11], [22, 7]].forEach(function (r, i) {
      svg.appendChild(svgEl("ellipse", {
        "class": "pd-groove", cx: cx, cy: cy, rx: r[0], ry: r[1],
        opacity: (0.75 - i * 0.13).toFixed(2)
      }));
    });

    // the beam column
    for (var b = 0; b < 7; b++) {
      var off = (b - 3) * 7;
      svg.appendChild(svgEl("rect", {
        "class": "pd-beam", x: cx + off - 0.7, y: 8, width: 1.4, height: 110,
        fill: "url(#beamGrad)", opacity: (1 - Math.abs(b - 3) * 0.22).toFixed(2)
      }));
    }

    // the hot core
    svg.appendChild(svgEl("ellipse", { "class": "pd-core", cx: cx, cy: cy, rx: 16, ry: 5 }));
    svg.appendChild(svgEl("ellipse", { "class": "pd-core-hot", cx: cx, cy: cy, rx: 7, ry: 1.8 }));
    return svg;
  }

  /* A landscape variant of the HUD housing, for the enquiry form. */
  function hudFrameWide() {
    var svg = svgEl("svg", {
      "class": "ct-frame", viewBox: "0 0 600 300",
      preserveAspectRatio: "none", "aria-hidden": "true"
    });
    var d = "M0 26 L26 0 L232 0 L246 14 L354 14 L368 0 L574 0 L600 26 " +
            "L600 118 L588 130 L588 170 L600 182 L600 274 L574 300 " +
            "L368 300 L354 286 L246 286 L232 300 L26 300 L0 274 " +
            "L0 182 L12 170 L12 130 L0 118 Z";
    svg.appendChild(svgEl("path", { "class": "hf-glow", d: d, "vector-effect": "non-scaling-stroke" }));
    svg.appendChild(svgEl("path", { "class": "hf-line", d: d, "vector-effect": "non-scaling-stroke" }));
    [[5, 140], [5, 150], [592, 140], [592, 150]].forEach(function (h) {
      svg.appendChild(svgEl("path", {
        "class": "hf-hatch", d: "M" + h[0] + " " + h[1] + " l7 -7",
        "vector-effect": "non-scaling-stroke"
      }));
    });
    return svg;
  }



  /* footer glyphs */
  function buildFooterIcons() {
    $$("[data-ft-icon]").forEach(function (n) {
      n.appendChild(icon(n.getAttribute("data-ft-icon")));
    });
  }

  /* ---------- the pieces the reference calls for ---------- */
  function buildHeroExtras() {
    var L = S.portalLabels || {};
    $$("[data-plabel]").forEach(function (n) {
      var t = L[n.getAttribute("data-plabel")];
      if (!t) { n.remove(); return; }
      n.textContent = "";
      /* Three layers: an unclipped halo behind, then a bright edge whose
         1px padding shows through as the border (a real border would be
         cut off by the clip-path), then the dark face carrying the text. */
      n.appendChild(el("span", "pl-halo"));
      var box = el("span", "pl-box");
      box.appendChild(el("span", "pl-tx", t));
      n.appendChild(box);
      n.appendChild(el("span", "pl-trail"));
    });

    $$("[data-status-label]").forEach(function (n) { n.textContent = S.statusLabel || ""; });
    $$("[data-status-value]").forEach(function (n) { n.textContent = S.statusValue || ""; });
    $$("[data-cta-kicker]").forEach(function (n) { n.textContent = S.ctaKicker || ""; });
    $$("[data-cta-kicker-em]").forEach(function (n) { n.textContent = S.ctaKickerEm || ""; });
    $$("[data-role-primary]").forEach(function (n) { n.textContent = S.rolePrimary || ""; });
    $$("[data-role-secondary]").forEach(function (n) { n.textContent = S.roleSecondary || ""; });
    $$("[data-monogram]").forEach(function (n) { n.textContent = S.monogram || "M"; });

    /* The quote, with the two named phrases picked out. Built by
       splitting on the phrases rather than with innerHTML, so the copy
       in data.js can contain anything without breaking the page. */
    var q = $("[data-quote]");
    if (q && S.heroQuote) {
      var text = S.heroQuote.text || "";
      var lit  = (S.heroQuote.lit || []).slice().sort(function (a, b) { return b.length - a.length; });
      var rest = [text];
      lit.forEach(function (phrase) {
        rest = rest.reduce(function (acc, part) {
          if (typeof part !== "string") { acc.push(part); return acc; }
          var i = part.indexOf(phrase);
          if (i < 0) { acc.push(part); return acc; }
          if (i) acc.push(part.slice(0, i));
          acc.push({ lit: phrase });
          if (i + phrase.length < part.length) acc.push(part.slice(i + phrase.length));
          return acc;
        }, []);
      });
      q.textContent = "";
      rest.forEach(function (part) {
        if (typeof part === "string") q.appendChild(document.createTextNode(part));
        else q.appendChild(el("em", null, part.lit));
      });
    }

    var orb = $("[data-orb]");
    if (orb) buildOrrery(orb);
  }

  /* The orb, as a small orrery: a wireframe globe that spins on its
     axis inside two tilted orbits carrying planets.

     The globe spin is the standard trick — meridians are ellipses whose
     rx narrows to nothing and opens out again, staggered by delay, which
     reads as rotation. The planets ride the orbit paths via offset-path,
     so the browser moves them with a transform rather than repainting.
     Everything sits in a 120-unit box that renders at ~98px, so even the
     geometry animation is a trivial amount of raster. */
  function buildOrrery(orb) {
    var svg = svgEl("svg", { viewBox: "0 0 120 120", "aria-hidden": "true" });
    var R = 27;                                   // globe radius
    var g;

    // the stems that anchor the orb into the bar, as in the reference
    svg.appendChild(svgEl("line", { "class": "ob-stem", x1: 60, y1: 3,   x2: 60, y2: 12 }));
    svg.appendChild(svgEl("line", { "class": "ob-stem", x1: 60, y1: 108, x2: 60, y2: 117 }));

    // ---- the two tilted orbits, each with a planet riding it ----
    [{ tilt: -24, cls: "o1" }, { tilt: 28, cls: "o2" }].forEach(function (o) {
      g = svgEl("g", { transform: "rotate(" + o.tilt + " 60 60)" });
      g.appendChild(svgEl("ellipse", { "class": "ob-orbit", cx: 60, cy: 60, rx: 51, ry: 17 }));
      g.appendChild(svgEl("circle", { "class": "ob-planet " + o.cls, cx: 0, cy: 0, r: 3.1 }));
      svg.appendChild(g);
    });

    // ---- the globe ----
    g = svgEl("g", { "class": "ob-globe" });
    g.appendChild(svgEl("circle", { "class": "ob-limb", cx: 60, cy: 60, r: R }));

    // latitudes: fixed rings, narrowing towards the poles
    [[-14, 23], [0, 27], [14, 23]].forEach(function (lat) {
      g.appendChild(svgEl("ellipse", {
        "class": "ob-lat", cx: 60, cy: 60 + lat[0], rx: lat[1], ry: lat[1] * 0.26
      }));
    });

    // meridians: the spin
    ["m0", "m1", "m2"].forEach(function (cls) {
      g.appendChild(svgEl("ellipse", { "class": "ob-mer " + cls, cx: 60, cy: 60, rx: R, ry: R }));
    });
    svg.appendChild(g);

    svg.appendChild(svgEl("circle", { "class": "ob-core", cx: 60, cy: 60, r: 2.6 }));
    orb.appendChild(svg);
  }

  /* A single bright arc orbiting the rim — the portal's signature.
     One rotating element, no shadow or mask, so it costs the same on
     every machine. */
  function portalSweeper() {
    var portal = $("[data-portal]");
    if (!portal || fx() === "none") return;
    var svg = svgEl("svg", { "class": "p-sweeper", viewBox: "0 0 400 400", "aria-hidden": "true" });
    var defs = svgEl("defs", {});
    var g = svgEl("linearGradient", { id: "sweepGrad", x1: "0", y1: "0", x2: "1", y2: "1" });
    [["0%", "#00c8ff", "0"], ["55%", "#4ddcff", ".55"], ["100%", "#eafaff", "1"]]
      .forEach(function (st) {
        g.appendChild(svgEl("stop", { offset: st[0], "stop-color": st[1], "stop-opacity": st[2] }));
      });
    defs.appendChild(g);
    svg.appendChild(defs);
    svg.appendChild(svgEl("path", { "class": "ps-arc", d: "M200 30 A170 170 0 0 1 320 80" }));
    svg.appendChild(svgEl("circle", { "class": "ps-tip", cx: 320, cy: 80, r: 4.5 }));
    portal.appendChild(svg);
  }

  /* ---------- the transmit console ---------- */
  function buildTransmit() {
    var badge = $("[data-ct-badge]");
    if (badge) badge.appendChild(icon("send"));

    $$("[data-ct-icon]").forEach(function (n) {
      n.appendChild(icon(n.getAttribute("data-ct-icon")));
    });

    var assure = $("[data-ct-assure]");
    if (assure) {
      /* Only claims that are actually true of this form: it opens
         WhatsApp or a mail client, nothing is stored, and there is no
         list to join. No invented response-time guarantees. */
      [["shield", "Goes straight to me"],
       ["bolt",   "Usually a same-day reply"],
       ["check",  "No mailing list, ever"]].forEach(function (a) {
        var li = document.createElement("li");
        li.appendChild(icon(a[0]));
        li.appendChild(document.createTextNode(a[1]));
        assure.appendChild(li);
      });
    }

    var radar = $("[data-ct-radar]");
    if (radar) {
      var svg = svgEl("svg", { viewBox: "0 0 60 60", "aria-hidden": "true" });
      [26, 18, 10].forEach(function (r) {
        svg.appendChild(svgEl("circle", { "class": "rd-ring", cx: 30, cy: 30, r: r }));
      });
      svg.appendChild(svgEl("line", { "class": "rd-cross", x1: 4, y1: 30, x2: 56, y2: 30 }));
      svg.appendChild(svgEl("line", { "class": "rd-cross", x1: 30, y1: 4, x2: 30, y2: 56 }));
      svg.appendChild(svgEl("path", { "class": "rd-sweep", d: "M30 30 L30 4 A26 26 0 0 1 52 17" }));
      svg.appendChild(svgEl("circle", { "class": "rd-core", cx: 30, cy: 30, r: 3 }));
      radar.appendChild(svg);
    }
  }

  /* ---------- process: the rising journey ---------- */
  function buildProcess() {
    var wrap = $("[data-process]");
    if (wrap) {
      var GLYPH = ["talk", "plan", "build", "launch"];
      (S.process || []).forEach(function (p, i) {
        /* No .reveal here: the hologram build replaces it, otherwise
           two opacity animations fight over the same element. */
        var li = el("li", "pstep");
        li.style.setProperty("--i", i);

        /* The pad and the cone are siblings of the card body, not
           children of it: holoBuild animates clip-path on the body,
           and a clip-path clips descendants — which was erasing the
           launch pad below the card entirely. */
        var body = el("div", "pstep-body");
        body.appendChild(el("span", "ph-grid"));
        body.appendChild(el("span", "ph-scan"));
        body.appendChild(hudFrame());

        var ico = el("div", "pstep-ico");
        ico.appendChild(icon(GLYPH[i % GLYPH.length]));
        body.appendChild(ico);

        body.appendChild(el("span", "pstep-n", p.step));
        body.appendChild(el("h3", "pstep-t", p.title));
        body.appendChild(el("p", "pstep-p", p.text));

        var div = el("div", "pstep-div");
        div.appendChild(document.createElement("i"));
        div.appendChild(document.createElement("i"));
        div.appendChild(document.createElement("i"));
        body.appendChild(div);

        var ul = el("ul", "pstep-list");
        (p.points || []).forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
        body.appendChild(ul);

        li.appendChild(body);

        /* Siblings of the body, so the body's clip-path cannot erase
           them: the cone rises from the pad, the pad sits below. */
        li.appendChild(el("span", "ph-cone"));

        var pad = el("span", "pstep-pad");
        pad.appendChild(launchPad());
        li.appendChild(pad);

        wrap.appendChild(li);
      });
    }

    var vals = $("[data-values]");
    if (vals) {
      (S.processValues || []).forEach(function (v) {
        var li = el("li", "pv");
        var ic = el("span", "pv-ico");
        ic.appendChild(icon(v.icon));
        li.appendChild(ic);
        var b = el("div");
        b.appendChild(el("span", "pv-t", v.title));
        b.appendChild(el("p", "pv-p", v.text));
        li.appendChild(b);
        vals.appendChild(li);
      });
    }

    var stack = $("[data-stack]");
    if (stack) {
      (S.stack || []).forEach(function (t) { stack.appendChild(el("span", "tech", t)); });
    }
  }


  /* The hologram build fires once, when the stage first enters view,
     so the visitor actually sees the projection happen rather than it
     having completed off screen. */
  function armHolograms() {
    var steps = $(".proc-steps");
    if (!steps) return;
    function go() { steps.classList.add("built"); }

    if (reduced || !("IntersectionObserver" in window)) { go(); return; }

    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      go();
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.05 });
    io.observe(steps);

    // Never leave the stations invisible if the observer misses.
    setTimeout(go, 9000);
  }

  /* The rail is measured, not guessed: it runs badge to badge using
     their real positions, so it meets every hex dead centre whatever
     the column widths do. Redrawn on resize only. */
  function drawRail() {
    var svg = $("[data-rail]");
    var stage = $(".proc-stage");
    if (!svg || !stage) return;
    if (getComputedStyle(svg).display === "none") { svg.textContent = ""; return; }

    var icos = $$(".pstep-ico");
    if (icos.length < 2) return;

    var base = stage.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + Math.round(base.width) + " " + Math.round(base.height));
    svg.textContent = "";

    var defs = svgEl("defs", {});
    var grad = svgEl("linearGradient", { id: "railGrad", x1: "0", y1: "1", x2: "1", y2: "0" });
    [["0%", "#00c8ff"], ["55%", "#4d8cff"], ["100%", "#8b5cf6"]].forEach(function (st) {
      grad.appendChild(svgEl("stop", { offset: st[0], "stop-color": st[1] }));
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    var pts = icos.map(function (n) {
      var r = n.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    });

    // start low-left, sweep up through each badge, exit up-right
    var d = "M" + (pts[0].x - 110) + " " + (pts[0].y + 96);
    pts.forEach(function (pt, i) {
      var prev = i ? pts[i - 1] : { x: pts[0].x - 110, y: pts[0].y + 96 };
      var mx = (prev.x + pt.x) / 2;
      d += " C" + mx + " " + prev.y + " " + mx + " " + pt.y + " " + pt.x + " " + pt.y;
    });
    var last = pts[pts.length - 1];
    var ex = last.x + 130, ey = last.y - 92;
    d += " C" + (last.x + 70) + " " + last.y + " " + (ex - 50) + " " + (ey + 30) + " " + ex + " " + ey;

    /* Stacked strokes, widest first, so it reads as a physical conduit
       rather than a drawn line: glow, casing, sheath, ladder rungs,
       bright core, then two packets running at different speeds. */
    ["rail-glow", "rail-case", "rail-dim", "rail-tick", "rail-lit",
     "rail-flow", "rail-flow-2"].forEach(function (cls) {
      svg.appendChild(svgEl("path", { "class": cls, d: d }));
    });

    // junctions: a ring, four spokes and a bright pin
    pts.forEach(function (pt) {
      svg.appendChild(svgEl("circle", { "class": "rail-ring", cx: pt.x, cy: pt.y, r: 13 }));
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(function (v) {
        svg.appendChild(svgEl("line", {
          "class": "rail-spoke",
          x1: pt.x + v[0] * 13, y1: pt.y + v[1] * 13,
          x2: pt.x + v[0] * 19, y2: pt.y + v[1] * 19
        }));
      });
      svg.appendChild(svgEl("circle", { "class": "rail-node", cx: pt.x, cy: pt.y, r: 5 }));
    });
    svg.appendChild(svgEl("path", {
      "class": "rail-arrow",
      d: "M" + (ex - 15) + " " + (ey + 3) + " L" + ex + " " + ey + " L" + (ex - 4) + " " + (ey + 16)
    }));
  }



  /* ============================================================
     6. SCROLL — one Lenis instance, one rAF loop.
        The 3D scene is rendered from inside this same loop so
        scroll position and scene state can never desync.
     ============================================================ */
  function initScroll() {
    var lenis = null;
    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    /* No Lenis on touch devices. It does not smooth touch scrolling by
       default (syncTouch is off, and enabling it is unstable on iOS < 16),
       so on a phone it would add a permanent rAF loop and a set of scroll
       listeners for no visible benefit — native touch scrolling is already
       smooth. This is the single biggest thing keeping phones responsive. */
    if (window.Lenis && !reduced && !coarse) {
      lenis = new Lenis({
        lerp: 0.09,
        anchors: { offset: -70 },
        stopInertiaOnNavigate: true,
        autoToggle: true
        // autoRaf omitted — we drive raf ourselves, so scroll and scene stay in sync.
        // allowNestedScroll omitted on purpose: it walks the DOM tree on every
        // scroll event. The only scrollable child here is the message textarea,
        // which carries data-lenis-prevent instead — same result, no per-event cost.
      });
    }

    var header = $(".hdr");
    var bar    = $(".prog-bar");
    var lastStuck = null;

    function onProgress(p, y) {
      if (window.__setSceneScroll) window.__setSceneScroll(p);
      if (window.__navSync) window.__navSync();
      if (bar) bar.style.transform = "scaleX(" + p + ")";
      // Only touch the class list when the state actually flips; toggling
      // it every frame invalidates style on the header needlessly.
      var stuck = y > 40;
      if (header && stuck !== lastStuck) {
        header.classList.toggle("stuck", stuck);
        lastStuck = stuck;
      }
    }

    if (lenis) {
      // One loop drives both, so they can never disagree about the time.
      requestAnimationFrame(function loop(time) {
        lenis.raf(time);
        onProgress(lenis.progress || 0, lenis.scroll || 0);
        if (window.__renderScene) window.__renderScene(time);
        requestAnimationFrame(loop);
      });
    } else {
      /* Native scrolling. Update on the scroll event rather than every
         frame, so an idle page does no work at all. */
      var ticking = false;
      function update() {
        ticking = false;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var y   = window.pageYOffset || 0;
        onProgress(max > 0 ? y / max : 0, y);
      }
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener("resize", update, { passive: true });
      update();

      /* The 3D still needs a frame loop, but only once it actually exists,
         and it stops for good when the scene shuts itself down. On the
         "off" tier — no WebGL, weak GPU, reduced motion — no loop ever
         starts, so the page costs nothing while sitting still. */
      var waited = 0;
      var wait = setInterval(function () {
        if (window.__renderScene) {
          clearInterval(wait);
          requestAnimationFrame(function sceneLoop(time) {
            if (!window.__renderScene) return;   // scene gave up; stop looping
            window.__renderScene(time);
            requestAnimationFrame(sceneLoop);
          });
        } else if ((waited += 250) > 8000) {
          clearInterval(wait);                    // never going to start
        }
      }, 250);
    }

    // Anchor links: hand them to Lenis when it exists, otherwise
    // let the browser's own smooth scrolling take over.
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { offset: -70 });
        else t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        closeNav();
      });
    });

    return lenis;
  }

  /* ============================================================
     7. REVEAL ON SCROLL
        IntersectionObserver, not a scroll handler — the browser
        does the work off the main thread.
     ============================================================ */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);   // reveal once, then stop watching
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (n) { io.observe(n); });

    // Failsafe. If nothing at all has revealed after two seconds, the
    // observer is not delivering — show everything rather than leave the
    // visitor staring at an empty page.
    setTimeout(function () {
      if (document.querySelector(".reveal.in")) return;
      items.forEach(function (n) { n.classList.add("in"); });
      var t = $(".tagline");
      if (t) t.classList.add("in");
    }, 2000);
  }

  /* ============================================================
     8. CARD TILT — pointer-only, and only on capable devices.
        Touch devices never get this: it costs frames and there
        is no hover state to justify it.
     ============================================================ */
  function initTilt() {
    if (!fine || reduced) return;
    if (document.documentElement.getAttribute("data-tier") === "low") return;

    $$("[data-tilt]").forEach(function (card) {
      var raf = null, rect = null;

      function move(e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width  - 0.5;
        var py = (e.clientY - rect.top)  / rect.height - 0.5;
        if (raf) return;                       // coalesce to one write per frame
        raf = requestAnimationFrame(function () {
          card.style.transform =
            "perspective(900px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" +
            (px * 5).toFixed(2) + "deg) translateY(-4px)";
          card.style.setProperty("--mx", (px * 100 + 50).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100 + 50).toFixed(1) + "%");
          raf = null;
        });
      }
      function leave() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        rect = null;
        card.style.transform = "";
      }

      card.addEventListener("pointermove", move,  { passive: true });
      card.addEventListener("pointerleave", leave, { passive: true });
      window.addEventListener("resize", function () { rect = null; }, { passive: true });
    });
  }

  /* ============================================================
     9. NAVIGATION
     ============================================================ */
  var navOpen = false;
  function closeNav() {
    if (!navOpen) return;
    navOpen = false;
    document.body.classList.remove("nav-open");
    var t = $(".nav-toggle");
    if (t) t.setAttribute("aria-expanded", "false");
  }
  function initNav() {
    var toggle = $(".nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      navOpen = !navOpen;
      document.body.classList.toggle("nav-open", navOpen);
      toggle.setAttribute("aria-expanded", navOpen ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Highlight the section currently in view.
    var links = $$(".nav a[href^='#']");
    var map = {};
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) map[s.id] = a;
    });
    if (!("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("on"); });
        if (map[e.target.id]) map[e.target.id].classList.add("on");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });

    /* Highlight the module for wherever the visitor actually is. At the
       top of the page nothing is intersecting the observer band yet, so
       without this no module is lit on load.

       Offsets are measured once and cached: reading getBoundingClientRect
       for all seven modules on every scroll forced a layout each time and
       tripled the cost of scrolling. */
    var stops = [], current = null;
    function measure() {
      var y = window.pageYOffset || 0;
      var hero = $(".hero");
      stops = $$(".navmod").map(function (a) {
        var sel = a.getAttribute("data-target");
        var sec = document.querySelector(sel);
        if (!sec) return null;
        /* Skip targets that live INSIDE the hero — Core Experience is a
           hero panel with id="experience", and it would otherwise steal
           the highlight while the visitor is still on the hero. */
        if (sel !== "#top" && hero && hero.contains(sec)) return null;
        return { a: a, top: sec.getBoundingClientRect().top + y };
      }).filter(Boolean);
      stops.sort(function (p, q) { return p.top - q.top; });
    }
    function markActive() {
      var y = (window.pageYOffset || 0) + 130, best = stops[0];
      for (var i = 0; i < stops.length; i++) if (stops[i].top <= y) best = stops[i];
      if (!best || best.a === current) return;          // nothing to write
      if (current) current.classList.remove("on");
      best.a.classList.add("on");
      current = best.a;
    }

    measure(); markActive();
    window.__navSync = markActive;

    /* An IntersectionObserver drives this, not a scroll listener and not
       the Lenis loop. Lenis owns scrolling on desktop, so the native
       scroll event never fired and the progress callback was not running
       either — the highlight simply never moved. An observer needs
       neither: the browser tells us when a section crosses the middle
       of the viewport. */
    var band = { rootMargin: "-45% 0px -50% 0px", threshold: 0 };
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var hit = null;
        $$(".navmod").forEach(function (a) {
          if (document.querySelector(a.getAttribute("data-target")) === e.target) hit = a;
        });
        if (!hit || hit === current) return;
        if (current) current.classList.remove("on");
        hit.classList.add("on");
        current = hit;
      });
    }, band);

    stops.forEach(function (st) {
      var sec = document.querySelector(st.a.getAttribute("data-target"));
      if (sec) navIO.observe(sec);
    });

    /* Belt and braces. Between them, Lenis (which swallows the scroll
       event) and IntersectionObserver (whose callbacks are tied to
       paint) leave real gaps where the highlight would simply stop
       tracking. A timer reading scrollY has no such dependency.
       markActive does no layout reads and returns early when nothing
       changed, so this is effectively free. */
    setInterval(markActive, 200);

    var rz;
    window.addEventListener("resize", function () {
      clearTimeout(rz); rz = setTimeout(function () { measure(); markActive(); }, 180);
    }, { passive: true });
  }

  /* ============================================================
     10. ENQUIRY FORM
         Static hosting, so there is no backend. The form composes
         the message and hands it to WhatsApp or the mail client —
         which is also what most of these clients actually prefer.
     ============================================================ */
  function initForm() {
    var form = $("[data-form]");
    if (!form) return;

    function compose() {
      var v = function (n) { return ((form.elements[n] || {}).value || "").trim(); };
      var lines = ["New project enquiry", ""];
      [["Name", "cname"], ["Email", "cmail"], ["Phone", "cphone"],
       ["Project", "ctype"], ["Budget", "cbudget"]].forEach(function (f) {
        var val = v(f[1]);
        if (val) lines.push(f[0] + ": " + val);   // optional fields stay out when blank
      });
      lines.push("", v("cmsg"));
      return lines.join(String.fromCharCode(10));
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      window.open("https://wa.me/" + (S.phoneRaw || "") + "?text=" + encodeURIComponent(compose()),
                  "_blank", "noopener");
    });

    var mailBtn = $("[data-form-mail]", form);
    if (mailBtn) {
      mailBtn.addEventListener("click", function () {
        if (!form.reportValidity()) return;
        window.location.href = "mailto:" + (S.email || "") +
          "?subject=" + encodeURIComponent("Project enquiry") +
          "&body="    + encodeURIComponent(compose());
      });
    }
  }

  /* ============================================================
     BOOT
     ============================================================ */
  /* ---------- ambient motion layers ----------
     One element per effect, each animated with transform or opacity
     only, so the compositor can run them without repainting. They are
     injected rather than written into the markup because on the lowest
     tier they should not exist at all — an element that is never created
     costs nothing, whereas one hidden with display:none still parses. */
  function buildMotion() {
    var tier = fx();
    if (tier === "none") return;
    var rich = tier === "full";

    // the hero backdrop: drifting grid, a scan beam, a breathing glow
    var hero = $(".hero");
    if (hero) {
      var wrap = el("div", "hero-fx");
      wrap.setAttribute("aria-hidden", "true");
      wrap.appendChild(el("span", "hfx-grid"));
      wrap.appendChild(el("span", "hfx-glow"));
      if (rich) {
        wrap.appendChild(el("span", "hfx-beam"));
        wrap.appendChild(el("span", "hfx-beam hfx-beam-2"));
      }
      hero.insertBefore(wrap, hero.firstChild);
    }

    // a beam crossing each readout panel and the transmit console
    var panels = $$(".screen");
    panels.forEach(function (panel) {
      var sweep = el("span", "hud-sweep");
      sweep.setAttribute("aria-hidden", "true");
      panel.insertBefore(sweep, panel.firstChild);
    });
  }

  /* ---------- the hologram ----------
     The portrait is shown as a projected hologram: a dim point-cloud
     mesh, a tonal shading pass and a bright contour wireframe, stacked
     and drifting against each other so the figure reads as having
     depth. All three are pre-rendered by make-hologram.py, because the
     alternative — deriving them in the browser — is exactly the kind of
     per-frame work this site cannot afford.

     The real photograph stays in the DOM underneath. It is what a
     visitor sees if the hologram layers fail to load, and it is what
     the portal resolves to on hover. */
  function buildHologram() {
    var V = (S.PROFILE_IMAGE || "").split("?")[1];
    var q = V ? "?" + V : "";
    var mask = $(".pic-mask");
    if (!mask) return;

    var holo = el("span", "holo");
    holo.setAttribute("aria-hidden", "true");

    ["far", "mid", "edge"].forEach(function (name) {
      var img = new Image();
      img.className = "holo-l holo-" + name;
      img.decoding = "async";
      img.alt = "";
      img.src = "assets/img/holo-" + name + ".webp" + q;
      /* If a layer cannot be fetched, drop the whole hologram rather
         than show a half-built figure — the photograph underneath is a
         better outcome than a floating pair of eyebrows. */
      img.addEventListener("error", function () {
        if (holo.parentNode) holo.parentNode.removeChild(holo);
        mask.classList.add("holo-failed");
      });
      holo.appendChild(img);
    });

    holo.appendChild(el("span", "holo-scan"));
    mask.appendChild(holo);
    mask.classList.add("has-holo");
  }

  /* ---------- the projector ----------
     Rings, cone and emitter core, drawn beneath the portal. The hero
     already fits the viewport to the pixel, so this is positioned out
     of flow and overlaps the base of the portal rather than asking the
     layout for room it does not have. */
  function buildProjector() {
    var wrap = $(".portal-wrap");
    if (!wrap || fx() === "none") return;

    var svg = svgEl("svg", {
      "class": "em-svg", viewBox: "0 0 620 150",
      preserveAspectRatio: "xMidYMax meet", "aria-hidden": "true"
    });
    var defs = svgEl("defs", {});
    var CX = 310, CY = 118;

    /* The cone falls off along its length via one gradient, and across
       its width via nested wedges of decreasing opacity. Because the
       wedges are nested rather than parallel, the feathered band scales
       with the cone, so the edge is tight at the apex and diffuse at
       the mouth without anything being blurred. */
    var cg = svgEl("linearGradient", {
      id: "emCone", gradientUnits: "userSpaceOnUse", x1: 0, y1: CY, x2: 0, y2: 0
    });
    [["0%", "#ddfaff", "1"], ["5%", "#7fe9ff", ".92"], ["20%", "#35d5ff", ".66"],
     ["48%", "#00b0f0", ".34"], ["76%", "#0080d0", ".13"], ["100%", "#0060b0", "0"]]
      .forEach(function (st) {
        cg.appendChild(svgEl("stop", { offset: st[0], "stop-color": st[1], "stop-opacity": st[2] }));
      });
    defs.appendChild(cg);

    /* Rings are lit brighter on the near side than the far side. It is
       a small thing that does most of the work of making the plane read
       as ground rather than as a flat target. */
    var rg = svgEl("linearGradient", {
      id: "emRing", gradientUnits: "userSpaceOnUse", x1: 0, y1: CY - 40, x2: 0, y2: CY + 40
    });
    [["0%", ".32"], ["55%", ".78"], ["100%", "1"]].forEach(function (st) {
      rg.appendChild(svgEl("stop", { offset: st[0], "stop-color": "#4ddcff", "stop-opacity": st[1] }));
    });
    defs.appendChild(rg);
    svg.appendChild(defs);

    // ground grid, converging on the emitter
    var grid = svgEl("g", { "class": "em-grid" });
    for (var i = -6; i <= 6; i++) {
      grid.appendChild(svgEl("line", { x1: CX + i * 13, y1: CY, x2: CX + i * 92, y2: 150 }));
    }
    svg.appendChild(grid);

    // the cone
    [[150, ".05"], [112, ".07"], [78, ".10"], [48, ".16"], [22, ".28"], [7, ".70"]]
      .forEach(function (b) {
        svg.appendChild(svgEl("path", {
          "class": "em-cone", "fill-opacity": b[1],
          d: "M" + CX + " " + CY + " L" + (CX - b[0]) + " 0 L" + (CX + b[0]) + " 0 Z"
        }));
      });

    /* Perspective comes from two things people usually skip: the centre
       drifts upward as rings recede, and they flatten — ry/rx falls from
       .29 to .25. Constant ratios read as concentric circles that some-
       one squashed, not as circles lying on a floor. */
    [[62, 10, 118, 2.0, .85], [122, 17, 116, 1.6, .55],
     [190, 24, 114, 1.3, .34], [264, 30, 111, 1.0, .20]].forEach(function (r, n) {
      svg.appendChild(svgEl("ellipse", {
        "class": "em-ring r" + n, cx: CX, cy: r[2], rx: r[0], ry: r[1],
        "stroke-width": r[3], "stroke-opacity": r[4]
      }));
    });

    // stems rising from the plane, dots at their tips
    [[-238, 22], [-166, 13], [-96, 30], [96, 26], [170, 15], [242, 20]].forEach(function (st, n) {
      var x = CX + st[0];
      var base = CY + Math.abs(st[0]) * 0.098;
      var g = svgEl("g", { "class": "em-stem s" + n });
      g.appendChild(svgEl("line", { x1: x, y1: base, x2: x, y2: base - st[1] }));
      g.appendChild(svgEl("circle", { cx: x, cy: base - st[1], r: 2.6 }));
      svg.appendChild(g);
    });

    // the hot core where the cone meets the plate
    svg.appendChild(svgEl("ellipse", { "class": "em-core", cx: CX, cy: CY, rx: 17, ry: 4 }));
    svg.appendChild(svgEl("ellipse", { "class": "em-core em-core-hot", cx: CX, cy: CY, rx: 7, ry: 1.8 }));

    var host = el("span", "emitter");
    host.setAttribute("aria-hidden", "true");
    host.appendChild(svg);

    /* The pulse rings live OUTSIDE that svg on purpose. Animating a
       transform on a node inside it would re-rasterise the whole
       drawing every frame instead of just moving a cached layer. */
    if (fx() === "full") {
      host.appendChild(el("span", "em-pulse p0"));
      host.appendChild(el("span", "em-pulse p1"));
    } else {
      host.appendChild(el("span", "em-pulse p0"));
    }
    wrap.appendChild(host);
  }

  /* ---------- pause what nobody is looking at ----------
     The page runs a hundred-odd infinite animations, and most of them
     belong to sections that are far below the fold. They were being
     composited continuously regardless, which on a machine with no GPU
     driver is a steady drain for something no one can see.

     animation-play-state costs nothing to toggle and changes no layout,
     so sections are simply parked until they approach the viewport. The
     hero is exempt: it is on screen at load, and pausing it would stall
     the boot sequence. */
  function idleOffscreen() {
    if (!("IntersectionObserver" in window)) return;
    var zones = $$(".sec:not(.hero), .ftr");
    if (!zones.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("off-view", !e.isIntersecting);
      });
    }, { rootMargin: "220px 0px" });

    zones.forEach(function (z) {
      z.classList.add("off-view");
      io.observe(z);
    });
  }

  function boot() {
    document.documentElement.setAttribute("data-fx", effectsBudget());
    buildIdentity();
    buildPic();
    buildNav();
    buildHeroExtras();
    buildOutput();
    buildModules();
    buildConsole();
    buildRingMods();
    portalSweeper();
    buildBits();
    buildHologram();
    buildProjector();
    buildMotion();
    neuralNet();
    initParallax();
    watchWires();
    requestAnimationFrame(drawRail);
    armHolograms();
    runBoot();
    buildServices();
    buildProjects();
    buildProcess();
    initNav();
    initForm();
    buildContact();      // tel / mail / whatsapp links
    buildTransmit();     // the transmit console UI
    buildFooterIcons();
    initReveal();
    initScroll();
    idleOffscreen();
    // One frame late, so scene.js has settled on a tier before we read it.
    requestAnimationFrame(initTilt);
    document.body.classList.add("ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
