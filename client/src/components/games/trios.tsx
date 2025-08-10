import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TenFrame } from "@/components/ten-frame";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TriosBoardCell {
  number: number;
  covered: boolean;
}

interface TriosProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function Trios({ onComplete, onExit }: TriosProps) {
  const [score, setScore] = useState(0);
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [cardDeck, setCardDeck] = useState<number[]>([]);
  const [deckPosition, setDeckPosition] = useState(0);
  const [triosBoard, setTriosBoard] = useState<TriosBoardCell[]>([]);
  const [feedback, setFeedback] = useState("");
  const [correctSelections, setCorrectSelections] = useState(0);
  const [totalSelections, setTotalSelections] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [selectedMultiple, setSelectedMultiple] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = () => {
    // Create 5x5 board with multiples of selected number
    const maxMultiplier = Math.floor(50 / selectedMultiple); // Keep products under 50
    const multiples = Array.from({ length: maxMultiplier }, (_, i) => (i + 1) * selectedMultiple);
    const boardNumbers: number[] = [];
    
    // Fill 25 spots with random multiples (allowing duplicates)
    for (let i = 0; i < 25; i++) {
      const randomMultiple = multiples[Math.floor(Math.random() * multiples.length)];
      boardNumbers.push(randomMultiple);
    }
    
    const board = boardNumbers.map(number => ({
      number,
      covered: false
    }));
    
    setTriosBoard(board);
    
    // Create shuffled deck of 40 cards (4 copies of numbers 1-10)
    const deck: number[] = [];
    for (let num = 1; num <= 10; num++) {
      for (let copy = 0; copy < 4; copy++) {
        deck.push(num);
      }
    }
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    setCardDeck(deck);
    setDeckPosition(0);
    
    // Draw first card
    if (deck.length > 0) {
      setCurrentCard(deck[0]);
    }
    
    setGameStarted(true);
  };

  const checkForThreeInARow = (board: TriosBoardCell[]): boolean => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= 2; col++) {
        if (board[row * 5 + col].covered && 
            board[row * 5 + col + 1].covered && 
            board[row * 5 + col + 2].covered) {
          return true;
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row <= 2; row++) {
        if (board[row * 5 + col].covered && 
            board[(row + 1) * 5 + col].covered && 
            board[(row + 2) * 5 + col].covered) {
          return true;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 2; col++) {
        if (board[row * 5 + col].covered && 
            board[(row + 1) * 5 + col + 1].covered && 
            board[(row + 2) * 5 + col + 2].covered) {
          return true;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= 2; row++) {
      for (let col = 2; col < 5; col++) {
        if (board[row * 5 + col].covered && 
            board[(row + 1) * 5 + col - 1].covered && 
            board[(row + 2) * 5 + col - 2].covered) {
          return true;
        }
      }
    }
    
    return false;
  };

  const drawNextCard = () => {
    if (deckPosition + 1 < cardDeck.length) {
      setDeckPosition(deckPosition + 1);
      setCurrentCard(cardDeck[deckPosition + 1]);
    } else {
      setGameComplete(true);
    }
  };

  const handleSkip = () => {
    setFeedback("Card skipped!");
    setTimeout(() => {
      setFeedback("");
      drawNextCard();
    }, 1000);
  };

  const handleBoardClick = (index: number) => {
    if (!currentCard || feedback !== "" || triosBoard[index].covered) return;
    
    const targetProduct = currentCard * selectedMultiple;
    const selectedNumber = triosBoard[index].number;
    
    setTotalSelections(totalSelections + 1);
    
    if (selectedNumber === targetProduct) {
      const newBoard = [...triosBoard];
      newBoard[index].covered = true;
      setTriosBoard(newBoard);
      
      setScore(score + 10);
      setCorrectSelections(correctSelections + 1);
      setFeedback(`Correct! ${currentCard} × ${selectedMultiple} = ${targetProduct}`);
      
      const strategyName = `counting by ${selectedMultiple}s (×${selectedMultiple})`;
      setStrategiesUsed([...strategiesUsed, strategyName]);
      
      // Check for three in a row
      if (checkForThreeInARow(newBoard)) {
        setScore(score + 50); // Bonus for three in a row
        setFeedback("THREE IN A ROW! You won! +50 bonus points!");
        setTimeout(() => {
          setGameComplete(true);
        }, 2500);
        return;
      }
    } else {
      setFeedback(`Not quite. ${currentCard} × ${selectedMultiple} = ${targetProduct}, not ${selectedNumber}`);
    }

    // Draw next card after short delay (only if game isn't complete)
    setTimeout(() => {
      if (!gameComplete) {
        setFeedback("");
        drawNextCard();
      }
    }, 2000);
  };

  const handleComplete = () => {
    const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;
    const uniqueStrategies = Array.from(new Set(strategiesUsed));
    onComplete(score, accuracy, uniqueStrategies);
  };

  if (gameComplete) {
    const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {triosBoard.some(cell => cell.covered) && checkForThreeInARow(triosBoard) ? "THREE IN A ROW! You Won!" : "Game Complete!"}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{score}</p>
            <p className="text-sm text-blue-700">Points Earned</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-sm text-green-700">Accuracy</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-600">{correctSelections}</p>
            <p className="text-sm text-purple-700">Correct Answers</p>
          </div>
        </div>

        {strategiesUsed.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Strategies Used:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(strategiesUsed)).map((strategy, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800">
                  {strategy}
                </Badge>
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
            <h2 className="text-xl font-bold text-gray-800">Trios</h2>
            <p className="text-sm text-gray-600">Find the product of the card × {selectedMultiple}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      {!gameStarted && (
        <div className="text-center mb-8">
          <div className="bg-primary-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Multiple</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which multiplication facts you want to practice
            </p>
            <Select value={selectedMultiple.toString()} onValueChange={(value) => setSelectedMultiple(parseInt(value))}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a multiple" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">×3 (Multiples of 3)</SelectItem>
                <SelectItem value="4">×4 (Multiples of 4)</SelectItem>
                <SelectItem value="5">×5 (Multiples of 5)</SelectItem>
                <SelectItem value="6">×6 (Multiples of 6)</SelectItem>
                <SelectItem value="7">×7 (Multiples of 7)</SelectItem>
                <SelectItem value="8">×8 (Multiples of 8)</SelectItem>
                <SelectItem value="9">×9 (Multiples of 9)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={initializeGame}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
            >
              Start Game
            </Button>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="text-center mb-6">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-lg font-semibold text-gray-600">Card {deckPosition + 1} of {cardDeck.length}</span>
          <div className="w-px h-6 bg-gray-300"></div>
          <span className="text-lg font-semibold text-gray-600">Score: {score}</span>
        </div>
        
        {currentCard && (
          <div className="bg-primary-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Card</h3>
            <div className="flex justify-center mb-4">
              <TenFrame number={currentCard} className="text-2xl" />
            </div>
            <p className="text-sm text-gray-600">
              Find {currentCard} × {selectedMultiple} on the board
            </p>
          </div>
        )}
        </div>
      )}

      {/* Game Board */}
      {gameStarted && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">Trios Board</h3>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {triosBoard.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleBoardClick(index)}
                className={`aspect-square text-lg font-bold rounded-lg border-2 transition-all ${
                  cell.covered
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-white text-gray-800 border-gray-300 hover:border-primary-500 hover:bg-primary-50"
                }`}
                disabled={feedback !== "" || cell.covered}
              >
                {cell.covered ? "✓" : cell.number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {gameStarted && feedback && (
        <div className={`p-4 rounded-lg text-center mb-6 ${
          feedback.includes("Correct") || feedback.includes("THREE IN A ROW") ? "bg-green-50 border border-green-200 text-green-800" :
          feedback.includes("skipped") ? "bg-blue-50 border border-blue-200 text-blue-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {feedback}
        </div>
      )}

      {/* Skip Button */}
      {gameStarted && currentCard && feedback === "" && (
        <div className="text-center">
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
          >
            Skip Card (not on board)
          </Button>
        </div>
      )}

      {gameStarted && (
        <div className="mt-6 text-center text-xs text-gray-500">
          Get 3 in a row to win! Practice: Multiplication by {selectedMultiple}
        </div>
      )}
    </div>
  );
}