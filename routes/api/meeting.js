const express = require('express');
const router = express.Router();

router.get('/:room', (req, res) => {
  var io = req.app.get('socketio');

  io.on('connection', socket => {});
});

module.exports = router;
