import cv2
import pytesseract
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np

filename = "static/test.png"

# read the image and get the dimensions
img = cv2.imread(filename)
h, w, _ = img.shape  # assumes color image

# run tesseract, returning the bounding boxes
boxes = pytesseract.image_to_boxes(img)

print(pytesseract.image_to_string(img))  # print identified text

# draw the bounding boxes on the image
for b in boxes.splitlines():
    b = b.split()
    cv2.rectangle(
        img, ((int(b[1]), h - int(b[2]))), ((int(b[3]), h - int(b[4]))), (0, 255, 0), 2
    )

height = 500
weight = 500
channel = 3
save_img = Image.fromarray(img, "RGB")

image_filename = "opengenus_image.jpeg"
save_img.save(image_filename)

# window_name = "image"

# cv2.imshow(window_name, img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
