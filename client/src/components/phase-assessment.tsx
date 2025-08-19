import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhaseAssessmentProps {
  onComplete: (results: PhaseAssessmentResults) => void;
  onCancel: () => void;
}

interface PhaseAssessmentResults {
  factArea: string;
  operation: string;
  overallPhase: string;
  confidence: number;
  indicators: PhaseIndicator[];
  recommendations: string[];
}

interface PhaseIndicator {
  phase: string;
  behavior: string;
  observed: boolean;
  weight: number;
}

// Predefined fact areas for consistent data entry
const FACT_AREAS = {
  addition: [
    "Addition Facts to 5",
    "Addition Facts to 10", 
    "Addition Facts to 20",
    "Doubles Facts (1+1, 2+2, etc.)",
    "Doubles Plus One (6+7, 8+9, etc.)",
    "Make 10 Strategy Facts",
    "Near Doubles Facts",
    "Addition with Three Addends",
    "Two-digit Addition Facts"
  ],
  multiplication: [
    "2s Multiplication Facts",
    "5s Multiplication Facts", 
    "10s Multiplication Facts",
    "Square Facts (2x2, 3x3, etc.)",
    "3s Multiplication Facts",
    "4s Multiplication Facts",
    "6s Multiplication Facts", 
    "7s Multiplication Facts",
    "8s Multiplication Facts",
    "9s Multiplication Facts",
    "Related Division Facts"
  ]
};

const PHASE_INDICATORS = {
  addition: [
    // Counting Phase Indicators
    { phase: "counting", behavior: "Uses fingers to count", weight: 3 },
    { phase: "counting", behavior: "Counts all objects/dots", weight: 3 },
    { phase: "counting", behavior: "Counts on from larger number", weight: 2 },
    { phase: "counting", behavior: "Skip counts (2, 4, 6...)", weight: 2 },
    { phase: "counting", behavior: "Takes more than 5 seconds", weight: 1 },
    
    // Deriving Phase Indicators
    { phase: "deriving", behavior: "Uses doubles facts (6+6=12, so 6+7=13)", weight: 3 },
    { phase: "deriving", behavior: "Makes ten (8+5 = 8+2+3 = 10+3)", weight: 3 },
    { phase: "deriving", behavior: "Uses compensation (29+15 = 30+15-1)", weight: 3 },
    { phase: "deriving", behavior: "Breaks apart numbers (47+25 = 40+20+7+5)", weight: 2 },
    { phase: "deriving", behavior: "Uses known facts to find unknown", weight: 2 },
    { phase: "deriving", behavior: "Explains reasoning clearly", weight: 2 },
    
    // Mastery Phase Indicators
    { phase: "mastery", behavior: "Responds in 3 seconds or less", weight: 3 },
    { phase: "mastery", behavior: "Automatic recall without hesitation", weight: 3 },
    { phase: "mastery", behavior: "Confident, accurate responses", weight: 2 },
    { phase: "mastery", behavior: "Flexible with multiple strategies", weight: 2 },
    { phase: "mastery", behavior: "Uses most efficient strategy", weight: 2 }
  ],
  multiplication: [
    // Counting Phase Indicators
    { phase: "counting", behavior: "Uses repeated addition (5×4 = 5+5+5+5)", weight: 3 },
    { phase: "counting", behavior: "Skip counts to find answer", weight: 3 },
    { phase: "counting", behavior: "Uses arrays or groups of objects", weight: 2 },
    { phase: "counting", behavior: "Counts by ones", weight: 2 },
    { phase: "counting", behavior: "Takes more than 5 seconds", weight: 1 },
    
    // Deriving Phase Indicators
    { phase: "deriving", behavior: "Uses doubling (6×4 = 6×2×2 = 12×2)", weight: 3 },
    { phase: "deriving", behavior: "Uses fives pattern (7×5 = 35)", weight: 3 },
    { phase: "deriving", behavior: "Uses square facts (8×8 = 64)", weight: 3 },
    { phase: "deriving", behavior: "Breaks apart factors (6×8 = 6×4×2)", weight: 2 },
    { phase: "deriving", behavior: "Uses known facts (know 5×6, so 6×6 = 5×6+6)", weight: 2 },
    { phase: "deriving", behavior: "Explains strategy reasoning", weight: 2 },
    
    // Mastery Phase Indicators
    { phase: "mastery", behavior: "Responds in 3 seconds or less", weight: 3 },
    { phase: "mastery", behavior: "Automatic recall without counting", weight: 3 },
    { phase: "mastery", behavior: "Confident, accurate responses", weight: 2 },
    { phase: "mastery", behavior: "Flexible with multiple strategies", weight: 2 },
    { phase: "mastery", behavior: "Selects most efficient approach", weight: 2 }
  ]
};

export function PhaseAssessment({ onComplete, onCancel }: PhaseAssessmentProps) {
  const [operation, setOperation] = useState<"addition" | "multiplication">("addition");
  const [factArea, setFactArea] = useState("");
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentIndicatorIndex, setCurrentIndicatorIndex] = useState(0);
  const [observations, setObservations] = useState<Record<number, boolean>>({});

  const indicators = PHASE_INDICATORS[operation];
  const currentIndicator = indicators[currentIndicatorIndex];

  const startAssessment = () => {
    if (!factArea) return;
    setAssessmentStarted(true);
  };

  const handleObservation = (observed: boolean) => {
    const newObservations = {
      ...observations,
      [currentIndicatorIndex]: observed
    };
    setObservations(newObservations);

    if (currentIndicatorIndex < indicators.length - 1) {
      setCurrentIndicatorIndex(currentIndicatorIndex + 1);
    } else {
      completeAssessment(newObservations);
    }
  };

  const completeAssessment = (finalObservations: Record<number, boolean>) => {
    // Calculate phase scores
    const phaseScores = { counting: 0, deriving: 0, mastery: 0 };
    
    indicators.forEach((indicator, index) => {
      if (finalObservations[index]) {
        phaseScores[indicator.phase as keyof typeof phaseScores] += indicator.weight;
      }
    });

    // Determine overall phase
    const overallPhase = Object.entries(phaseScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "counting";

    // Calculate confidence (percentage of weighted indicators observed for the dominant phase)
    const maxPossibleScore = indicators
      .filter(i => i.phase === overallPhase)
      .reduce((sum, i) => sum + i.weight, 0);
    
    const actualScore = phaseScores[overallPhase as keyof typeof phaseScores];
    const confidence = Math.round((actualScore / maxPossibleScore) * 100);

    // Create indicator results
    const indicatorResults: PhaseIndicator[] = indicators.map((indicator, index) => ({
      ...indicator,
      observed: finalObservations[index] || false
    }));

    // Generate recommendations
    const recommendations = generateRecommendations(overallPhase, confidence, indicatorResults);

    const results: PhaseAssessmentResults = {
      factArea,
      operation,
      overallPhase,
      confidence,
      indicators: indicatorResults,
      recommendations
    };

    onComplete(results);
  };

  const generateRecommendations = (
    phase: string,
    confidence: number,
    indicators: PhaseIndicator[]
  ): string[] => {
    const recommendations = [];

    if (phase === "counting") {
      recommendations.push("Focus on building number sense with visual models and manipulatives");
      recommendations.push("Introduce basic derived strategies like doubles and making ten");
      recommendations.push("Use concrete representations before moving to abstract");
      
      if (indicators.some(i => i.phase === "counting" && i.behavior.includes("fingers") && i.observed)) {
        recommendations.push("Gradually transition from finger counting to mental strategies");
      }
    } else if (phase === "deriving") {
      recommendations.push("Continue developing and practicing derived strategies");
      recommendations.push("Encourage explaining mathematical reasoning");
      recommendations.push("Build connections between different strategies");
      
      if (confidence < 70) {
        recommendations.push("Strengthen foundational understanding before advancing");
      } else {
        recommendations.push("Begin working toward automatic recall for basic facts");
      }
    } else if (phase === "mastery") {
      recommendations.push("Maintain fluency through varied practice and application");
      recommendations.push("Focus on problem-solving and mathematical reasoning");
      recommendations.push("Use mastered facts to learn more complex operations");
      
      if (confidence < 80) {
        recommendations.push("Continue practicing to solidify automatic recall");
      }
    }

    if (confidence < 60) {
      recommendations.push("Consider additional assessment to confirm phase placement");
    }

    return recommendations;
  };

  if (!assessmentStarted) {
    return (
      <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Phase Assessment Tool</h3>
          <p className="text-gray-600 mb-6">
            Systematically observe student behaviors to determine their current learning phase.
            This research-based tool helps identify whether students are in the counting, deriving, or mastery phase.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation to Assess
              </label>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setOperation("addition")}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    operation === "addition"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Addition Facts
                </button>
                <button
                  onClick={() => setOperation("multiplication")}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    operation === "multiplication"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  Multiplication Facts
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Fact Area
              </label>
              <Select value={factArea} onValueChange={setFactArea}>
                <SelectTrigger className="w-full p-3">
                  <SelectValue placeholder="Select a specific fact area to assess..." />
                </SelectTrigger>
                <SelectContent>
                  {FACT_AREAS[operation].map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-purple-800 mb-2">Assessment Process</h4>
            <ul className="text-sm text-purple-700 text-left space-y-1">
              <li>• Observe student behaviors across multiple problems</li>
              <li>• Mark which indicators you observe</li>
              <li>• System calculates most likely phase</li>
              <li>• Receive targeted teaching recommendations</li>
              <li>• Use results to guide instruction</li>
            </ul>
          </div>

          <div className="flex space-x-3 justify-center">
            <Button 
              onClick={startAssessment}
              disabled={!factArea}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Start Assessment
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
          <h3 className="text-xl font-semibold text-gray-800">Phase Assessment</h3>
          <Badge variant="outline">
            Indicator {currentIndicatorIndex + 1} of {indicators.length}
          </Badge>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndicatorIndex + 1) / indicators.length) * 100}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          Assessing: {factArea} ({operation})
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center mb-6">
          <Badge className={`mb-4 ${
            currentIndicator.phase === "counting" ? "bg-red-100 text-red-800" :
            currentIndicator.phase === "deriving" ? "bg-yellow-100 text-yellow-800" :
            "bg-green-100 text-green-800"
          }`}>
            {currentIndicator.phase.charAt(0).toUpperCase() + currentIndicator.phase.slice(1)} Phase Indicator
          </Badge>
          
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            {currentIndicator.behavior}
          </h4>
          
          <p className="text-gray-600">
            While the student is working on {factArea} problems, do you observe this behavior?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleObservation(true)}
            className="bg-green-500 hover:bg-green-600 text-white py-4 text-lg"
          >
            ✓ Yes, I observe this
          </Button>
          
          <Button
            onClick={() => handleObservation(false)}
            variant="outline"
            className="border-gray-300 hover:border-gray-400 py-4 text-lg"
          >
            ✗ No, I don't observe this
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onCancel}>
          Cancel Assessment
        </Button>
        
        <div className="text-sm text-gray-500">
          Progress: {Object.keys(observations).length} of {indicators.length} indicators observed
        </div>
      </div>

      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-sm text-purple-700">
          <strong>Tip:</strong> Observe the student working on 3-5 problems before completing this assessment. 
          Look for consistent patterns in their approach and strategy use.
        </p>
      </div>
    </div>
  );
}