const express = require('express');

var port = process.env.PORT || 3000;

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendfile('public/index.html');
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
