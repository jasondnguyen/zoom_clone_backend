const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.get('/', (req, res) => {
  res.send('API Running');
});

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/meeting', require('./routes/api/meeting'));

const server = http.createServer(app);

const io = new socketIo.Server(server);

app.set('socketio', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
