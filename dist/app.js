'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _youtubeDl = require('youtube-dl');

var _youtubeDl2 = _interopRequireDefault(_youtubeDl);

var _memoryCache = require('memory-cache');

var _memoryCache2 = _interopRequireDefault(_memoryCache);

var _herokuLogger = require('heroku-logger');

var _herokuLogger2 = _interopRequireDefault(_herokuLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import https from 'https'

var app = (0, _express2.default)();

/** CONFIG **/
var port = process.env.PORT || 3000;

var requestCache = function requestCache(duration) {
  return function (req, res, next) {
    var key = '__express__' + req.originalUrl || req.url;
    var cachedBody = _memoryCache2.default.get(key);
    if (cachedBody) {
      res.send(cachedBody);
    } else {
      res.sendResponse = res.send;
      res.send = function (body) {
        _memoryCache2.default.put(key, body, duration);
        res.sendResponse(body);
      };
      next();
    }
  };
};

/** ROUTES **/
/* home */
app.get('/', function (req, res) {
  var text = '<h1>YouTube-DL API</h1><p>This is just a demonstration, not for public use.</p><p>Full original source code available on Github: <a href="https://www.github.com/daveamato/openload-api/" target="_blank">openload-api</a>. </p><hr><p>Copyright &copy; 2018 David Amato. Some rights reserved. By using this API you may be committing copyright infringement. I am not responsible for the contents or original creation of the API.</p>';
  res.send(text);
});

app.get('/get/*', requestCache(60 * 60 * 12), function (req, res) {
  //if (req.params.dlUrl === '' || req.params.dlUrl === 'favicon.ico') { return }

  //let url = `${req.params.dlUrl}`
  var url = req.params[0];
  _youtubeDl2.default.getInfo(url, function (err, info) {
    if (err) {
      res.send({ status: false, error: 'Unknown error occurred!' });
    }

    res.send(info.url);
    /*
        res.send({
            id: info.id ? info.id : 'None',
            title: info.title ? info.title : 'None',
            stream: info.url ? info.url : 'None',
            thumbnail: info.thumbnail ? info.thumbnail : 'None'
          })
    */
  });
});

app.get('/play/*', function (req, res) {

  var path = req.params[0];
  //logger.info('getting', { url: path })

  var ytopts = ['--source-address', req.ip];

  _youtubeDl2.default.getInfo(path, function (err, info) {
    if (err) {
      res.send({ status: false, error: err });
    }
    //logger.info('resolved', { 'url': info.url })
    res.redirect(info.url);

    //res.setHeader('Content-Type', 'application/x-mpegURL');
    //res.attachment(info._filename);
    //https.get(path).pipe(res);

    /*
    let stat = fs.statSync(info.url)
    let fileSize = stat.size
    let range = req.headers.range
    if (range) {
      let parts = range.replace(/bytes=/, "").split("-")
      let start = parseInt(parts[0], 10)
      let end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize-1
      let chunksize = (end-start)+1
      let file = fs.createReadStream(path, {start, end})
      let head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      let head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
    */
    /*
    obJ = {
      success: true,
      data: {
        id: info.id||'None',
        title: info.title||'None',
        stream: info.url||'None',
        thumbnail: info.thumbnail||'None'
      }
    }
    */
  });
});

app.get('/ol/:videoId', requestCache(60 * 60 * 12), function (req, res) {
  if (req.params.videoId === '' || req.params.videoId === 'favicon.ico') {
    return;
  }

  var url = 'https://openload.co/embed/' + req.params.videoId + '/';
  _youtubeDl2.default.getInfo(url, function (err, info) {
    if (err) {
      res.send({ status: false, error: 'Unknown error occurred!' });
    }

    res.send({
      success: true,
      data: {
        id: info.id ? info.id : 'None',
        title: info.title ? info.title : 'None',
        stream: info.url ? info.url : 'None',
        thumbnail: info.thumbnail ? info.thumbnail : 'None'
      }
    });
  });
});

/** LISTEN **/
app.listen(port, function () {
  console.log("Running API on port " + port);
  _herokuLogger2.default.info('started', { success: true });
});