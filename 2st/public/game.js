/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

// Factory
export default function createGame() {
  /** Estrutura de dados com o state dos players e fruits */
  const state = {
    players: {},
    fruits: {},
    screen: {
      width: 10,
      height: 10
    }
  }
  const observers = []

  function start() {
    const frequency = 4000

    setInterval(addFruit, frequency)
  }

  /**
   * dp Observer
   */
  function subscribe(observerFunction) {
    observers.push(observerFunction)
  }

  function notifyAll(command) {
    // console.log(`Notificacao ${state.observers.length} observers`)
    for (const observerFunction of observers){
      observerFunction(command)
    }
  }

  /**
   * Func. que atualiza o state do jogo
   * @param newState  -> Novo state
   */
  function setState(newState) {
    Object.assign(state, newState)
  }

  // Jogadores //

  /**
   * Func. que adiciona jogador.
   * @param command -> Object { playerId: 'nome', playerX: 1, playerY: 1}
   */
  function addPlayer(command) {
    const { playerId } = command
    const playerX  = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
    const playerY  = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

    state.players[playerId] = {
      x: playerX,
      y: playerY
    }

    notifyAll({
      type: 'add-player',
      playerId,
      playerX,
      playerY,
    })
  }

  /**
   * Func. que remove jogador.
   * @param command -> Object { playerId: 'nome' }
   */
  function removePlayer(command) {
    const { playerId } = command

    delete state.players[playerId]

    notifyAll({
      type: 'remove-player',
      playerId,
    })
  }

  // Frutas //

  /**
   * Func. que adiciona jogador.
   * @param command -> Object { fruitId: 'nome', fruitX: 3, fruitY: 3}
   */
  function addFruit(command) {
    const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000)
    const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
    const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.width)

    state.fruits[fruitId] = {
      x: fruitX,
      y: fruitY
    }

    notifyAll({
      type: 'add-fruit',
      fruitId,
      fruitX,
      fruitY,
    })
  }

  /**
   * Func. que remove jogador.
   * @param command -> Object { fruitId: 'nome' }
   */
  function removeFruit(command) {
    const { fruitId } = command

    delete state.fruits[fruitId]

    notifyAll({
      type: 'remove-fruit',
      fruitId,
    })
  }

  /**
   * Func. que movimenta o Jogador
   * @param command -> Object { playerId: 'nome', keyPressed: 'Up' }
   */
  function movedPlayer(command) {
    notifyAll(command)

    const acceptedMoves = {
      ArrowDown(player) {
        // console.log('Down')
        if (player.y + 1 < state.screen.height) {
          player.y += 1
        }
      },
      ArrowRight(player) {
        // console.log('Right')
        if (player.x + 1 < state.screen.width) {
          player.x += 1
        }
      },
      ArrowUp(player) {
        // console.log('Up')
        if (player.y -1 >= 0) {
          player.y -= 1
        }
      },
      ArrowLeft(player) {
        // console.log('Left')
        if (player.x -1 >= 0) {
          player.x -= 1
        }
      }
    }

    // Recebe a Key pressionada
    const { keyPressed } = command
    // Pegando o playerId que está jogando
    const { playerId } = command
    // Recebe o state do player com x, y
    const player = state.players[command.playerId]
    // Object Literals
    const moveFunction = acceptedMoves[keyPressed]
    // Executa a funcao continda no acceptedMoves

    // Se o player existir move o mesmo e checa colisão
    if (player && moveFunction) {
      moveFunction(player)
      checkForFruitCollision(playerId)
    }

  }

  /**
   * Function que checa as colisões
   */
  function checkForFruitCollision(playerId) {
    // for (const playerId in state.players) {
      const player = state.players[playerId]

      for (const fruitId in state.fruits) {
        const fruit = state.fruits[fruitId]
        // console.log(`Checando ${player} e ${fruit}`)

        if (player.x === fruit.x && player.y === fruit.y) {
          // console.log(`Colisão entre ${playerId} e ${fruitId}`)
          removeFruit({ fruitId })
        }
      }
    // }
  }

  return {
    addPlayer,
    removePlayer,
    movedPlayer,
    addFruit,
    removeFruit,
    state,
    setState,
    subscribe,
    start
  }
}
