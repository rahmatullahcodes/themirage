const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Attach WebSockets / Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for 1-on-1 private messaging
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`[Socket.IO] Client ${socket.id} joined room ${conversationId}`);
    });

    // Handle real-time chat message delivery
    socket.on('send_message', (data) => {
      io.to(data.conversationId).emit('new_message', data);
    });

    // Handle custom content order status updates
    socket.on('custom_content_update', (data) => {
      io.to(data.conversationId).emit('custom_content_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port} - The Mirage Creator Platform`);
  });
});

