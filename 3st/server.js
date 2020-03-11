/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */
import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import createGame from './public/game.js'
import createDebug from './public/debug.js'

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

const game = createGame()
const debug = createDebug()

// Debug
debug.change('true');
const modo = debug.mode();

// Observers
game.subscribe((command) => {
  // debug.info(`Observer (server.js): ${command.type}`)
  sockets.emit(command.type, command)
})

// Event Emitter - Emite para todos os conectados o state do jogo
sockets.on('connection', (socket) => {
  const playerId = socket.id  
  debug.info(`Jogador conectado no servidor com o id: ${playerId}`);

  game.addPlayer({ playerId })
  // console.log(game.state)

  game.start()

  // Emite o state inicial para o jogador recem logado
  socket.emit('setup', game.state)

  socket.on('disconnect', () => {
    game.removePlayer({ playerId })
    debug.info(`Jogador removido do servidor com o id: ${playerId}`)
  })

  socket.on('move-player', (command) => {
    // Como não temos autenticação, garatimos subrescrevemos alguns dados.
    command.playerId = playerId
    command.type = 'move-player'

    game.movedPlayer(command)
  })
})

server.listen(3000, () => {
  console.log(`
    Game Multiplayer [versão 1.0]
    (c) 2020.03.06 by github.com/sialka   
    http://localhost:3000

  Debug: ${modo}
  `)
  
  // Retirar 
  console.log(game.state)
})
