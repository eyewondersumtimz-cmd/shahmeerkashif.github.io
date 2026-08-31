r"""
swap-photo.py — replace the portrait used across the whole site.

Usage:
    python swap-photo.py                  # uses the newest image in Downloads
    python swap-photo.py path\to\pic.jpg  # or point it at a specific file

It cuts the background out, crops square on the face, and writes both
assets/img/shahmeer.webp and .png — which is what the hero portal and the
about dossier both read through PROFILE_IMAGE in data.js. Nothing else
needs editing.
"""
import os, sys, glob
import numpy as np
from PIL import Image
from rembg import remove, new_session

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "assets", "img")
DOWNLOADS = os.path.join(os.path.expanduser("~"), "Downloads")


def newest_image():
    pats = ("*.jpg", "*.jpeg", "*.png", "*.webp")
    files = []
    for p in pats:
        files += glob.glob(os.path.join(DOWNLOADS, p))
    # ignore anything already inside the project
    files = [f for f in files if "portfolio" not in f.replace("/", os.sep).split(os.sep)]
    if not files:
        sys.exit("No images found in Downloads. Save the photo there first.")
    return max(files, key=os.path.getmtime)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else newest_image()
    print("source :", src)

    img = Image.open(src).convert("RGB")
    print("size   :", img.size)

    # u2net, not u2net_human_seg: on these photos the general model has
    # consistently produced the cleaner mask.
    cut = remove(img, session=new_session("u2net")).convert("RGBA")
    alpha = np.array(cut.getchannel("A"))

    # sanity check the mask before trusting it
    opaque = (alpha > 40).mean()
    print("opaque : %.1f%% of frame" % (opaque * 100))
    if opaque > 0.92:
        print("WARNING: almost nothing was removed — check the result by eye.")

    ys, xs = np.where(alpha > 40)
    if not len(ys):
        sys.exit("The cutout came back empty; try a different photo.")
    top, bot = ys.min(), ys.max()

    # centre the crop on the head, not the shoulders
    head_end = top + int((bot - top) * 0.40)
    hx = np.where(alpha[top:head_end] > 40)[1]
    cx = int(np.median(hx)) if len(hx) else cut.width // 2
    side = int((bot - top) * 0.80)
    x0, y0 = cx - side // 2, top - int(side * 0.09)

    # pad so the crop can never clamp against an edge and go off-centre
    pad = side
    canvas = Image.new("RGBA", (cut.width + 2 * pad, cut.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(cut, (pad, pad))
    sq = canvas.crop((x0 + pad, y0 + pad, x0 + pad + side, y0 + pad + side))
    sq = sq.resize((820, 820), Image.LANCZOS)

    os.makedirs(OUT, exist_ok=True)
    png  = os.path.join(OUT, "shahmeer.png")
    webp = os.path.join(OUT, "shahmeer.webp")
    sq.save(png, optimize=True)
    sq.save(webp, format="WEBP", quality=90, method=6)

    print("wrote  : %s (%.0f KB)" % (webp, os.path.getsize(webp) / 1024))
    print("wrote  : %s (%.0f KB)" % (png, os.path.getsize(png) / 1024))
    print("\nDone. Hard-refresh the site with Ctrl+Shift+R.")


if __name__ == "__main__":
    main()
