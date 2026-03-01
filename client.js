document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');
  const colorInput = document.getElementById('color-input');
  const brushSizeInput = document.getElementById('brush-size');
  const brushSizeDisplay = document.getElementById('brush-size-display');
  const clearButton = document.getElementById('clear-button');
  const connectionStatus = document.getElementById('connection-status');
  const userCount = document.getElementById('user-count');

  let localBoardState = [];

  function resizeCanvas() {
    // TODO: Set the canvas width and height based on its parent element


    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Redraw the canvas with the current board state when resized
    // TODO: Call redrawCanvas() function
    redrawCanvas(localBoardState);
  }

  // Initialize canvas size
  // TODO: Call resizeCanvas()
  resizeCanvas();

  // Handle window resize
  // TODO: Add an event listener for the 'resize' event that calls resizeCanvas
  window.addEventListener("resize", resizeCanvas);
  // Drawing variables
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Connect to Socket.IO server
  // TODO: Create a socket connection to the server at 'http://localhost:3000'
  const socket = io("http://localhost:3000");
  // TODO: Set up Socket.IO event handlers
  socket.on("connect", () => {
    connectionStatus.textContent = "Connected";
  });

  socket.on("disconnect", () => {
    connectionStatus.textContent = "Disconnected";
  });

  socket.on("currentUsers", (count) => {
    userCount.textContent = count;
  });

  socket.on("boardState", (state) => {
    // Server sends full history when you connect
    localBoardState = Array.isArray(state) ? state : [];
    redrawCanvas(localBoardState);
  });

  socket.on("draw", (drawData) => {
    // Only draw when receiving from server (sync for everyone)
    localBoardState.push(drawData);

    drawLine(
      drawData.x0,
      drawData.y0,
      drawData.x1,
      drawData.y1,
      drawData.color,
      drawData.size
    );
  });

  socket.on("clear", () => {
    localBoardState = [];
    redrawCanvas(localBoardState);
  });
  // Canvas event handlers
  // TODO: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
  // Canvas mouse event handlers
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  // Touch support (optional)
  // TODO: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", stopDrawing, { passive: false });
  canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

  // Clear button event handler
  // TODO: Add event listener for the clear button
  clearButton.addEventListener("click", clearCanvas);
  // Update brush size display
  // TODO: Add event listener for brush size input changes
  brushSizeInput.addEventListener("input", () => {
    brushSizeDisplay.textContent = brushSizeInput.value;
  });

  function startDrawing(e) {
    // TODO: Set isDrawing to true and capture initial coordinates
    isDrawing = true;
    const pos = getCoordinates(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    //IF not isDrawing THEN exit function
    if (isDrawing == false) {
      return;
    } else {
      //drawLine(lastX, lastY, current mouse X, current mouse Y, color, size)
      const pos = getCoordinates(e);
      const drawData = {
        x0: lastX,
        y0: lastY,
        x1: pos.x,
        y1: pos.y,
        color: colorInput.value,
        size: parseInt(brushSizeInput.value, 10),
      };

      socket.emit("draw", drawData);

      // Update last position
      lastX = pos.x;
      lastY = pos.y;
    }
    //lastX = current mouse X position
    //lastY = current mouse Y position

    // TODO: If not drawing, return
    // TODO: Get current coordinates
    // TODO: Emit 'draw' event to the server with drawing data
    // TODO: Update last position
  }

  function drawLine(x0, y0, x1, y1, color, size) {
    // TODO: Draw a line on the canvas using the provided parameters
    context.beginPath();
    // Move to starting point
    context.moveTo(x0, y0);
    // Draw a line to another point
    context.lineTo(x1, y1);
    // Set line color and width
    context.strokeStyle = color;
    context.lineWidth = size;
    // Render the path
    context.stroke();
  }

  function stopDrawing() {
    // TODO: Set isDrawing to false
    isDrawing = false;
  }

  function clearCanvas() {
    // TODO: Emit 'clear' event to the server
    socket.emit("clear");
  }

  function redrawCanvas(boardState = []) {
    // TODO: Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
    // TODO: Redraw all lines from the board state
    for (let i = 0; i < boardState.length; i++) {
      const d = boardState[i];
      drawLine(d.x0, d.y0, d.x1, d.y1, d.color, d.size);
  }}

  // Helper function to get coordinates from mouse or touch event
  function getCoordinates(e) {
    // TODO: Extract coordinates from the event (for both mouse and touch events)

    if (e.type.includes('touch')) {// Get first touch point
      const touch = e.touches[0] || e.changedTouches[0];
      // Get canvas position
      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates relative to canvas
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {// Mouse event
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }

  }

  // Handle touch events
  function handleTouchStart(e) {
    // TODO: Prevent default behavior and call startDrawing
    e.preventDefault();
    startDrawing(e);
  }

  function handleTouchMove(e) {
    // TODO: Prevent default behavior and call draw
    e.preventDefault();
    draw(e);
  }
});