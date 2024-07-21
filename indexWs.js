require('dotenv').config()
const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const { memoryUsage } = require('process')

// const cors = require('cors')


const app = express()

// app.use(cors())

const PORT = process.env.WSPORT

const server = http.createServer(app)

const wsServer = new WebSocket.Server({ server })

wsServer.on('connection', ws => {
  ws.on('message', m => {

    // Test function
    // if (msg != '')
    //   wsServer.clients.forEach(client => client.send(m.toString()))

    // if (msg.msg == "Holla!") 
      
      
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