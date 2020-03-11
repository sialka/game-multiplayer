/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */
import express from 'express'
import http from 'http'
// dp -> factory
import socketio from 'socket.io'
import createGame from './public/game.js'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

const game = createGame()
game.start()

// Observer - escuta em envia para os clients a notificação dos observers
game.subscribe((command) => {
  console.log(`> Emitindo ${command.type}`)
  sockets.emit(command.type, command)
})

console.log(game.state)

// Event Emitter - Emite para todos os conectados o state do jogo
sockets.on('connection', (socket) => {
  const playerId = socket.id
  console.log(`> Jogador conectado no servidor com o id: ${playerId}`)

  game.addPlayer({ playerId })
  // console.log(game.state)

  // Emite o state inicial para o jogador recem logado
  socket.emit('setup', game.state)

  socket.on('disconnect', () => {
    game.removePlayer({ playerId })
    console.log(`> Jogador removido ${playerId}`)
  })

  socket.on('move-player', (command) => {
    // Como não temos autenticação, garatimos subrescrevemos alguns dados.
    command.playerId = playerId
    command.type = 'move-player'

    game.movedPlayer(command)
  })
})

server.listen(3000, () => {
  console.log(`Servidor rodando na porta: 3000`)
})
