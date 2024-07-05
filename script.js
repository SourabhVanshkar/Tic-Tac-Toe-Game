document.addEventListener('DOMContentLoaded', () => {
  const cells = document.querySelectorAll('.cell');
  const statusText = document.getElementById('status-text');
  const resetButton = document.getElementById('reset-button');
  const themeButton = document.getElementById('theme-button');
  const modeSelect = document.getElementById('mode');
  const playerXScore = document.getElementById('player-X-score');
  const playerOScore = document.getElementById('player-O-score');
  const moveSound = new Audio('move-sound.mp3');
  const winSound = new Audio('win-sound.mp3');

  let currentPlayer = 'X';
  let gameActive = true;
  let gameState = ['', '', '', '', '', '', '', '', ''];
  let playerXWins = 0;
  let playerOWins = 0;
  let gameMode = 'two-player';

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  function playMoveSound() {
    moveSound.currentTime = 0;
    moveSound.play();
  }

  function playWinSound() {
    winSound.currentTime = 0;
    winSound.play();
  }

  function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
      return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer);
    playMoveSound();

    checkWinner();

    if (gameMode === 'vs-computer' && gameActive && currentPlayer === 'O') {
      handleComputerMove();
    }
  }

  function handleComputerMove() {
    const bestMove = minimax(gameState, 'O').index;
    gameState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    cells[bestMove].classList.add('O');
    playMoveSound();
    checkWinner();
  }

  function minimax(newBoard, player) {
    const availSpots = newBoard.reduce((acc, val, idx) => (val === '' ? acc.concat(idx) : acc), []);

    if (checkWin(newBoard, 'X')) {
      return { score: -10 };
    } else if (checkWin(newBoard, 'O')) {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === 'O') {
        const result = minimax(newBoard, 'X');
        move.score = result.score;
      } else {
        const result = minimax(newBoard, 'O');
        move.score = result.score;
      }

      newBoard[availSpots[i]] = '';
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  }

  function checkWin(board, player) {
    return winningConditions.some(condition =>
      condition.every(index => board[index] === player)
    );
  }

  function highlightWinningLine(line) {
    line.forEach(index => {
      cells[index].classList.add('win');
    });
  }

  function checkWinner() {
    let roundWon = false;
    let winningLine;

    for (let i = 0; i < winningConditions.length; i++) {
      const [a, b, c] = winningConditions[i];
      if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
        roundWon = true;
        winningLine = [a, b, c];
        break;
      }
    }

    if (roundWon) {
      statusText.textContent = `Player ${currentPlayer} wins!`;
      updateScore(currentPlayer);
      highlightWinningLine(winningLine);
      playWinSound();
      gameActive = false;
      return;
    }

    if (!gameState.includes('')) {
      statusText.textContent = 'Game ends in a draw!';
      gameActive = false;
      return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }

  function updateScore(player) {
    if (player === 'X') {
      playerXWins++;
      playerXScore.textContent = `Player X: ${playerXWins}`;
    } else if (player === 'O') {
      playerOWins++;
      playerOScore.textContent = `Player O: ${playerOWins}`;
    }
  }

  function resetGame() {
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    statusText.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('X', 'O', 'win');
      cell.style.transform = 'scale(0)';
      setTimeout(() => {
        cell.style.transform = 'scale(1)';
      }, 100);
    });
  }

  function switchTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  }

  function updateGameMode() {
    gameMode = modeSelect.value;
    resetGame();
  }

  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  resetButton.addEventListener('click', resetGame);
  themeButton.addEventListener('click', switchTheme);
  modeSelect.addEventListener('change', updateGameMode);
});
