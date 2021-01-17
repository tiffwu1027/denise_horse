const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
  res.render('instructions.html');
});

app.get('/horse', function(req, res) {
  res.render('index.html');
})

app.listen(process.env.PORT || 8080, () =>
  console.log('Visit port ' + process.env.PORT)
);