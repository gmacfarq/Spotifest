import easyocr
import matplotlib.pyplot as plt

reader = easyocr.Reader(['en']) # need to run only once to load model into memory
result = reader.readtext('static/test.png')

im = plt.imread('static/test.png')
print(im.shape)

fig = plt.figure(figsize=(15, 15))

plt.imshow(im)

for _ in result:
    x = [n[0] for n in _[0]]
    y = [n[1] for n in _[0]]
    plt.fill(x, y, facecolor="none", edgecolor="red", alpha=0.3)
    plt.text(x[0], y[0], _[1], fontsize=15, color="root", va="top")

plt.axis("off")
plt.savefig('easyocr_output.png')
plt.show