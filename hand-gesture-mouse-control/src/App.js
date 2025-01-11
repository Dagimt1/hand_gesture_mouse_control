// React App for Hand Gesture Mouse Control with Intuitive UI
import React, { useRef, useEffect } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks, HAND_CONNECTIONS } from "@mediapipe/drawing_utils";

const HandGestureApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");

      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.save();
      canvasCtx.scale(1, 1); // Do not flip the canvas
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks) => {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 1,
            radius: 5, // Adjusted for better visibility
          });

          // Get index finger tip and thumb tip coordinates
          const indexTip = landmarks[8];
          const thumbTip = landmarks[4];

          // Calculate position for the custom cursor
          const screenX = indexTip.x * window.innerWidth;
          const screenY = indexTip.y * window.innerHeight;

          // Move custom cursor
          const cursorElement = document.getElementById("custom-cursor");
          if (cursorElement) {
            cursorElement.style.left = `${screenX}px`;
            cursorElement.style.top = `${screenY}px`;
          }

          // Simulate click when thumb and index finger tips are close
          const distance = Math.sqrt(
            Math.pow(indexTip.x - thumbTip.x, 2) +
              Math.pow(indexTip.y - thumbTip.y, 2)
          );
          if (distance < 0.05) {
            if (cursorElement) {
              cursorElement.style.backgroundColor = "red"; // Change color to indicate click
            }
            setTimeout(() => {
              if (cursorElement) {
                cursorElement.style.backgroundColor = "black";
              }
            }, 200);
          }
        });
      }
      canvasCtx.restore();
    });

    const videoElement = videoRef.current;
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    return () => {
      hands.close();
      camera.stop();
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        color: "#333",
      }}
    >
      <header
        style={{
          padding: "20px",
          borderBottom: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Hand Gesture Mouse Control</h1>
        <p style={{ fontSize: "1.2rem", margin: "10px 0" }}>
          Control your cursor using simple hand gestures.
        </p>
      </header>

      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "800px",
            height: "600px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <video
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
            autoPlay
            muted
          ></video>
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></canvas>
          <div
            id="custom-cursor"
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              backgroundColor: "black",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          ></div>
        </div>

        <p style={{ fontSize: "1.1rem", maxWidth: "600px" }}>
          This personal project showcases cutting-edge hand tracking technology to
          detect your hand movements in real-time. Move your cursor by pointing
          your index finger and simulate a click by bringing your thumb and
          index finger together.
        </p>
      </main>

      <footer
        style={{
          marginTop: "40px",
          padding: "10px",
          fontSize: "0.9rem",
          color: "#777",
        }}
      >
        &copy; 2025 Hand Gesture Control. Powered by MediaPipe.
      </footer>
    </div>
  );
};

export default HandGestureApp;
