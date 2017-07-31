const express = require('express')
const bodyParser = require('body-parser')
//const path = require('path')
const cors = require('cors')

const app = express()
//app.use(express.static(path.join(__dirname, '..', 'client')))
app.use(cors())
app.use(bodyParser.json());


const Hemera = require('nats-hemera')
const nats = require('nats').connect()

const h = new Hemera(nats)

const serverPort = 6300


app.post('/act', (req, res) => {
  const command = req.body;
  //eslint-disable-next-line
  h.act(command, (err, result) => {
    if (err) {
      //eslint-disable-next-line
      console.error(err)
      return res.send(err)
    }
    console.log('Sending Back: ', result)
    res.send(result)
  })
})

app.get('/stats', (req, res) => {
  h.act({
    topic: 'stats',
    cmd: 'registeredActions'
  }, function (err, stats) {
    res.send(stats)
  })
})

h.ready((err) => {
  if (err) {
    //eslint-disable-next-line
    console.error(err)
    process.exit(1)
  }
  app.listen(serverPort, () => {
    //eslint-disable-next-line
    console.log(`Server started on port ${serverPort}`)
  })
})


// Command
/*
curl -H "Content-Type: application/json" -X POST -d '{"username":"xyz","password":"xyz"}'  localhost:6300/act
*/
