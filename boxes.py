import cv2
import pytesseract
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np

filename = "static/test.png"

# read the image and get the dimensions
# img = cv2.imread(filename)
# h, w, _ = img.shape  # assumes color image

# # run tesseract, returning the bounding boxes
# boxes = pytesseract.image_to_boxes(img)
# breakpoint

#print(pytesseract.image_to_string(img))  # print identified text
ALLOWED_CHARACTERS = ['.', '\'']

def get_boxes(filestr):
    file_bytes = np.fromstring(filestr, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
    h, w, _ = img.shape

    #print(pytesseract.image_to_string(img))

    boxes = pytesseract.image_to_boxes(img)
    boxes = [b.split()[:-1] for b in boxes.splitlines() if b[0].isalnum() or b[0] in ALLOWED_CHARACTERS]

    return boxes


# height = 500
# weight = 500
# channel = 3
# save_img = Image.fromarray(img, "RGB")

# image_filename = "opengenus_image.jpeg"
# save_img.save(image_filename)

# window_name = "image"

# cv2.imshow(window_name, img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
