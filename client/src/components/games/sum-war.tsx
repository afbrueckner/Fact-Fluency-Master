import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TenFrame } from "@/components/ten-frame";
import { NumberLine } from "@/components/number-line";

interface SumWarProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function SumWar({ onComplete, onExit }: SumWarProps) {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerCard1, setPlayerCard1] = useState<number | null>(null);
  const [playerCard2, setPlayerCard2] = useState<number | null>(null);
  const [computerCard1, setComputerCard1] = useState<number | null>(null);
  const [computerCard2, setComputerCard2] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [gamePhase, setGamePhase] = useState<"dealing" | "showing" | "result" | "complete">("dealing");
  const [feedback, setFeedback] = useState("");
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [playerStrategy, setPlayerStrategy] = useState("");
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [showComputerAnswer, setShowComputerAnswer] = useState(false);
  const [gameMode, setGameMode] = useState<"addition" | "subtraction">("addition");
  const [visualAid, setVisualAid] = useState<"none" | "tenframes" | "numberline">("tenframes");

  const maxRounds = 10;

  useEffect(() => {
    dealNewRound();
  }, []);

  const dealNewRound = () => {
    if (round > maxRounds) {
      setGamePhase("complete");
      return;
    }

    // Deal cards (1-9 for interesting sums)
    const pCard1 = Math.floor(Math.random() * 9) + 1;
    const pCard2 = Math.floor(Math.random() * 9) + 1;
    const cCard1 = Math.floor(Math.random() * 9) + 1;
    const cCard2 = Math.floor(Math.random() * 9) + 1;

    setPlayerCard1(pCard1);
    setPlayerCard2(pCard2);
    setComputerCard1(cCard1);
    setComputerCard2(cCard2);
    setGamePhase("showing");
    setFeedback("");
    setPlayerStrategy("");
    setPlayerAnswer("");
    setShowComputerAnswer(false);
  };

  const handleBattle = () => {
    if (!playerCard1 || !playerCard2 || !computerCard1 || !computerCard2 || !playerStrategy || !playerAnswer) return;

    const playerGuess = parseInt(playerAnswer);
    const computerSum = computerCard1 + computerCard2;
    
    // Show computer answer
    setShowComputerAnswer(true);
    
    // Record strategy used
    setStrategiesUsed([...strategiesUsed, playerStrategy]);

    let roundResult = "";
    let accuracyFeedback = "";
    let correctAnswer: number;
    let playerFinalScore: number;
    
    if (gameMode === "addition") {
      // Addition mode: player finds sum
      correctAnswer = playerCard1 + playerCard2;
      playerFinalScore = correctAnswer;
      
      if (playerGuess === correctAnswer) {
        accuracyFeedback = "Correct calculation! ";
      } else {
        accuracyFeedback = `Incorrect. ${playerCard1} + ${playerCard2} = ${correctAnswer}. `;
      }
    } else {
      // Subtraction mode: player finds missing addend
      const sum = playerCard1 + playerCard2; // This becomes the target sum
      correctAnswer = playerCard2; // The missing addend
      playerFinalScore = sum; // Use the sum for comparison
      
      if (playerGuess === correctAnswer) {
        accuracyFeedback = "Correct calculation! ";
      } else {
        accuracyFeedback = `Incorrect. ${playerCard1} + ${correctAnswer} = ${sum}. `;
      }
    }
    
    // Battle comparison
    if (playerGuess === correctAnswer) {
      if (playerFinalScore > computerSum) {
        setPlayerScore(playerScore + 1);
        roundResult = "You win this round!";
      } else if (computerSum > playerFinalScore) {
        setComputerScore(computerScore + 1);
        roundResult = "Computer wins this round";
      } else {
        roundResult = "It's a tie!";
      }
    } else {
      setComputerScore(computerScore + 1);
      roundResult = "Computer wins this round (calculation error)";
    }

    const modeText = gameMode === "addition" ? "sum" : "answer";
    setFeedback(`${accuracyFeedback}${roundResult} (Your ${modeText}: ${playerFinalScore}, Computer: ${computerSum})`);
    setGamePhase("result");

    setTimeout(() => {
      setRound(round + 1);
      dealNewRound();
    }, 3000);
  };

  const getStrategySuggestion = () => {
    if (!playerCard1 || !playerCard2) return "";

    if (gameMode === "addition") {
      const sum = playerCard1 + playerCard2;
      const diff = Math.abs(playerCard1 - playerCard2);

      if (playerCard1 === playerCard2) {
        return `Double: ${playerCard1} + ${playerCard1} = ${sum}`;
      } else if (diff === 1) {
        return `Near double: ${Math.min(playerCard1, playerCard2)} + ${Math.max(playerCard1, playerCard2)} = ${Math.min(playerCard1, playerCard2)} + ${Math.min(playerCard1, playerCard2)} + 1`;
      } else if (sum === 10) {
        return `Makes 10: ${playerCard1} + ${playerCard2} = 10`;
      } else if (playerCard1 + playerCard2 > 10) {
        const makesTen = playerCard1 <= 10 - playerCard2 ? playerCard2 : playerCard1;
        const remainder = sum - 10;
        return `Make 10 first: ${makesTen} + ${10 - makesTen} = 10, then add ${remainder}`;
      }
      return `Count on: Start at ${Math.max(playerCard1, playerCard2)}, count up ${Math.min(playerCard1, playerCard2)}`;
    } else {
      // Subtraction mode suggestions
      const sum = playerCard1 + playerCard2;
      const missing = playerCard2;
      
      if (sum === 10) {
        return `Fact family of 10: ${playerCard1} + ? = 10, so ? = ${missing}`;
      } else if (sum <= 10) {
        return `Count up: Start at ${playerCard1}, count to ${sum}`;
      } else {
        return `Think addition: ${playerCard1} + ? = ${sum}, so ? = ${missing}`;
      }
    }
  };

  const handleComplete = () => {
    const totalRounds = round - 1;
    const accuracy = totalRounds > 0 ? Math.round((playerScore / totalRounds) * 100) : 0;
    const uniqueStrategies = Array.from(new Set(strategiesUsed.filter(s => s)));
    onComplete(playerScore * 10, accuracy, uniqueStrategies);
  };

  if (gamePhase === "complete") {
    const totalRounds = round - 1;
    const accuracy = totalRounds > 0 ? Math.round((playerScore / totalRounds) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">⚔️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">War Complete!</h2>
        
        <div className="mb-6">
          <div className="text-4xl font-bold mb-2">
            <span className="text-blue-600">{playerScore}</span>
            <span className="text-gray-400 mx-4">vs</span>
            <span className="text-red-600">{computerScore}</span>
          </div>
          <p className="text-gray-600">
            {playerScore > computerScore ? "Victory! You won the war! 🏆" :
             playerScore < computerScore ? "Good effort! Computer won this time." :
             "It's a tie! Well played!"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{playerScore * 10}</p>
            <p className="text-sm text-blue-700">Points Earned</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-sm text-green-700">Win Rate</p>
          </div>
        </div>

        {strategiesUsed.filter(s => s).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Strategies Used:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(strategiesUsed.filter(s => s))).map((strategy, index) => (
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
          <span className="text-3xl">⚔️</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sum War</h2>
            <p className="text-sm text-gray-600">
              {gameMode === "addition" ? "Battle with addition using derived strategies" : "Find missing addends using fact families"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setGameMode("addition");
                setPlayerStrategy("");
                setPlayerAnswer("");
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                gameMode === "addition" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Find the Sum
            </button>
            <button
              onClick={() => {
                setGameMode("subtraction");
                setPlayerStrategy("");
                setPlayerAnswer("");
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                gameMode === "subtraction" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Find Missing Addend
            </button>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1 mr-3">
            <button
              onClick={() => setVisualAid("tenframes")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                visualAid === "tenframes" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ten Frames
            </button>
            <button
              onClick={() => setVisualAid("numberline")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                visualAid === "numberline" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Number Line
            </button>
            <button
              onClick={() => setVisualAid("none")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                visualAid === "none" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              None
            </button>
          </div>
          
          <Button variant="outline" size="sm" onClick={onExit}>
            Exit Game
          </Button>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex justify-center items-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{playerScore}</div>
          <p className="text-sm text-blue-700">You</p>
        </div>
        <div className="mx-8 text-2xl text-gray-400">vs</div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{computerScore}</div>
          <p className="text-sm text-red-700">Computer</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-gray-800">Round {round} of {maxRounds}</p>
      </div>

      {/* Cards Display */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <h3 className="font-semibold text-blue-800 mb-4">Your Cards</h3>
          <div className="flex justify-center space-x-4 mb-4">
            <div className="w-16 h-24 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
              {playerCard1}
            </div>
            <div className="flex items-center">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            {gameMode === "addition" ? (
              <div className="w-16 h-24 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
                {playerCard2}
              </div>
            ) : (
              <div className="w-16 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-dashed border-blue-300">
                <input
                  type="number"
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  className="w-12 h-8 text-center text-xl font-bold bg-transparent text-white placeholder-blue-200 border-none focus:outline-none"
                  placeholder="?"
                  min="1"
                  max="9"
                />
              </div>
            )}
            <div className="flex items-center">
              <span className="text-2xl text-gray-400">=</span>
            </div>
            {gameMode === "addition" ? (
              <div className="w-16 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-dashed border-blue-300">
                <input
                  type="number"
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  className="w-12 h-8 text-center text-xl font-bold bg-transparent text-white placeholder-blue-200 border-none focus:outline-none"
                  placeholder="?"
                  min="2"
                  max="18"
                />
              </div>
            ) : (
              <div className="w-16 h-24 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
                {playerCard1! + playerCard2!}
              </div>
            )}
          </div>
          
          {/* Visual aids under player cards */}
          {visualAid === "tenframes" && playerCard1 && playerCard2 && (
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <TenFrame number={playerCard1} />
              </div>
              {gameMode === "addition" && (
                <div className="text-center">
                  <TenFrame number={playerCard2} />
                </div>
              )}
            </div>
          )}
          
          {visualAid === "numberline" && playerCard1 && playerCard2 && (
            <div className="mt-8">
              <NumberLine
                highlightNumbers={gameMode === "addition" ? [playerCard1, playerCard2, playerCard1 + playerCard2] : [playerCard1, playerCard1 + playerCard2]}
                max={18}
              />
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-red-800 mb-4">Computer Cards</h3>
          <div className="flex justify-center space-x-4 mb-4">
            <div className="w-16 h-24 bg-red-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
              {computerCard1}
            </div>
            <div className="flex items-center">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <div className="w-16 h-24 bg-red-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
              {computerCard2}
            </div>
            <div className="flex items-center">
              <span className="text-2xl text-gray-400">=</span>
            </div>
            <div className="w-16 h-24 bg-red-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold shadow-lg">
              {showComputerAnswer ? (
                computerCard1! + computerCard2!
              ) : (
                <span className="text-4xl">?</span>
              )}
            </div>
          </div>
          
          {/* Visual aids under computer cards */}
          {visualAid === "tenframes" && computerCard1 && computerCard2 && (
            <div className="flex justify-center space-x-8 mt-6">
              <div className="text-center">
                <TenFrame number={computerCard1} />
              </div>
              <div className="text-center">
                <TenFrame number={computerCard2} />
              </div>
            </div>
          )}
          
          {visualAid === "numberline" && computerCard1 && computerCard2 && (
            <div className="mt-8">
              <NumberLine
                highlightNumbers={[computerCard1, computerCard2, computerCard1 + computerCard2]}
                max={18}
              />
            </div>
          )}
        </div>
      </div>

      {/* Strategy Selection */}
      {gamePhase === "showing" && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            {gameMode === "addition" ? "How are you finding the sum?" : "How are you finding the missing addend?"}
          </h4>
          <p className="text-sm text-blue-600 mb-3">💡 Suggestion: {getStrategySuggestion()}</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {gameMode === "addition" ? (
              <>
                <button
                  onClick={() => setPlayerStrategy("doubles")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "doubles" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Doubles
                </button>
                <button
                  onClick={() => setPlayerStrategy("near doubles")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "near doubles" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Near Doubles
                </button>
                <button
                  onClick={() => setPlayerStrategy("making ten")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "making ten" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Making Ten
                </button>
                <button
                  onClick={() => setPlayerStrategy("count on")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "count on" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Count On
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPlayerStrategy("fact families")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "fact families" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Fact Families
                </button>
                <button
                  onClick={() => setPlayerStrategy("count up")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "count up" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Count Up
                </button>
                <button
                  onClick={() => setPlayerStrategy("think addition")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "think addition" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Think Addition
                </button>
                <button
                  onClick={() => setPlayerStrategy("compensation")}
                  className={`p-3 rounded-lg text-sm border-2 transition-colors ${
                    playerStrategy === "compensation" ? "border-primary-500 bg-primary-50" : "border-gray-300 bg-white"
                  }`}
                >
                  Compensation
                </button>
              </>
            )}
          </div>

          <Button 
            onClick={handleBattle}
            disabled={!playerStrategy || !playerAnswer}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            Battle!
          </Button>
        </div>
      )}

      {/* Feedback */}
      {feedback && gamePhase === "result" && (
        <div className={`p-4 rounded-lg text-center mb-6 ${
          feedback.includes("win") ? "bg-green-50 border border-green-200 text-green-800" :
          feedback.includes("tie") ? "bg-yellow-50 border border-yellow-200 text-yellow-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        {gameMode === "addition" ? "Derived Strategies Practice" : "Fact Families & Missing Addends Practice"}
      </div>
    </div>
  );
}