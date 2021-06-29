const express = require('express');
const dotenv = require('dotenv').config();
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.send('API Running');
});

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/meeting', require('./routes/api/meeting'));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

io.on('connection', socket => {
  console.log('socket.io connection made');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});
