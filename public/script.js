const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const socket = io();

// State variables
let lastClickTime = 0;
const CLICK_COOLDOWN = 500; // ms
let lastScrollY = null;
const SCROLL_THRESHOLD = 0.02; // Movement threshold for scroll

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Only track the first hand found
        const landmarks = results.multiHandLandmarks[0];

        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
            { color: '#00FF00', lineWidth: 5 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

        processGestures(landmarks);
    }
    canvasCtx.restore();
}

function processGestures(landmarks) {
    // Landmarks: 4 = Thumb Tip, 8 = Index Tip, 12 = Middle Tip
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const wrist = landmarks[0];

    // Calculate distances
    const distThumbIndex = calculateDistance(thumbTip, indexTip);
    const distThumbMiddle = calculateDistance(thumbTip, middleTip);

    // Thresholds (normalized coordinates, 0-1)
    const CLICK_THRESHOLD = 0.05;
    const SCROLL_PINCH_THRESHOLD = 0.05;

    const now = Date.now();

    // 1. Scroll: Middle + Thumb Pinch
    if (distThumbMiddle < SCROLL_PINCH_THRESHOLD) {
        // Scroll mode
        // Use Index finger Y to control scroll
        if (lastScrollY !== null) {
            const dy = lastScrollY - indexTip.y; // Inverted Y because image is Y-down
            if (Math.abs(dy) > 0.005) { // Small deadzone
                socket.emit('mouse_scroll', { dy: dy * 10 }); // multiplier for speed
            }
        }
        lastScrollY = indexTip.y;

        // Show visual feedback for scrolling
        canvasCtx.fillStyle = "blue";
        canvasCtx.beginPath();
        canvasCtx.arc(indexTip.x * canvasElement.width, indexTip.y * canvasElement.height, 20, 0, 2 * Math.PI);
        canvasCtx.fill();

    } else {
        lastScrollY = null;

        // 2. Click: Index + Thumb Pinch
        if (distThumbIndex < CLICK_THRESHOLD) {
            if (now - lastClickTime > CLICK_COOLDOWN) {
                socket.emit('mouse_click');
                lastClickTime = now;

                // Visual feedback for click
                canvasCtx.fillStyle = "red";
                canvasCtx.beginPath();
                canvasCtx.arc(indexTip.x * canvasElement.width, indexTip.y * canvasElement.height, 20, 0, 2 * Math.PI);
                canvasCtx.fill();
            }
        } else {
            // 3. Move: Open Hand (Implied if not pinching)
            // Use Index Tip or Wrist? User said "moves while open".
            // Let's use Index MCP (knuckle) or Wrist for stability, or midpoint of palm?
            // Using Index Tip is most intuitive for pointing, but might jitter if fingers wiggle.
            // Using Index MCP (Landmark 5)
            const indexMCP = landmarks[5];

            // Send coordinates
            // Mirror x coordinate because webcam is mirrored
            // But canvas is already processed? MediaPipe usually gives 0-1 normalized
            // We usually want to mirror the X for intuitive control (left hand moves left)

            // IMPORTANT: The nut.js mapping expects 0-1.
            // If the video is mirrored in UI (transform: scaleX(-1)),
            // we should interpret the x coordinate accordingly.
            // MediaPipe output x is 0(left) to 1(right) of the image.
            // If I move my hand to my right, it appears on the right of the image (if not mirrored).
            // Usually we mirror the video display, but the coordinates remain 0-1 relative to original image.

            // Let's assume standard selfie mode: I move right, image moves left? No.
            // Default: I move right -> Image shows me moving right (if non-mirrored).
            // But we usually want mirror: I move right -> Image shows me moving right (like a mirror).

            // To control mouse:
            // Move hand Right -> Mouse goes Right.
            // Move hand Up -> Mouse goes Up.

            // So simply passing x, y should work, BUT:
            // If using rear camera vs front camera metaphors.
            // Let's stick to: x = 1.0 - landmarks.x (Mirroring for mouse control)

            const targetX = 1.0 - indexTip.x;
            const targetY = indexTip.y;

            socket.emit('mouse_move', { x: targetX, y: targetY });
        }
    }
}

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();
