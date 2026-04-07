"""Normalize logo PNGs: navbar asset uses exact #FFFFFF; can rebuild from login asset."""
from PIL import Image


def flatten_pure_white_nav(im: Image.Image) -> Image.Image:
    """Force neutral / near-white background pixels to exact #FFFFFF (no #FEFEFE / #FAFAFB drift)."""
    im = im.copy().convert("RGBA")
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            if mn >= 228 and (mx - mn) <= 35:
                px[x, y] = (255, 255, 255, a)
            elif r >= 252 and g >= 252 and b >= 252 and (r, g, b) != (255, 255, 255):
                px[x, y] = (255, 255, 255, a)
    return im


def login_to_navbar(src: Image.Image) -> Image.Image:
    im = src.copy().convert("RGBA")
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if (r, g, b) == (247, 247, 247):
                px[x, y] = (255, 255, 255, a)
    return im


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--nav-only":
        path = "public/techflash-logo.png"
        flatten_pure_white_nav(Image.open(path)).save(path, optimize=True)
        print("Flattened background to #FFFFFF:", path)
    else:
        base = Image.open("public/techflash-logo-login.png")
        nav = flatten_pure_white_nav(login_to_navbar(base))
        nav.save("public/techflash-logo.png", optimize=True)
        print("Wrote public/techflash-logo.png from login asset + pure white flatten")

