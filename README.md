# Controlr 🖐️🖱️

Controlr is a web-based application that allows you to control your computer's mouse using hand gestures. It leverages MediaPipe's powerful hand tracking in the browser and sends commands to a Node.js server to perform system-level mouse actions using `nut.js`.

## ✨ Features

- **Smooth Movement**: Track your hand to move the cursor precisely.
- **Left Click**: Perform clicks with a simple pinch gesture.
- **Vertical Scrolling**: Scroll up and down with dedicated gestures.
- **Real-time Feedback**: Visual overlays show exactly what the hand tracker sees.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), MediaPipe Hands API.
- **Backend**: Node.js, Express, Socket.io.
- **System Control**: [@nut-tree-fork/nut-js](https://github.com/nut-tree/nut.js) for desktop automation.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A webcam
- **Linux Users**:
  - `libXtst` is required. On Ubuntu/Debian: `sudo apt-get install libxtst-dev`
  - **Note**: `nut.js` currently only supports **X11**. If you are on Wayland, you may need to switch to an X11 session for mouse control to work.
- **macOS Users**: Accessibility permissions for the terminal/IDE running the server.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd controlr
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   node server.js
   ```

4. **Open the application**:
   Navigate to `http://localhost:3000` in your web browser.

## 🎮 Gestures Guide

| Action | Gesture |
| :--- | :--- |
| **Move Mouse** | Open your hand and move it. The cursor follows your index finger tip. |
| **Left Click** | Pinch your **Index Finger** and **Thumb** together. |
| **Scroll** | Pinch your **Middle Finger** and **Thumb** together, then move your **Index Finger** up or down. |

## ⚙️ Configuration

You can adjust thresholds for gestures in `public/script.js`:

- `CLICK_THRESHOLD`: Distance between fingers to trigger a click.
- `SCROLL_PINCH_THRESHOLD`: Distance between fingers to enter scroll mode.
- `CLICK_COOLDOWN`: Time in milliseconds between consecutive clicks.

## 🛡️ License

This project is licensed under the ISC License.
