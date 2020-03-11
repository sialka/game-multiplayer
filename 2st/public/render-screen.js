export default function renderScreen(screen, game, requestAnimationFrame, currentPlayerId) {
  const context = screen.getContext('2d')
  // Limpando o tela
  context.fillStyle = '#fff'
  // context.fillRect(0, 0, 10, 10) update
  context.clearRect(0, 0, game.state.screen.width, game.state.screen.height)

  // Camara de Apresentação

  // Renderiza os Jogadores
  for (const playerId in game.state.players) {
    const player = game.state.players[playerId]
    context.fillStyle = 'black'
    context.fillRect(player.x, player.y, 1, 1)
  }

  // Renderiza as frutas
  for (const fruitId in game.state.fruits) {
    const fruit = game.state.fruits[fruitId]
    context.fillStyle = 'green'
    context.fillRect(fruit.x, fruit.y, 1, 1)
  }

  // Colorindo jogador corrente com uma cor especifica
  const currentPlayer = game.state.players[currentPlayerId]

  if(currentPlayer) {
    context.fillStyle = '#F0DB4F'
    context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)
  }

  // Renderização automática
  requestAnimationFrame(() => {
    renderScreen(screen, game, requestAnimationFrame, currentPlayerId)
  })
}
