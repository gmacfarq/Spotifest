import cv2
import pytesseract
import numpy as np

filename = "static/test.png"


ALLOWED_CHARS = ['.', '\'', '&']

def get_boxes(filestr):
    """Gets list of detected letters and their coordinates in the image (boxes)
    one box: ['ltr', int:top_left_x, int:top_left_y, int:bottom_right_x, int:bottom_right_y]
    """

    file_bytes = np.fromstring(filestr, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
    h, w, _ = img.shape

    boxes = clean_boxes(pytesseract.image_to_boxes(img))
    dim = [h,w]

    return boxes,dim

def clean_boxes(boxes):
    """
    Removes all non ALLOWED_CHARACTERS and non letters from list of detected letters
    """

    return [b.split()[:-1] for b in boxes.splitlines() if b[0].isalnum() or b[0] in ALLOWED_CHARS]


#KEEPING THIS JUST IN CASE FOR NOW
#----------------------------------
# read the image and get the dimensions
# img = cv2.imread(filename)
# h, w, _ = img.shape  # assumes color image

# # run tesseract, returning the bounding boxes
# boxes = pytesseract.image_to_boxes(img)
# breakpoint

#print(pytesseract.image_to_string(img))  # print identified text

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
