require('dotenv').config()
const http = require('http')
const express = require('express')
const WebSocket = require('ws')

// const cors = require('cors')


const app = express()

// app.use(cors())

const PORT = process.env.WSPORT

const server = http.createServer(app)

const wsServer = new WebSocket.Server({ server })

wsServer.on('connection', ws => {
  ws.on('message', m => {
    msg = m.toString()
    console.log(msg)
    if (msg != '')
      wsServer.clients.forEach(client => client.send(m.toString()))
  })


  ws.on('error', err => ws.send(`Erorr: ${err}`))

  ws.send("Hi there! You're connected to a WebSocket server")
})

wsServer.on('close', user => {
  console.log(`User has been disconnected`)
  
})

server.listen(PORT, () => {
  console.log('server listening on port', PORT) 
}) 