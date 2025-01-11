import cv2
import mediapipe
import pyautogui

capture_hands = mediapipe.solutions.hands.Hands()
drawing_option = mediapipe.solutions.drawing_utils
camera = cv2.VideoCapture(0)

# Get screen size for scaling
screen_width, screen_height = pyautogui.size()

while True:
    _, image = camera.read()
    image = cv2.flip(image, 1)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    output_hands = capture_hands.process(rgb_image)
    all_hands = output_hands.multi_hand_landmarks
    image_height, image_width, _ = image.shape

    if all_hands:
        for hand in all_hands:
            drawing_option.draw_landmarks(image, hand)
            one_hand_landmarks = hand.landmark
            thumb_tip = None
            index_tip = None

            for id, lm in enumerate(one_hand_landmarks):
                x = int(lm.x * image_width)
                y = int(lm.y * image_height)

                # Identify thumb tip and index finger tip
                if id == 4:  # Thumb tip
                    thumb_tip = (x, y)
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)
                if id == 8:  # Index finger tip
                    index_tip = (x, y)
                    cv2.circle(image, (x, y), 10, (0, 255, 255), -1)

                # Move the mouse using the index finger
                if id == 8:  # Track index finger for mouse movement
                    mouse_x = int(lm.x * screen_width)
                    mouse_y = int(lm.y * screen_height)
                    pyautogui.moveTo(mouse_x, mouse_y)

            # Check if thumb and index finger are close (click simulation)
            if thumb_tip and index_tip:
                distance = ((thumb_tip[0] - index_tip[0]) ** 2 + (thumb_tip[1] - index_tip[1]) ** 2) ** 0.5
                if distance < 50:  # Adjust threshold for click
                    pyautogui.click()
                    pyautogui.sleep(0.2)  # Prevent multiple clicks in a short time

    cv2.imshow("Hand movement video capture", image)
    key = cv2.waitKey(100)
    if key == 27:  # Press ESC to exit
        break

camera.release()
cv2.destroyAllWindows()
