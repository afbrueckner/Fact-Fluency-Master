import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SaluteProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function Salute({ onComplete, onExit }: SaluteProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [hiddenCard, setHiddenCard] = useState<number | null>(null);
  const [sum, setSum] = useState<number | null>(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<"showing" | "guessing" | "result">("showing");
  const [gameMode, setGameMode] = useState<"addition" | "multiplication">("addition");

  const maxRounds = 12;

  const getStrategySuggestions = () => {
    if (!playerCard || !sum) return [];
    
    const suggestions = [];
    
    if (gameMode === "addition") {
      // Addition strategies
      if (sum <= 10) {
        suggestions.push("Think: What combinations make " + sum + "?");
      }
      
      if (playerCard <= 5 && sum - playerCard <= 5) {
        suggestions.push("Use your fingers: Start with " + playerCard + " and count up to " + sum);
      }
      
      if (playerCard === 0 || sum - playerCard === 0) {
        suggestions.push("Remember: Adding 0 doesn't change the number");
      }
      
      if (playerCard === 1 || sum - playerCard === 1) {
        suggestions.push("Adding 1 means the next number in sequence");
      }
      
      if (playerCard === sum - playerCard) {
        suggestions.push("This is a doubles fact: " + playerCard + " + " + playerCard + " = " + sum);
      }
      
      if (Math.abs(playerCard - (sum - playerCard)) === 1) {
        const double = Math.min(playerCard, sum - playerCard);
        suggestions.push("Near doubles: " + double + " + " + double + " = " + (double * 2) + ", then add 1");
      }
      
      if (sum === 10) {
        suggestions.push("Combinations to 10 are important foundation facts!");
      }
      
      suggestions.push("Think backwards: " + sum + " - " + playerCard + " = ?");
      
    } else {
      // Multiplication strategies
      const hiddenFactor = sum / playerCard;
      
      if (playerCard === 1 || hiddenFactor === 1) {
        suggestions.push("Multiplying by 1 keeps the number the same");
      }
      
      if (playerCard === 2 || hiddenFactor === 2) {
        suggestions.push("Multiplying by 2 is doubling: " + Math.max(playerCard, hiddenFactor) + " + " + Math.max(playerCard, hiddenFactor));
      }
      
      if (playerCard === 5 || hiddenFactor === 5) {
        const other = playerCard === 5 ? hiddenFactor : playerCard;
        suggestions.push("Multiples of 5: Count by 5s " + other + " times");
      }
      
      if (playerCard === 10 || hiddenFactor === 10) {
        const other = playerCard === 10 ? hiddenFactor : playerCard;
        suggestions.push("Multiplying by 10: Add a zero to " + other);
      }
      
      if (playerCard === hiddenFactor) {
        suggestions.push("This is a square number: " + playerCard + " × " + playerCard);
      }
      
      if (playerCard === 9 || hiddenFactor === 9) {
        const other = playerCard === 9 ? hiddenFactor : playerCard;
        suggestions.push("Multiplying by 9: Think " + other + " × 10 - " + other);
      }
      
      suggestions.push("Think division: " + sum + " ÷ " + playerCard + " = ?");
      suggestions.push("Use a known fact: Do you know a multiplication fact close to this?");
    }
    
    return suggestions.slice(0, 3); // Return up to 3 suggestions
  };

  useEffect(() => {
    dealNewRound();
  }, [gameMode]);

  const dealNewRound = () => {
    if (currentRound > maxRounds) {
      setGameComplete(true);
      return;
    }

    let card1, card2, result;
    
    if (gameMode === "addition") {
      // Deal two cards (numbers 0-10)
      card1 = Math.floor(Math.random() * 11);
      card2 = Math.floor(Math.random() * 11);
      result = card1 + card2;
    } else {
      // Multiplication mode: cards 1-10, avoid 0 and 1 for more interesting products
      card1 = Math.floor(Math.random() * 8) + 2; // 2-9
      card2 = Math.floor(Math.random() * 8) + 2; // 2-9
      result = card1 * card2;
    }
    
    setPlayerCard(card1);
    setHiddenCard(card2);
    setSum(result);
    setUserGuess("");
    setFeedback("");
    setGamePhase("showing");
    
    // Show cards briefly, then hide one
    setTimeout(() => {
      setGamePhase("guessing");
    }, 2000);
  };

  const handleGuessSubmit = () => {
    if (!hiddenCard || !sum || userGuess === "") return;

    const guess = parseInt(userGuess);
    setTotalRounds(totalRounds + 1);
    
    if (guess === hiddenCard) {
      setScore(score + 10);
      setCorrectGuesses(correctGuesses + 1);
      
      if (gameMode === "addition") {
        setFeedback(`Correct! The hidden card was ${hiddenCard}. Great job using fact families!`);
        
        // Determine strategy used for addition
        let strategy = "fact families";
        if (sum && sum <= 10) {
          strategy = "combinations to 10";
        } else if (playerCard && (playerCard === hiddenCard)) {
          strategy = "doubles";
        } else if (playerCard && Math.abs(playerCard - hiddenCard) === 1) {
          strategy = "near doubles";
        }
        
        setStrategiesUsed([...strategiesUsed, strategy]);
      } else {
        setFeedback(`Correct! The hidden card was ${hiddenCard}. Great multiplication fact work!`);
        
        // Determine strategy used for multiplication
        let strategy = "multiplication facts";
        if (playerCard && (playerCard === hiddenCard)) {
          strategy = "square numbers";
        } else if (playerCard && (playerCard === 2 || hiddenCard === 2)) {
          strategy = "doubling";
        } else if (playerCard && (playerCard === 5 || hiddenCard === 5)) {
          strategy = "multiples of 5";
        } else if (playerCard && (playerCard === 10 || hiddenCard === 10)) {
          strategy = "multiples of 10";
        }
        
        setStrategiesUsed([...strategiesUsed, strategy]);
      }
    } else {
      const operation = gameMode === "addition" ? "+" : "×";
      setFeedback(`Not quite. The hidden card was ${hiddenCard}. Remember: ${playerCard} ${operation} ${hiddenCard} = ${sum}`);
    }
    
    setGamePhase("result");
    
    setTimeout(() => {
      setCurrentRound(currentRound + 1);
      dealNewRound();
    }, 3000);
  };

  const handleComplete = () => {
    const accuracy = totalRounds > 0 ? Math.round((correctGuesses / totalRounds) * 100) : 0;
    const uniqueStrategies = Array.from(new Set(strategiesUsed));
    onComplete(score, accuracy, uniqueStrategies);
  };

  if (gameComplete) {
    const accuracy = totalRounds > 0 ? Math.round((correctGuesses / totalRounds) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Salute Complete!</h2>
        
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
            <p className="text-2xl font-bold text-purple-600">{correctGuesses}</p>
            <p className="text-sm text-purple-700">Correct Guesses</p>
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
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">👋</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Salute!</h2>
            <p className="text-sm text-gray-600">
              {gameMode === "addition" ? "Find the missing addend using fact families" : "Find the missing factor using multiplication facts"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setGameMode("addition");
                setCurrentRound(1);
                setScore(0);
                setCorrectGuesses(0);
                setTotalRounds(0);
                setStrategiesUsed([]);
                setGameComplete(false);
                dealNewRound();
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                gameMode === "addition" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Addition
            </button>
            <button
              onClick={() => {
                setGameMode("multiplication");
                setCurrentRound(1);
                setScore(0);
                setCorrectGuesses(0);
                setTotalRounds(0);
                setStrategiesUsed([]);
                setGameComplete(false);
                dealNewRound();
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                gameMode === "multiplication" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Multiplication
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={onExit}>
            Exit Game
          </Button>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-lg font-semibold text-gray-600">Round {currentRound} of {maxRounds}</span>
          <div className="w-px h-6 bg-gray-300"></div>
          <span className="text-lg font-semibold text-gray-600">Score: {score}</span>
        </div>
      </div>

      {gamePhase === "showing" && (
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Study the cards...</h3>
          <div className="flex justify-center items-center space-x-8">
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {playerCard}
            </div>
            <span className="text-3xl text-gray-400">{gameMode === "addition" ? "+" : "×"}</span>
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {hiddenCard}
            </div>
            <span className="text-3xl text-gray-400">=</span>
            <div className="w-24 h-32 bg-green-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {sum}
            </div>
          </div>
        </div>
      )}

      {gamePhase === "guessing" && (
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What's the hidden card?</h3>
          
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {playerCard}
            </div>
            <span className="text-3xl text-gray-400">{gameMode === "addition" ? "+" : "×"}</span>
            <div className="w-24 h-32 bg-gray-400 text-white rounded-lg flex items-center justify-center text-6xl shadow-lg">
              ?
            </div>
            <span className="text-3xl text-gray-400">=</span>
            <div className="w-24 h-32 bg-green-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {sum}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              {playerCard} {gameMode === "addition" ? "+" : "×"} ? = {sum}
            </p>
            <input
              type="number"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              className="text-2xl text-center border-2 border-gray-300 rounded-lg p-3 w-24 focus:border-primary-500 focus:outline-none"
              placeholder="?"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && userGuess && handleGuessSubmit()}
              min={gameMode === "addition" ? "0" : "1"}
              max={gameMode === "addition" ? "10" : "20"}
            />
          </div>

          {/* Strategy Suggestions Box */}
          {getStrategySuggestions().length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Strategy Hints
              </h4>
              <div className="space-y-2">
                {getStrategySuggestions().map((suggestion, index) => (
                  <p key={index} className="text-sm text-blue-700 bg-white rounded px-3 py-2 border border-blue-100">
                    {suggestion}
                  </p>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleGuessSubmit}
            disabled={userGuess === ""}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
          >
            Submit Guess
          </Button>
        </div>
      )}

      {gamePhase === "result" && feedback && (
        <div className={`p-6 rounded-lg text-center mb-6 ${
          feedback.includes("Correct") ? "bg-green-50 border border-green-200 text-green-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <p className="text-lg">{feedback}</p>
          {!feedback.includes("Correct") && (
            <div className="mt-4 flex justify-center items-center space-x-4">
              <div className="w-16 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {playerCard}
              </div>
              <span className="text-xl text-gray-400">{gameMode === "addition" ? "+" : "×"}</span>
              <div className="w-16 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {hiddenCard}
              </div>
              <span className="text-xl text-gray-400">=</span>
              <div className="w-16 h-20 bg-green-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {sum}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-xs text-gray-500 mt-6">
        Derived Strategies: Fact Families & Missing Addends
      </div>
    </div>
  );
}