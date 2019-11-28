# -*- coding: utf-8 -*-
"""
Created on Sun Oct 27 16:22:46 2019

Use OpenCV to take filter image from webcam.s

TO DO: ADD FADE AND LINE EFFECTS
AND BACKGROUND SHIMMER

@author: Jacob
"""

import numpy as np
import cv2   # opencv

# webcam_resolution
x_length = 1280
y_length = 720

# black screen
blank_screen = np.zeros((y_length,x_length,3))

# How many frames to freeze on screen
N_frames_stored = 3
frame_store = [blank_screen]*N_frames_stored
store_frequency = 10

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH,x_length);
cap.set(cv2.CAP_PROP_FRAME_HEIGHT,y_length);

ret, frame = cap.read()
blank_screen = np.zeros(frame.shape)
print(frame.shape)



def colour_change(mask, rgb):
    """Set the colour of the edges.
    Input: mask image, rgb colour
    Output: rgb image
    """
    image_size = mask.shape
    new_image = np.zeros((*image_size, 3))
    locations = np.transpose(np.nonzero(mask))
    for pos in locations:
        new_image[pos[0], pos[1], :] = rgb

    return new_image

#def fade(frame_count_start, frame_count):
#    n_frames_since_print = frame_count - frame_count_start
#    alpha = np.exp(- n_frames_since_print/50)
#    return alpha

colour_palette = [[255,0,0], [0,255,0], [0,0,255], [0,255,255],[255,0,255],[255,255,0],[255,255,255]]

frame_count = 1
store_count = 0

while(True):
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    # flip image for mirror
    frame = cv2.flip(frame, 1);
    
    # find edges
    edges = cv2.Canny(frame,100,150)
    
    # change colour
    edges = colour_change(edges, colour_palette[store_count%len(colour_palette)])
    
    # blur
    #edges = cv2.GaussianBlur(edges, (3,3), sigmaX=10)
    
    if frame_count%store_frequency == 0:
        frame_store[:N_frames_stored - 1] = frame_store[1:N_frames_stored]
        frame_store[N_frames_stored - 1]  = edges
        store_count += 1


    total_frames = np.array(frame_store + edges)
    
    
    frame = np.amax(total_frames, axis=0)
    
 #   frame = cv2.resize(frame, None, fx=2, fy=2, interpolation=cv2.INTER_AREA)

    
    cv2.imshow('frame', frame)
    

    # Press q to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):  # pres 'q' to stop webcam
        break
    
    frame_count += 1
    
    
# When everything done, release the capture
cap.release()
cv2.destroyAllWindows()


