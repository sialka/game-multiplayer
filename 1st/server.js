console.log('> Script started')
const express = require('express')

const webApp = express()
const webServer = require('http').createServer(webApp)
const io = require('socket.io')(webServer)

const game = createGame()
let maxConcurrentConnections = 15


/** Rotas (inicio) * */
webApp.get('/', function(req, res){
  res.sendFile(`${__dirname  }/game.html`)
})

// Coisas que só uma POC vai conhecer
webApp.get('/a31ecc0596d72f84e5ee403ddcacb3dea94ce0803fc9e6dc2eca1fbabae49a3e3a31ecc0596d72f84e5ee40d0cacb3dea94ce0803fc9e6dc2ecfdfdbabae49a3e3', function(req, res){
  res.sendFile(`${__dirname  }/game-admin.html`)
})

webApp.get('/collect.mp3', function(req, res){
  res.sendFile(`${__dirname  }/collect.mp3`)
})

webApp.get('/100-collect.mp3', function(req, res){
  res.sendFile(`${__dirname  }/100-collect.mp3`)
})
/** Rotas (fim) * */

setInterval(() => {
  io.emit('concurrent-connections', io.engine.clientsCount)
}, 5000)

/** Criando Conexão */
io.on('connection', function(socket){
  const {admin} = socket.handshake.query

  if (io.engine.clientsCount > maxConcurrentConnections && !admin) {
    socket.emit('show-max-concurrent-connections-message')
    socket.conn.close()
    return
  }
    socket.emit('hide-max-concurrent-connections-message')

  const playerState = game.addPlayer(socket.id)
  socket.emit('bootstrap', game)

  socket.broadcast.emit('player-update', {
    socketId: socket.id,
    newState: playerState
  })

  socket.on('player-move', (direction) => {
    game.movePlayer(socket.id, direction)

    const fruitColisionIds = game.checkForFruitColision()

    socket.broadcast.emit('player-update', {
      socketId: socket.id,
      newState: game.players[socket.id]
    })

    if (fruitColisionIds) {
      io.emit('fruit-remove', {
        fruitId: fruitColisionIds.fruitId,
        score: game.players[socket.id].score
      })
      socket.emit('update-player-score', game.players[socket.id].score)
    }

  })

  socket.on('disconnect', () => {
    game.removePlayer(socket.id)
    socket.broadcast.emit('player-remove', socket.id)
  })


  let fruitGameInterval
  socket.on('admin-start-fruit-game', (interval) => {
    console.log('> Fruit Game start')
    clearInterval(fruitGameInterval)

    fruitGameInterval = setInterval(() => {
      const fruitData = game.addFruit()

      if (fruitData) {
        io.emit('fruit-add', fruitData)
      }
    }, interval)
  })

  socket.on('admin-stop-fruit-game', () => {
    console.log('> Fruit Game stop')
    clearInterval(fruitGameInterval)
  })

  socket.on('admin-start-crazy-mode', () => {
    io.emit('start-crazy-mode')
  })

  socket.on('admin-stop-crazy-mode', () => {
    io.emit('stop-crazy-mode')
  })

  socket.on('admin-clear-scores', () => {
    game.clearScores()
    io.emit('bootstrap', game)
  })

  socket.on('admin-concurrent-connections', (newConcurrentConnections) => {
    maxConcurrentConnections = newConcurrentConnections
  })

});

/** Subindo Servidor Express */
webServer.listen(3000, () => {
  console.log('> Server listening on port:',3000)
});

/** Função Principal */
function createGame() {
  console.log('> Starting new game')
  let fruitGameInterval

  const game = {
    canvasWidth: 35,
    canvasHeight: 30,
    players: {},
    fruits: {},
    addPlayer,
    removePlayer,
    movePlayer,
    addFruit,
    removeFruit,
    checkForFruitColision,
    clearScores
  }

  /** Adiciona Player com posição aleatória */
  function addPlayer(socketId) {
    return game.players[socketId] = {
      x: Math.floor(Math.random() * game.canvasWidth),
      y: Math.floor(Math.random() * game.canvasHeight),
      score: 0
    }
  }

  /** Remove Player */
  function removePlayer(socketId) {
    delete game.players[socketId]
  }

  /** Move o Player */
  function movePlayer(socketId, direction) {
    const player = game.players[socketId]

    if (direction === 'left' && player.x - 1 >= 0) {
      player.x -= 1
    }

    if (direction === 'up' && player.y - 1 >= 0) {
      player.y -= 1
    }

    if (direction === 'right' && player.x + 1 < game.canvasWidth) {
      player.x += 1
    }

    if (direction === 'down' && player.y + 1 < game.canvasHeight) {
      player.y += 1
    }

    return player
  }

  /** Adiciona Fruta com posição aleatoria */
  function addFruit() {
    const fruitRandomId = Math.floor(Math.random() * 10000000)
    const fruitRandomX = Math.floor(Math.random() * game.canvasWidth)
    const fruitRandomY = Math.floor(Math.random() * game.canvasHeight)

    /** Caso haja uma fruta na posição recem criada aborta a função */
    for (fruitId in game.fruits) {
      const fruit = game.fruits[fruitId]

      if (fruit.x === fruitRandomX && fruit.y === fruitRandomY) {
        return false
      }

    }

    /** Alimenta a posição da nova fruta */
    game.fruits[fruitRandomId] = {
      x: fruitRandomX,
      y: fruitRandomY
    }

    /** Retona a fruta recem criada */
    return {
      fruitId: fruitRandomId,
      x: fruitRandomX,
      y: fruitRandomY
    }

  }

  /** Remove fruta */
  function removeFruit(fruitId) {
    delete game.fruits[fruitId]
  }

  /** Checa as colisoes das frutas com os jogadores */
  function checkForFruitColision() {
    // Varre todas as frutas
    for (fruitId in game.fruits) {
      const fruit = game.fruits[fruitId]

      // Varre todos os jogadores
      for (socketId in game.players) {
        const player = game.players[socketId]

        // Checa se houve colisão,
        // adiciona 1 ponto ao player e
        // remove a fruta
        if (fruit.x === player.x && fruit.y === player.y) {
          player.score += 1
          game.removeFruit(fruitId)

          return {
            socketId,
            fruitId
          }
        }
      }
    }
  }

  // Zera a pontuação dos players
  function clearScores() {
    for (socketId in game.players) {
      game.players[socketId].score = 0
    }
  }

  return game
}
