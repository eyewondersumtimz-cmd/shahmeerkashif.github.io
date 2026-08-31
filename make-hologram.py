r"""
make-hologram.py — turn the portrait cutout into a projected hologram.

The look is a wireframe/point-cloud figure: bright cyan contours tracing
the shape, a dimmer speckled mesh filling the volume, horizontal scan
banding through the whole thing. The reference does this with a real 3D
render; we cannot, because this site has to stay smooth on a machine with
no GPU driver. So the expensive part is done here, once, offline, and the
page ships flat images that cost nothing to draw.

Three layers come out, so the page can parallax them against each other
and read as having depth:

    holo-far.webp    the dim mesh fill    (moves least)
    holo-mid.webp    volume shading       (moves a little)
    holo-edge.webp   bright contours      (moves most, sits in front)

    python make-hologram.py            # rebuild all three
    python make-hologram.py --preview  # also write a composite to eyeball

Tunables are the constants below. The failure mode to watch for is the
face dissolving into noise: DOT_STEP too small at display size turns the
dots into mush, and EDGE_GAIN too low loses the eyes and jawline, which
are the two things that make the portrait readable as a person.
"""
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "assets", "img")
SRC = os.path.join(IMG, "shahmeer.png")

SIZE = 820

# The portal draws the picture at roughly 258 CSS px, so about 520 device
# px on a 2x screen. Dot spacing is chosen against THAT, not against the
# source: at a 9px step the dots land ~5px apart on screen, which still
# reads as discrete points instead of a solid smear.
DOT_STEP = 9
DOT_MAX_R = 2.9
EDGE_GAIN = 2.6
SCAN_PERIOD = 4          # source px between scan bands
SCAN_DEPTH = 0.62        # how dark the gaps between bands go
DOT_FLOOR = 0.22         # mesh brightness in unlit parts of the figure
EDGE_FLOOR = 0.10        # below this, Sobel response is hair noise, not contour

# the palette the rest of the site already uses
DIM = np.array([0, 120, 190], dtype=float)
MID = np.array([0, 200, 255], dtype=float)
HOT = np.array([190, 246, 255], dtype=float)


def load():
    im = Image.open(SRC).convert("RGBA").resize((SIZE, SIZE), Image.LANCZOS)
    a = np.asarray(im, dtype=float) / 255.0
    rgb, alpha = a[..., :3], a[..., 3]
    lum = rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114
    return lum, alpha


def stretch(lum, alpha):
    """Pull contrast out of the subject only.

    The cutout is mostly a dark jacket against transparency; measuring
    levels over the whole frame would be dominated by empty pixels and
    leave the figure nearly flat."""
    inside = lum[alpha > 0.5]
    if inside.size == 0:
        return lum
    lo, hi = np.percentile(inside, 2), np.percentile(inside, 98)
    if hi - lo < 1e-3:
        return lum
    return np.clip((lum - lo) / (hi - lo), 0.0, 1.0)


def sobel(x):
    p = np.pad(x, 1, mode="edge")
    gx = (-p[:-2, :-2] + p[:-2, 2:]
          - 2 * p[1:-1, :-2] + 2 * p[1:-1, 2:]
          - p[2:, :-2] + p[2:, 2:])
    gy = (-p[:-2, :-2] - 2 * p[:-2, 1:-1] - p[:-2, 2:]
          + p[2:, :-2] + 2 * p[2:, 1:-1] + p[2:, 2:])
    return np.hypot(gx, gy)


def silhouette_edge(alpha):
    """The outline of the cutout itself.

    Luminance edges alone lose the figure against the empty background,
    because there is no gradient to detect where the subject simply
    stops. This puts the missing contour back."""
    return np.clip(sobel(alpha) * 1.4, 0.0, 1.0)


def colorize(intensity, alpha):
    """Ramp intensity through dim -> mid -> hot cyan.

    Two segments rather than one keeps the midtones saturated; a single
    lerp from dim to hot washes the whole figure out to pale blue."""
    i = np.clip(intensity, 0.0, 1.0)[..., None]
    lower = DIM + (MID - DIM) * (i / 0.6)
    upper = MID + (HOT - MID) * ((i - 0.6) / 0.4)
    rgb = np.where(i < 0.6, lower, upper)
    out = np.zeros(intensity.shape + (4,), dtype=np.uint8)
    out[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out[..., 3] = np.clip(i[..., 0] * alpha * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def dot_field(lum, alpha):
    """Stamp a dot per grid cell, sized and lit by local brightness.

    Radii are quantised into a few buckets so this is a handful of
    vectorised passes instead of tens of thousands of draw calls."""
    field = np.zeros((SIZE, SIZE), dtype=float)
    ys = np.arange(0, SIZE, DOT_STEP)
    xs = np.arange(0, SIZE, DOT_STEP)
    gy, gx = np.meshgrid(ys, xs, indexing="ij")

    # A floor inside the silhouette. Keying purely on luminance meshes
    # the face and leaves the dark jacket bare, which reads as a missing
    # chunk of the volume rather than a shadowed part of it.
    inside = alpha[gy, gx] > 0.5
    b = alpha[gy, gx] * (DOT_FLOOR + (1.0 - DOT_FLOOR) * lum[gy, gx])
    gy, gx, b = gy[inside], gx[inside], b[inside]

    radii = np.clip(0.6 + b * DOT_MAX_R, 0.6, DOT_MAX_R)
    buckets = np.round(radii).astype(int)

    for r in np.unique(buckets):
        sel = buckets == r
        yy, xx, bb = gy[sel], gx[sel], b[sel]
        rr = int(max(r, 1))
        for dy in range(-rr, rr + 1):
            for dx in range(-rr, rr + 1):
                if dx * dx + dy * dy > rr * rr:
                    continue
                ty, tx = yy + dy, xx + dx
                ok = (ty >= 0) & (ty < SIZE) & (tx >= 0) & (tx < SIZE)
                np.maximum.at(field, (ty[ok], tx[ok]), bb[ok])
    return field


def scan_bands(lum):
    rows = np.arange(SIZE)[:, None]
    band = ((rows % SCAN_PERIOD) < (SCAN_PERIOD // 2)).astype(float)
    return lum * (1.0 - SCAN_DEPTH + SCAN_DEPTH * band)


def main():
    lum_raw, alpha = load()
    lum = stretch(lum_raw, alpha)

    # --- far: the dim mesh filling the volume ---
    far = dot_field(lum, alpha) * 0.62

    # --- mid: smooth tone, the volume shading ---
    # The scan banding used to be baked in here. It is now a CSS
    # repeating-gradient over the top instead: free, animatable, and it
    # left this layer a smooth image that compresses to a third the size.
    mid = lum * 0.55 * alpha

    # --- edge: the bright wireframe ---
    e = sobel(lum) * alpha
    if e.max() > 0:
        e = e / e.max()
    e[e < EDGE_FLOOR] = 0.0
    edge = np.clip((e - EDGE_FLOOR) / (1.0 - EDGE_FLOOR) * EDGE_GAIN, 0.0, 1.0)
    edge = np.maximum(edge, silhouette_edge(alpha))
    edge = np.clip(edge, 0.0, 1.0)

    layers = {"holo-far": far, "holo-mid": mid, "holo-edge": edge}
    for name, data in layers.items():
        img = colorize(data, np.ones_like(alpha) if name == "holo-edge" else alpha)
        path = os.path.join(IMG, name + ".webp")
        img.save(path, format="WEBP", quality=72 if name == "holo-mid" else 88, method=6)
        print("%-10s %6.0f KB   peak %.2f" % (name, os.path.getsize(path) / 1024, data.max()))

    if "--preview" in sys.argv:
        base = Image.new("RGBA", (SIZE, SIZE), (4, 12, 24, 255))
        for name in ("holo-far", "holo-mid", "holo-edge"):
            base.alpha_composite(Image.open(os.path.join(IMG, name + ".webp")).convert("RGBA"))
        out = os.path.join(HERE, "holo-preview.png")
        base.convert("RGB").save(out)
        print("preview  ->", out)


if __name__ == "__main__":
    main()
