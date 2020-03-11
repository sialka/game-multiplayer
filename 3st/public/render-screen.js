export default function renderScreen(
  screen,
  score,
  life,
  level,
  online,
  game,
  requestAnimationFrame,
  currentPlayerId
) {
  const context = screen.getContext("2d");
  // Limpando o tela
  context.clearRect(0, 0, game.state.canvas.width, game.state.canvas.height);

  // Camara de Apresentação

  // Renderiza os Jogadores
  for (const playerId in game.state.players) {
    const player = game.state.players[playerId];
    context.fillStyle = "#999";
    context.fillRect(player.x, player.y, 1, 1);
  }

  // Renderiza as frutas
  for (const fruitId in game.state.fruits) {
    const fruit = game.state.fruits[fruitId];
    context.fillStyle = "#ED4C67";
    context.fillRect(fruit.x, fruit.y, 1, 1);
  }

  // Colorindo jogador corrente com uma cor especifica
  const currentPlayer = game.state.players[currentPlayerId];

  if (currentPlayer) {
    context.fillStyle = "#5758BB";
    context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);

    score.innerText = game.state.players[currentPlayerId].score;
    life.innerText = game.state.players[currentPlayerId].life;
  }

  online.innerText = Object.keys(game.state.players).length;
  level.innerText = game.state.level;

  // Renderização automática
  requestAnimationFrame(() => {
    renderScreen(
      screen,
      score,
      life,
      level,
      online,
      game,
      requestAnimationFrame,
      currentPlayerId
    );
  });
}
