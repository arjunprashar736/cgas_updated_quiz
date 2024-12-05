import React, { useState, useEffect } from 'react';

// Separate word lists for each player
const player1WordsToFind = [ "Pasta", "Burger", "Tacos", "Pizza", "Salad", "Sushi", "Lasagna", "Omelette",
  "Ramen", "Brownie", "Donut", "Curry", "Chowmein", "Dumplings", "Falafel",
  "Paella", "Biryani", "Kebab", "Soup", "Steak", "Sandwich", "Quiche", "Waffles",
  "Pancakes", "Nachos", "Bagel", "Pie", "Gnocchi", "Risotto", "Crepes"];

const player2WordsToFind = ["Bruschetta", "Chowder", "Quesadilla", "Macarons", "Casserole", "Frittata",
  "Croissant", "Parfait", "Tiramisu", "Gumbo", "Empanada", "Carbonara",
  "Meatloaf", "Baguette", "Scones", "Gazpacho", "Pavlova", "Ratatouille",
  "Eclairs", "Beignets", "Goulash", "Moussaka", "Strudel", "Clafoutis",
  "Pudding", "Bisque", "Cioppino", "Tapas", "Tostadas", "Fondue"];

// Function to generate the matrix with a specific word list
const selectRandomWords = (wordList, numWords) => {
  const shuffled = [...wordList].sort(() => Math.random() - 0.5); // Shuffle the list
  return shuffled.slice(0, numWords); // Take the first 'numWords' words
};

const generateMatrix = (size, wordsToFind) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let matrix = Array(size).fill(null).map(() => Array(size).fill(''));
  let wordPositions = [];

  // Shuffle directions to improve placement randomness
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // vertical, horizontal
    [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonals
  ];
  const shuffledDirections = directions.sort(() => Math.random() - 0.5);

  // Place words in the matrix
  wordsToFind.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = size * size; // Increased attempt limit

    while (!placed && attempts < maxAttempts) {
      // Try different directions
      for (let dirIndex = 0; dirIndex < shuffledDirections.length; dirIndex++) {
        const direction = shuffledDirections[dirIndex];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (canPlaceWord(matrix, word, row, col, direction, size)) {
          placeWord(matrix, word, row, col, direction);
          wordPositions.push({ word, row, col, direction });
          placed = true;
          break;
        }
      }
      attempts++;
    }

    // If word couldn't be placed, try a shorter version or abbreviation
    if (!placed) {
      const shorterWord = word.length > 4 ? word.slice(0, 4) : word;
      attempts = 0;
      while (!placed && attempts < maxAttempts) {
        for (let dirIndex = 0; dirIndex < shuffledDirections.length; dirIndex++) {
          const direction = shuffledDirections[dirIndex];
          const row = Math.floor(Math.random() * size);
          const col = Math.floor(Math.random() * size);

          if (canPlaceWord(matrix, shorterWord, row, col, direction, size)) {
            placeWord(matrix, shorterWord, row, col, direction);
            wordPositions.push({ word: shorterWord, row, col, direction });
            placed = true;
            break;
          }
        }
        attempts++;
      }
    }

    // If still not placed, log a warning
    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  });

  // Fill remaining empty spots with random letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!matrix[i][j]) {
        matrix[i][j] = letters.charAt(Math.floor(Math.random() * letters.length));
      }
    }
  }

  return { matrix, wordPositions };
};

// Check if the word can be placed in the given direction
const canPlaceWord = (matrix, word, row, col, direction, size) => {
  const [dx, dy] = direction;
  for (let i = 0; i < word.length; i++) {
    const newRow = row + dx * i;
    const newCol = col + dy * i;
    if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size || 
        (matrix[newRow][newCol] !== '' && matrix[newRow][newCol] !== word[i])) {
      return false;
    }
  }
  return true;
};

// Place the word in the matrix
const placeWord = (matrix, word, row, col, direction) => {
  const [dx, dy] = direction;
  for (let i = 0; i < word.length; i++) {
    matrix[row + dx * i][col + dy * i] = word[i];
  }
};

const PuzzleGame = () => {
  const [gridSize, setGridSize] = useState(10); // Default to 10x10 grid
  const [player1Words, setPlayer1Words] = useState(selectRandomWords(player1WordsToFind, 6));
  const [player2Words, setPlayer2Words] = useState(selectRandomWords(player2WordsToFind, 6));
  const [player1MatrixData, setPlayer1MatrixData] = useState(generateMatrix(gridSize, player1Words));
  const [player2MatrixData, setPlayer2MatrixData] = useState(generateMatrix(gridSize, player2Words));
  const [selectedWord, setSelectedWord] = useState([]);
  const [player1LockedWords, setPlayer1LockedWords] = useState([]); // Track locked words for player 1
  const [player2LockedWords, setPlayer2LockedWords] = useState([]); // Track locked words for player 2
  const [player1HighlightedCells, setPlayer1HighlightedCells] = useState([]); // Track highlighted cells for player 1
  const [player2HighlightedCells, setPlayer2HighlightedCells] = useState([]); // Track highlighted cells for player 2
  const [playerTurn, setPlayerTurn] = useState(1); // Track the active player (1 or 2)
  const [player1Time, setPlayer1Time] = useState(0); // Timer for player 1
  const [player2Time, setPlayer2Time] = useState(0); // Timer for player 2
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameStarted, setGameStarted] = useState(false); // Flag to start game and timers
  const [message, setMessage] = useState('');
  const [gameEnded, setGameEnded] = useState(false); // Flag to track if game has ended
  const [winner, setWinner] = useState(null);



  // Start Timer
  useEffect(() => {
    let timer;
    if (gameStarted && !gameEnded) {
      if (playerTurn === 1) {
        timer = setInterval(() => {
          setPlayer1Time(prev => prev + 1);
        }, 1000);
      } else if (playerTurn === 2) {
        timer = setInterval(() => {
          setPlayer2Time(prev => prev + 1);
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [playerTurn, gameStarted, gameEnded]);

  // Handle cell click event
  const handleCellClick = (rowIndex, colIndex) => {
    if (gameEnded || !gameStarted) {
      return; // No action if game has ended or not started
    }

    // Check if the cell is already highlighted based on the current player
    const highlightedCells = playerTurn === 1 ? player1HighlightedCells : player2HighlightedCells;
    if (highlightedCells.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex)) {
      return; // Don't allow selection of already highlighted (locked) cells
    }

    // Get the current matrix based on the player turn
    const currentMatrix = playerTurn === 1 ? player1MatrixData.matrix : player2MatrixData.matrix;
    const cellLetter = currentMatrix[rowIndex][colIndex];
    const newSelection = [...selectedWord, { letter: cellLetter, rowIndex, colIndex }];
    setSelectedWord(newSelection);
  };

  // Handle word verification
  const handleVerify = () => {
    if (gameEnded || !gameStarted) return;
  
    const word = selectedWord.map(cell => cell.letter).join('');
    const currentWordsToFind = playerTurn === 1 ? player1WordsToFind : player2WordsToFind;
    const currentLockedWords = playerTurn === 1 ? player1LockedWords : player2LockedWords;
  
    // Check if the selected word matches a complete word in the list
    const matchedWord = currentWordsToFind.find(w => w === word);
  
    if (matchedWord && !currentLockedWords.includes(matchedWord)) {
      // Mark the word as locked
      const updatedLockedWords = [...currentLockedWords, matchedWord];
  
      // Update locked words for the current player
      if (playerTurn === 1) {
        setPlayer1LockedWords(updatedLockedWords);
      } else {
        setPlayer2LockedWords(updatedLockedWords);
      }
  
      // Highlight the word's cells with red border
      const wordCells = selectedWord.map(cell => ({ rowIndex: cell.rowIndex, colIndex: cell.colIndex }));
      if (playerTurn === 1) {
        setPlayer1HighlightedCells(prevHighlightedCells => [
          ...prevHighlightedCells,
          ...wordCells
        ]);
      } else {
        setPlayer2HighlightedCells(prevHighlightedCells => [
          ...prevHighlightedCells,
          ...wordCells
        ]);
      }
  
      // Update score for the current player
      if (playerTurn === 1) {
        setPlayer1Score(prevScore => prevScore + 1);
      } else {
        setPlayer2Score(prevScore => prevScore + 1);
      }
  
      // Set success message
      setMessage('Correct! +1 score.');
  
      // Check if both players have found 4 words
      const player1WordsFound = player1LockedWords.length;
      const player2WordsFound = player2LockedWords.length;
  
      if (player1WordsFound === 4 && player2WordsFound === 3) {
        // Both players have completed their words, determine winner based on time
        if (player1Time < player2Time) {
          setMessage('Player 1 wins! Lowest time.');
          setGameEnded(true);
          setGameStarted(false);
          setWinner('Player 1');
        } else if (player2Time < player1Time) {
          setMessage('Player 2 wins! Lowest time.');
          setGameEnded(true);
          setGameStarted(false);
          setWinner('Player 2');
        } else {
          setMessage('It\'s a tie!');
          setGameEnded(true);
          setGameStarted(false);
          setWinner('Tie');
        }
      } else {
        // If neither player has completed all words, change turn
        setPlayerTurn(playerTurn === 1 ? 2 : 1);
      }
  
      // Clear the selected word after verification
      setSelectedWord([]);
    } else {
      // If word is incorrect or already selected, reset the selection and show error message
      setMessage('Incorrect or already selected word. Try again.');
      setSelectedWord([]);
    }
  };
  

  // Reset the game
  const handleReset = () => {
    const newPlayer1Words = selectRandomWords(player1WordsToFind, 6);
    const newPlayer2Words = selectRandomWords(player2WordsToFind, 6);
    setPlayer1Words(newPlayer1Words);
    setPlayer2Words(newPlayer2Words);
    setSelectedWord([]);
    setMessage('');
    setPlayer1MatrixData(generateMatrix(gridSize, newPlayer1Words));
    setPlayer2MatrixData(generateMatrix(gridSize, newPlayer2Words));
    setPlayer1LockedWords([]); // Reset locked words for player 1
    setPlayer2LockedWords([]); // Reset locked words for player 2
    setPlayer1HighlightedCells([]); // Reset highlighted cells for player 1
    setPlayer2HighlightedCells([]); // Reset highlighted cells for player 2
    setPlayer1Time(0);
    setPlayer2Time(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayerTurn(1); // Player 1 starts
    setGameStarted(false); // Game is reset, not started yet
    setGameEnded(false); // Reset game ended status
  };

  // Shuffle the matrices
  const handleShuffle = () => {
    const newPlayer1Words = selectRandomWords(player1WordsToFind, 6);
    const newPlayer2Words = selectRandomWords(player2WordsToFind, 6);
    setPlayer1Words(newPlayer1Words);
    setPlayer2Words(newPlayer2Words);
    setPlayer1MatrixData(generateMatrix(gridSize, newPlayer1Words));
    setPlayer2MatrixData(generateMatrix(gridSize, newPlayer2Words));
    setSelectedWord([]);
    setMessage('');
    setPlayer1LockedWords([]);
    setPlayer2LockedWords([]);
    setPlayer1HighlightedCells([]);
    setPlayer2HighlightedCells([]);// Reset highlighted cells for player 2
  };

  // Handle Multiplayer toggle
 


  // Start Game
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setMessage('Game started!');
  };

  
  return (
    <>
      <div className="puzzle-game">
        <h1>Word Maze Game</h1>
        <h2>Player 1 Score: {player1Score} | Player 2 Score: {player2Score}</h2>
        <h2>Timer - Player 1: {player1Time}s | Player 2: {player2Time}s</h2>

        {/* Start Game Button */}
        {!gameStarted && <button onClick={startGame}>Start Game</button>}

        {/* Game Matrices */}
        <div className="matrices">
          <div className={`matrix ${playerTurn === 1 ? '' : 'blur'}`}>
            {player1MatrixData.matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="matrix-row">
                {row.map((cell, colIndex) => {
                  const isSelected = selectedWord.some(item => item.rowIndex === rowIndex && item.colIndex === colIndex);
                  const isHighlighted = player1HighlightedCells.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex);

                  return (
                    <div
                      key={colIndex}
                      className={`matrix-cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`matrix ${playerTurn === 2 ? '' : 'blur'}`}>
            {player2MatrixData.matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="matrix-row">
                {row.map((cell, colIndex) => {
                  const isSelected = selectedWord.some(item => item.rowIndex === rowIndex && item.colIndex === colIndex);
                  const isHighlighted = player2HighlightedCells.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex);

                  return (
                    <div
                      key={colIndex}
                      className={`matrix-cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Controls and Messages */}
        {gameStarted && !gameEnded && (
          <>
            <div className="controls">
              <button onClick={handleVerify}>Verify Word</button>
              <button onClick={handleReset}>Reset Game</button>
              <button onClick={handleShuffle}>Shuffle</button>
            </div>
            <div className="message">{message}</div>
          </>
        )}

        {/* Display the winner message */}
        {gameEnded && winner && (
          <h2>{winner} wins!</h2>
        )}
        
        {/* Display tie message if applicable */}
        {gameEnded && winner === 'Tie' && (
          <h2>{message}</h2> 
        )}
      </div>
    </>
  );
};

export default PuzzleGame;


