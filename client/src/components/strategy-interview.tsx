import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StrategyInterviewProps {
  onComplete: (results: InterviewResults) => void;
  onCancel: () => void;
}

interface InterviewResults {
  factArea: string;
  problems: ProblemResult[];
  overallPhase: string;
  strategiesObserved: string[];
  accuracy: number;
  recommendations: string[];
}

interface ProblemResult {
  problem: string;
  studentAnswer: string;
  isCorrect: boolean;
  strategy: string;
  phase: string;
  reasoning: string;
}

const INTERVIEW_PROBLEMS = [
  {
    addition: [
      { problem: "6 + 7", type: "near-doubles", expectedPhase: "deriving" },
      { problem: "8 + 8", type: "doubles", expectedPhase: "counting" },
      { problem: "9 + 4", type: "making-ten", expectedPhase: "deriving" },
      { problem: "5 + 3", type: "basic", expectedPhase: "mastery" },
      { problem: "7 + 5", type: "bridging-ten", expectedPhase: "deriving" }
    ],
    multiplication: [
      { problem: "6 × 2", type: "doubling", expectedPhase: "counting" },
      { problem: "7 × 5", type: "fives", expectedPhase: "deriving" },
      { problem: "8 × 8", type: "squares", expectedPhase: "deriving" },
      { problem: "4 × 3", type: "basic", expectedPhase: "mastery" },
      { problem: "9 × 6", type: "complex", expectedPhase: "deriving" }
    ]
  }
];

export function StrategyInterview({ onComplete, onCancel }: StrategyInterviewProps) {
  const [operation, setOperation] = useState<"addition" | "multiplication">("addition");
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [results, setResults] = useState<ProblemResult[]>([]);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [showStrategyPrompt, setShowStrategyPrompt] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const currentProblems = INTERVIEW_PROBLEMS[0][operation];
  const currentProblem = currentProblems[currentProblemIndex];

  const strategies = {
    addition: [
      "Counting on fingers/objects",
      "Counting all",
      "Counting on",
      "Doubles fact",
      "Near doubles (+1/-1)",
      "Making ten",
      "Known fact",
      "Breaking apart",
      "Compensation",
      "Automatic recall"
    ],
    multiplication: [
      "Skip counting",
      "Repeated addition",
      "Arrays/groups",
      "Doubling",
      "Fives patterns",
      "Tens patterns",
      "Square numbers",
      "Breaking apart",
      "Known fact",
      "Automatic recall"
    ]
  };

  const startInterview = () => {
    setInterviewStarted(true);
  };

  const handleProblemComplete = () => {
    if (!studentAnswer || !selectedStrategy || !selectedPhase) return;

    const isCorrect = checkAnswer(currentProblem.problem, studentAnswer);
    
    const problemResult: ProblemResult = {
      problem: currentProblem.problem,
      studentAnswer,
      isCorrect,
      strategy: selectedStrategy,
      phase: selectedPhase,
      reasoning
    };

    const newResults = [...results, problemResult];
    setResults(newResults);

    // Clear form
    setStudentAnswer("");
    setSelectedStrategy("");
    setSelectedPhase("");
    setReasoning("");
    setShowStrategyPrompt(false);

    if (currentProblemIndex < currentProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      completeInterview(newResults);
    }
  };

  const checkAnswer = (problem: string, answer: string): boolean => {
    const [a, op, b] = problem.split(' ');
    const numA = parseInt(a);
    const numB = parseInt(b);
    const studentNum = parseInt(answer);

    if (op === '+') return studentNum === numA + numB;
    if (op === '×') return studentNum === numA * numB;
    return false;
  };

  const completeInterview = (finalResults: ProblemResult[]) => {
    const accuracy = (finalResults.filter(r => r.isCorrect).length / finalResults.length) * 100;
    
    // Determine overall phase
    const phaseCounts = finalResults.reduce((counts, result) => {
      counts[result.phase] = (counts[result.phase] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const overallPhase = Object.entries(phaseCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "counting";

    // Collect unique strategies
    const strategiesObserved = Array.from(new Set(finalResults.map(r => r.strategy)));

    // Generate recommendations
    const recommendations = generateRecommendations(finalResults, accuracy, overallPhase);

    const interviewResults: InterviewResults = {
      factArea: operation,
      problems: finalResults,
      overallPhase,
      strategiesObserved,
      accuracy,
      recommendations
    };

    onComplete(interviewResults);
  };

  const generateRecommendations = (results: ProblemResult[], accuracy: number, phase: string): string[] => {
    const recommendations = [];

    if (accuracy < 70) {
      recommendations.push("Focus on foundational fact practice and concrete representations");
    }

    const countingStrategies = results.filter(r => 
      r.strategy.includes("Counting") || r.strategy.includes("fingers")
    ).length;

    if (countingStrategies > results.length / 2) {
      recommendations.push("Encourage derived strategy development through visual models and number relationships");
    }

    const strategiesUsed = new Set(results.map(r => r.strategy)).size;
    if (strategiesUsed <= 2) {
      recommendations.push("Introduce multiple strategies to build flexibility");
    }

    if (phase === "counting") {
      recommendations.push("Use manipulatives and visual aids to support strategy development");
    } else if (phase === "deriving") {
      recommendations.push("Continue practicing derived strategies to build automaticity");
    } else {
      recommendations.push("Maintain fluency through varied practice and application");
    }

    return recommendations;
  };

  if (!interviewStarted) {
    return (
      <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Strategy Interview</h3>
          <p className="text-gray-600 mb-6">
            A research-based assessment tool to understand how students think about math facts.
            This will help identify their current phase and preferred strategies.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Operation to Assess
            </label>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setOperation("addition")}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  operation === "addition"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                Addition Facts
              </button>
              <button
                onClick={() => setOperation("multiplication")}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  operation === "multiplication"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                Multiplication Facts
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Interview Process</h4>
            <ul className="text-sm text-yellow-700 text-left space-y-1">
              <li>• Present 5 carefully selected problems</li>
              <li>• Ask student to solve and explain their thinking</li>
              <li>• Observe and record strategy use</li>
              <li>• Document reasoning and phase indicators</li>
              <li>• Receive personalized recommendations</li>
            </ul>
          </div>

          <div className="flex space-x-3 justify-center">
            <Button onClick={startInterview} className="bg-blue-500 hover:bg-blue-600">
              Start Interview
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 max-w-3xl mx-auto rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Strategy Interview</h3>
          <Badge variant="outline">
            Problem {currentProblemIndex + 1} of {currentProblems.length}
          </Badge>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentProblemIndex + 1) / currentProblems.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-2">
            {currentProblem.problem} = ?
          </h4>
          <p className="text-gray-600">
            Ask the student to solve this problem and explain their thinking
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student's Answer
            </label>
            <input
              type="number"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              className="w-full p-3 border rounded-lg text-center text-xl"
              placeholder="Enter answer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strategy Observed
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select strategy...</option>
              {strategies[operation].map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Phase
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["counting", "deriving", "mastery"].map((phase) => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  selectedPhase === phase
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student's Reasoning/Explanation
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Record how the student explained their thinking..."
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel Interview
        </Button>
        
        <Button 
          onClick={handleProblemComplete}
          disabled={!studentAnswer || !selectedStrategy || !selectedPhase}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {currentProblemIndex < currentProblems.length - 1 ? "Next Problem" : "Complete Interview"}
        </Button>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Focus on understanding the student's thinking process rather than just the answer. 
          Ask follow-up questions like "How did you figure that out?" or "Can you show me another way?"
        </p>
      </div>
    </div>
  );
}