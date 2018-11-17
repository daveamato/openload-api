import express from 'express'
import youtubedl from 'youtube-dl'
import mcache from 'memory-cache'

const app = express()

/** CONFIG **/
const port = process.env.PORT || 4000

const requestCache = (duration) => {
  return (req, res, next) => {
    let key = `__express__${req.originalUrl}` || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration)
        res.sendResponse(body)
      }
      next()
    }
  }
}

/** ROUTES **/
/* home */
app.get('/', (req, res) => {
  const text = '<h1>YouTube-DL API</h1><p>This is just a demonstration, not for public use.</p><p>Full original source code available on Github: <a href="https://www.github.com/daveamato/openload-api/" target="_blank">openload-api</a>. </p><hr><p>Copyright &copy; 2018 David Amato. Some rights reserved. By using this API you may be committing copyright infringement. I am not responsible for the contents or original creation of the API.</p>'
  res.send(text)
})

app.get('/:dlUrl', requestCache(60 * 60 * 12), (req, res) => {
  if (req.params.dlUrl === '' || req.params.dlUrl === 'favicon.ico') { return }

  let url = `${req.params.dlUrl}`
  youtubedl.getInfo(url, (err, info) => {
    if (err) {
      res.send({ status: false, error: 'Unknown error occurred!' })
    }

    res.send({
      success: true,
      data: {
        id: info.id||'None',
        title: info.title||'None',
        stream: info.url||'None',
        thumbnail: info.thumbnail||'None'
      }
    })
  })
})

app.get('/play/:getUrl', (req, res) => {
  if (req.params.getUrl === '' || req.originalUrl === '/favicon.ico') { return }
  
  let path = req.path.replace('/play/', '')
  console.log('getting.. ' + path)
  
  youtubedl.getInfo(path, (err, info) => {
    if (err) {
      res.send({ status: false, error: 'Unknown error occurred!' })
    }
    res.redirect(info.url)
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
  })
});

app.get('/ol/:videoId', requestCache(60 * 60 * 12), (req, res) => {
  if (req.params.videoId === '' || req.params.videoId === 'favicon.ico') { return }

  let url = `https://openload.co/embed/${req.params.videoId}/`
  youtubedl.getInfo(url, (err, info) => {
    if (err) {
      res.send({ status: false, error: 'Unknown error occurred!' })
    }

    res.send({
      success: true,
      data: {
        id: info.id,
        title: info.title,
        stream: info.url,
        thumbnail: info.thumbnail
      }
    })
  })
})

/** LISTEN **/
app.listen(port, function () {
     console.log("Running API on port " + port);
});