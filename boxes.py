import cv2
import pytesseract
import numpy as np

filename = "static/test.png"


SPACE_CHARS = ['*', '-', '°', '»', '~', ':', '«', '©', '_']

def get_boxes(filestr):
    """Gets list of detected letters and their coordinates in the image (boxes)
    one box: ['ltr', int:top_left_x, int:top_left_y, int:bottom_right_x, int:bottom_right_y]
    """

    file_bytes = np.fromstring(filestr, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
    h, w, _ = img.shape
    data = pytesseract.image_to_data(img)
    boxes = clean_boxes(data)
    dim = [h,w]

    for b in boxes:
        for i in b[-1]:
            if i in SPACE_CHARS:
                b[-1] = b[-1].replace(i, '')



    return boxes,dim

def clean_boxes(data):
    """
    Removes all non ALLOWED_CHARACTERS and non letters from list of detected letters
    """
    return [b.split()[6:] for b in data.splitlines() if b.split()[-1] != '-1' and not str(b.split()[-1]) in SPACE_CHARS]


def get_text(data):
    """
    Returns the text detected by tesseract
    """
    return [b.split()[-1] for b in data.splitlines()]


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
