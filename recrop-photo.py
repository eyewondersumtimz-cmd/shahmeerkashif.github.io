r"""
recrop-photo.py — re-frame the portrait without re-cutting the background.

The background cutout is the slow part, so it is cached. This script only
changes how tightly the square is cropped around the head, which is the
thing that actually needed tuning: the portal shows the picture inside a
circle, so a wide standing shot leaves the face too small to read.

    python recrop-photo.py            # rewrite the site portrait
    python recrop-photo.py --preview  # write candidate crops instead

`fill` is the head height as a fraction of the square. The site is built
around 0.45 — matching the framing of the portrait this replaced. Drop the
cache file to re-cut after swapping _source-portrait.jpg.
"""
import os, sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

SRC   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img", "_source-portrait.jpg")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img", "_cutout-cache.png")

if os.path.exists(CACHE):
    cut = Image.open(CACHE).convert("RGBA")
else:
    cut = remove(Image.open(SRC).convert("RGB"), session=new_session("u2net")).convert("RGBA")
    cut.save(CACHE)

# head geometry measured on the 1080x1080 source
HAIR_TOP, CHIN, FACE_CX = 85, 315, 570
HEAD = CHIN - HAIR_TOP

def crop(fill, headroom, out, size=820):
    """fill = head height as a fraction of the square; headroom = gap above the hair."""
    side = int(round(HEAD / fill))
    x0   = FACE_CX - side // 2
    y0   = HAIR_TOP - int(round(side * headroom))
    pad  = side
    canvas = Image.new("RGBA", (cut.width + 2*pad, cut.height + 2*pad), (0,0,0,0))
    canvas.paste(cut, (pad, pad))
    sq = canvas.crop((x0+pad, y0+pad, x0+pad+side, y0+pad+side)).resize((size, size), Image.LANCZOS)
    sq.save(out)
    print("%-22s fill %.0f%%  side %dpx  upscale %.2fx" % (os.path.basename(out), fill*100, side, size/side))
    return sq

FILL, HEADROOM = 0.45, 0.10

if __name__ == "__main__":
    if "--preview" in sys.argv:
        for f in (0.40, 0.45, 0.52):
            sq = crop(f, HEADROOM, "cand-%02d.png" % int(f * 100))
            bg = Image.new("RGBA", sq.size, (5, 15, 28, 255))
            bg.alpha_composite(sq)
            bg.convert("RGB").save("cand-%02d-dark.png" % int(f * 100))
        print("")
        print("Candidates written next to this script. Pick one, then set FILL.")
    else:
        out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")
        sq = crop(FILL, HEADROOM, os.path.join(out, "shahmeer.png"))
        sq.save(os.path.join(out, "shahmeer.webp"), format="WEBP", quality=90, method=6)
        print("Wrote both portraits. Bump ?v= in data.js so browsers refetch.")
