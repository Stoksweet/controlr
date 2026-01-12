const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { mouse, screen, Button, Point, left, right, up, down } = require("@nut-tree-fork/nut-js");

// Serve static files from public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle mouse move
    socket.on('mouse_move', async (data) => {
        try {
            const { x, y, width, height } = data;
            // Map coordinates to screen size
            // We assume the client sends relative coordinates (0-1)
            const screenWidth = await screen.width();
            const screenHeight = await screen.height();

            const targetX = x * screenWidth;
            const targetY = y * screenHeight;

            await mouse.setPosition(new Point(targetX, targetY));
        } catch (e) {
            console.error('Error moving mouse:', e);
        }
    });

    // Handle mouse click
    socket.on('mouse_click', async () => {
        try {
            await mouse.click(Button.LEFT);
            console.log('Clicked');
        } catch (e) {
            console.error('Error clicking:', e);
        }
    });

    // Handle mouse scroll
    socket.on('mouse_scroll', async (data) => {
        try {
            const { dy } = data; // dy > 0 for up, dy < 0 for down
            if (dy > 0) {
                await mouse.scrollUp(Math.abs(dy) * 50); // Scale factor
            } else {
                await mouse.scrollDown(Math.abs(dy) * 50);
            }
        } catch (e) {
            console.error('Error scrolling:', e);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
