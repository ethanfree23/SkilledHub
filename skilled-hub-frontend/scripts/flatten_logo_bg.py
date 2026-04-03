"""Normalize logo PNG backgrounds to exact hex (navbar: white, login: #F7F7F7)."""
from PIL import Image


def flatten_background(im: Image.Image, target_rgb: tuple[int, int, int]) -> Image.Image:
    im = im.copy().convert("RGBA")
    w, h = im.size
    px = im.load()
    tr, tg, tb = target_rgb
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            mx, mn = max(r, g, b), min(r, g, b)
            if mn >= 220 and (mx - mn) <= 28:
                px[x, y] = (tr, tg, tb, a)
    return im


if __name__ == "__main__":
    base = Image.open("public/techflash-logo.png")
    flatten_background(base, (247, 247, 247)).save(
        "public/techflash-logo-login.png", optimize=True
    )
    flatten_background(base, (255, 255, 255)).save(
        "public/techflash-logo.png", optimize=True
    )
    print("Wrote public/techflash-logo-login.png and public/techflash-logo.png")
