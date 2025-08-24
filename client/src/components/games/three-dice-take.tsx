import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ThreeDiceTakeProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

interface GameBoardCell {
  number: number;
  claimed: boolean;
  claimedBy: "player" | "computer" | null;
}

interface Move {
  equation: string;
  target: number;
  dice: number[];
}

export function ThreeDiceTake({ onComplete, onExit }: ThreeDiceTakeProps) {
  const [currentTurn, setCurrentTurn] = useState<"player" | "computer">("player");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [dice, setDice] = useState<number[]>([1, 1, 1]);
  const [gameBoard, setGameBoard] = useState<GameBoardCell[]>([]);
  const [playerEquation, setPlayerEquation] = useState("");
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [feedback, setFeedback] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number[]>([1, 1, 1]);

  // Initialize gameboard with numbers 1-36
  useEffect(() => {
    const initialBoard: GameBoardCell[] = [];
    for (let i = 1; i <= 36; i++) {
      initialBoard.push({
        number: i,
        claimed: false,
        claimedBy: null
      });
    }
    setGameBoard(initialBoard);
    rollDice();
  }, []);

  const rollDice = () => {
    setIsRolling(true);
    setPlayerEquation("");
    setTargetNumber(null);
    setFeedback("");
    setShowValidation(false);

    // Start the rolling animation
    const rollInterval = setInterval(() => {
      const randomDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      setDisplayDice(randomDice);
    }, 100); // Change values every 100ms

    // Stop after 1.5 seconds and set final values
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      setDice(finalDice);
      setDisplayDice(finalDice);
      setIsRolling(false);
    }, 1500);
  };

  const evaluateEquation = (equation: string, diceValues: number[]): { valid: boolean; result: number | null; usesAllDice: boolean } => {
    try {
      // Clean the equation and check if it uses all three dice values
      const cleanEquation = equation.replace(/\s/g, '');
      
      // Extract all numbers from the equation
      const numbersInEquation = cleanEquation.match(/\b\d+\b/g);
      if (!numbersInEquation || numbersInEquation.length !== 3) {
        return { valid: false, result: null, usesAllDice: false };
      }
      
      // Convert to numbers and sort both arrays for comparison
      const equationNumbers = numbersInEquation.map(n => parseInt(n)).sort((a, b) => a - b);
      const sortedDice = [...diceValues].sort((a, b) => a - b);
      
      // Check if the numbers in equation exactly match the dice
      const usesAllDice = equationNumbers.length === 3 && 
        equationNumbers.every((num, index) => num === sortedDice[index]);
      
      // Only allow basic operations and numbers
      if (!/^[0-9+\-*/().\s]+$/.test(equation)) {
        return { valid: false, result: null, usesAllDice: false };
      }
      
      // Evaluate the expression safely
      const result = Function('"use strict"; return (' + equation + ')')();
      
      // Check if result is a positive integer
      const isValidResult = Number.isInteger(result) && result > 0 && result <= 36;
      
      return { 
        valid: isValidResult, 
        result: isValidResult ? result : null, 
        usesAllDice 
      };
    } catch (error) {
      return { valid: false, result: null, usesAllDice: false };
    }
  };

  const validateMove = () => {
    if (!playerEquation.trim()) {
      setFeedback("Please enter an equation using all three dice.");
      return;
    }

    const evaluation = evaluateEquation(playerEquation, dice);
    
    if (!evaluation.usesAllDice) {
      setFeedback("You must use all three dice values exactly once in your equation.");
      return;
    }
    
    if (!evaluation.valid || evaluation.result === null) {
      setFeedback("Invalid equation. Please check your math and try again.");
      return;
    }

    const targetCell = gameBoard.find(cell => cell.number === evaluation.result);
    if (!targetCell || targetCell.claimed) {
      setFeedback(`Number ${evaluation.result} is not available on the board.`);
      return;
    }

    setTargetNumber(evaluation.result);
    setShowValidation(true);
    setFeedback(`Valid equation! ${playerEquation} = ${evaluation.result}. Confirm to claim this number.`);
  };

  const executePlayerMove = () => {
    if (targetNumber === null) return;

    const newBoard = [...gameBoard];
    const targetIndex = newBoard.findIndex(cell => cell.number === targetNumber);
    
    if (targetIndex === -1) return;

    newBoard[targetIndex].claimed = true;
    newBoard[targetIndex].claimedBy = "player";

    // Calculate points: 1 for the cell + 1 for each adjacent claimed cell
    let points = 1;
    const adjacentNumbers = getAdjacentNumbers(targetNumber);
    
    for (const adjNum of adjacentNumbers) {
      const adjCell = newBoard.find(cell => cell.number === adjNum);
      if (adjCell && adjCell.claimed) {
        points++;
      }
    }

    setPlayerScore(playerScore + points);
    setGameBoard(newBoard);
    
    // Record the move
    const move: Move = {
      equation: playerEquation,
      target: targetNumber,
      dice: [...dice]
    };
    setMoveHistory([...moveHistory, move]);

    setFeedback(`Great! You earned ${points} points.`);
    
    // Check if game is complete
    const remainingCells = newBoard.filter(cell => !cell.claimed);
    if (remainingCells.length === 0) {
      setGameComplete(true);
      return;
    }

    // Switch to computer turn
    setTimeout(() => {
      setCurrentTurn("computer");
      executeComputerMove(newBoard);
    }, 2000);
  };

  const getAdjacentNumbers = (num: number): number[] => {
    // Simple adjacent calculation for a 6x6 grid (1-36)
    const row = Math.ceil(num / 6);
    const col = ((num - 1) % 6) + 1;
    const adjacent: number[] = [];

    // Check all 8 directions
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 1 && r <= 6 && c >= 1 && c <= 6) {
          const adjNum = (r - 1) * 6 + c;
          if (adjNum !== num && adjNum >= 1 && adjNum <= 36) {
            adjacent.push(adjNum);
          }
        }
      }
    }
    return adjacent;
  };

  const executeComputerMove = (currentBoard: GameBoardCell[]) => {
    rollDice();
    
    setTimeout(() => {
      // Simple AI: find the first valid combination
      const availableNumbers = currentBoard.filter(cell => !cell.claimed).map(cell => cell.number);
      let bestMove: { equation: string; target: number; points: number } | null = null;

      // Try different combinations of operations
      const operations = ['+', '-', '*', '/'];
      
      for (const target of availableNumbers) {
        // Try various equation patterns with the three dice
        const [a, b, c] = dice;
        const patterns = [
          `${a} + ${b} + ${c}`,
          `${a} + ${b} - ${c}`,
          `${a} - ${b} + ${c}`,
          `${a} * ${b} + ${c}`,
          `${a} * ${b} - ${c}`,
          `${a} + ${b} * ${c}`,
          `${a} - ${b} * ${c}`,
          `(${a} + ${b}) * ${c}`,
          `(${a} - ${b}) * ${c}`,
          `${a} * (${b} + ${c})`,
          `${a} * (${b} - ${c})`,
          `${a} * ${b} * ${c}`,
          `${a} + ${b} + ${c}`,
          // Add more patterns as needed
        ];

        for (const pattern of patterns) {
          const evaluation = evaluateEquation(pattern, dice);
          if (evaluation.valid && evaluation.result === target) {
            // Calculate potential points
            let points = 1;
            const adjacentNumbers = getAdjacentNumbers(target);
            for (const adjNum of adjacentNumbers) {
              const adjCell = currentBoard.find(cell => cell.number === adjNum);
              if (adjCell && adjCell.claimed) {
                points++;
              }
            }

            if (!bestMove || points > bestMove.points) {
              bestMove = { equation: pattern, target, points };
            }
          }
        }
      }

      if (bestMove) {
        // Execute computer move
        const newBoard = [...currentBoard];
        const targetIndex = newBoard.findIndex(cell => cell.number === bestMove.target);
        newBoard[targetIndex].claimed = true;
        newBoard[targetIndex].claimedBy = "computer";

        setComputerScore(computerScore + bestMove.points);
        setGameBoard(newBoard);
        setFeedback(`Computer played: ${bestMove.equation} = ${bestMove.target} (${bestMove.points} points)`);

        // Check if game is complete
        const remainingCells = newBoard.filter(cell => !cell.claimed);
        if (remainingCells.length === 0) {
          setGameComplete(true);
          return;
        }

        // Switch back to player
        setTimeout(() => {
          setCurrentTurn("player");
          rollDice();
        }, 2000);
      } else {
        // Computer can't find a move, switch back to player
        setFeedback("Computer couldn't find a valid move.");
        setTimeout(() => {
          setCurrentTurn("player");
          rollDice();
        }, 1500);
      }
    }, 1500);
  };

  const handleComplete = () => {
    const totalMoves = moveHistory.length;
    const accuracy = totalMoves > 0 ? Math.round((playerScore / (playerScore + computerScore)) * 100) : 0;
    const strategies = ["derived fact strategies", "order of operations", "strategic thinking"];
    onComplete(playerScore, accuracy, strategies);
  };

  if (gameComplete) {
    const winner = playerScore > computerScore ? "You win!" : 
                   playerScore < computerScore ? "Computer wins!" : "It's a tie!";

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Three Dice Take Complete!</h2>
        <h3 className="text-xl font-semibold mb-4">{winner}</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{playerScore}</p>
            <p className="text-sm text-blue-700">Your Score</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-red-600">{computerScore}</p>
            <p className="text-sm text-red-700">Computer Score</p>
          </div>
        </div>

        {moveHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Your Equations:</h3>
            <div className="max-h-32 overflow-y-auto">
              {moveHistory.map((move, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {move.equation} = {move.target}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4 justify-center">
          <Button onClick={handleComplete} className="bg-primary-500 hover:bg-primary-600">
            Save Results
          </Button>
          <Button variant="outline" onClick={onExit}>
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🎲</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Three Dice Take</h2>
            <p className="text-sm text-gray-600">Use all three dice to make numbers on the board</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      {/* Score Display */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-lg font-bold text-blue-600">{playerScore}</p>
          <p className="text-xs text-blue-700">Your Score</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600">
            {currentTurn === "player" ? "Your Turn" : "Computer's Turn"}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-lg font-bold text-red-600">{computerScore}</p>
          <p className="text-xs text-red-700">Computer Score</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Game Board</h3>
        <div className="grid grid-cols-6 gap-1 bg-gray-200 p-2 rounded-lg max-w-md mx-auto">
          {gameBoard.map((cell) => (
            <div
              key={cell.number}
              className={`w-12 h-12 flex items-center justify-center text-sm font-bold rounded ${
                cell.claimed
                  ? cell.claimedBy === "player"
                    ? "bg-blue-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              {cell.number}
            </div>
          ))}
        </div>
      </div>

      {currentTurn === "player" && (
        <>
          {/* Dice Display */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Dice</h3>
            <div className="flex justify-center space-x-4 mb-4">
              {displayDice.map((die, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold shadow-md transition-all duration-100 ${
                    isRolling ? 'animate-bounce border-blue-400 bg-blue-50 scale-110' : ''
                  }`}
                >
                  {die}
                </div>
              ))}
            </div>
            <Button onClick={rollDice} variant="outline" size="sm" disabled={isRolling}>
              {isRolling ? 'Rolling...' : 'Roll Again'}
            </Button>
          </div>

          {/* Equation Input */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Create Your Equation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Use all three dice with +, -, ×, ÷ and parentheses to make a number on the board
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              <Input
                type="text"
                value={playerEquation}
                onChange={(e) => setPlayerEquation(e.target.value)}
                placeholder={`Use ${displayDice[0]}, ${displayDice[1]}, ${displayDice[2]}`}
                className="text-center max-w-xs"
                onKeyPress={(e) => e.key === 'Enter' && validateMove()}
                disabled={isRolling}
              />
              {!showValidation ? (
                <Button onClick={validateMove} disabled={!playerEquation.trim() || isRolling}>
                  Validate
                </Button>
              ) : (
                <Button onClick={executePlayerMove} className="bg-green-500 hover:bg-green-600" disabled={isRolling}>
                  Confirm Move
                </Button>
              )}
            </div>
            
            {feedback && (
              <div className={`p-3 rounded-lg text-sm ${
                feedback.includes("Valid") || feedback.includes("Great") 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {feedback}
              </div>
            )}
          </div>

          {/* Strategy Hints */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">💡 Strategy Tips</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Look for numbers that will give you adjacent bonuses</p>
              <p>• Try different operation combinations: (a + b) × c, a × (b + c), etc.</p>
              <p>• Remember you must use all three dice exactly once</p>
            </div>
          </div>
        </>
      )}

      {currentTurn === "computer" && (
        <div className="text-center mb-6">
          <div className="animate-pulse">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Computer is thinking...</h3>
            <div className="flex justify-center space-x-4 mb-4">
              {displayDice.map((die, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-100 ${
                    isRolling ? 'animate-bounce border-red-400 bg-red-50 scale-110' : ''
                  }`}
                >
                  {die}
                </div>
              ))}
            </div>
          </div>
          {feedback && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}