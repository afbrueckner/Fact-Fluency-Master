import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuickLooksObservationTool } from "./quick-looks-observation-tool";

interface QuickLooksDisplayProps {
  onComplete: (responses: { visualDescription: string; strategy: string; numberSentence: string }) => void;
  studentId?: string;
  enableTeacherMode?: boolean;
}

export function QuickLooksDisplay({ onComplete, studentId = "student-1", enableTeacherMode = false }: QuickLooksDisplayProps) {
  const [currentStep, setCurrentStep] = useState<"visual" | "discussion" | "teacher-observations" | "complete">("visual");
  const [showVisual, setShowVisual] = useState(true);
  const [showAgainDisabled, setShowAgainDisabled] = useState(false);
  const [responses, setResponses] = useState({
    visualDescription: "",
    strategy: "",
    numberSentence: ""
  });

  // Comprehensive visual patterns based on Bay-Williams framework
  const visualPatterns = [
    // Ten Frame patterns (foundational for combinations of 10)
    { dots: 5, arrangement: "ten-frame", factCategory: "add-combinations-10", description: "Five in ten frame" },
    { dots: 8, arrangement: "ten-frame", factCategory: "add-combinations-10", description: "Eight in ten frame" },
    { dots: 10, arrangement: "ten-frame", factCategory: "add-combinations-10", description: "Full ten frame" },
    
    // Domino patterns (doubles and near doubles)
    { dots: 6, arrangement: "domino-3x2", factCategory: "add-doubles", description: "Double 3 domino" },
    { dots: 8, arrangement: "domino-4x2", factCategory: "add-doubles", description: "Double 4 domino" },
    { dots: 10, arrangement: "domino-5x2", factCategory: "add-doubles", description: "Double 5 domino" },
    
    // Array patterns (multiplication foundation)
    { dots: 6, arrangement: "array-2x3", factCategory: "mult-2-5-10", description: "2×3 array" },
    { dots: 10, arrangement: "array-2x5", factCategory: "mult-2-5-10", description: "2×5 array" },
    { dots: 12, arrangement: "array-3x4", factCategory: "mult-squares", description: "3×4 array" },
    
    // Scattered patterns (subitizing)
    { dots: 4, arrangement: "scattered-small", factCategory: "add-plus-minus-1-2", description: "Four scattered dots" },
    { dots: 7, arrangement: "scattered-medium", factCategory: "add-plus-minus-1-2", description: "Seven scattered dots" },
    
    // Line patterns (addition/subtraction)
    { dots: 5, arrangement: "line", factCategory: "add-plus-minus-1-2", description: "Five in a line" },
    { dots: 9, arrangement: "line", factCategory: "add-plus-minus-1-2", description: "Nine in a line" },
    
    // Grouped patterns (part-part-whole)
    { dots: 6, arrangement: "groups-3-3", factCategory: "add-doubles", description: "Two groups of 3" },
    { dots: 8, arrangement: "groups-4-4", factCategory: "add-doubles", description: "Two groups of 4" },
    { dots: 9, arrangement: "groups-5-4", factCategory: "add-near-doubles", description: "Groups of 5 and 4" },
    
    // Circle patterns
    { dots: 8, arrangement: "circle", factCategory: "add-combinations-10", description: "Eight in circle" },
    { dots: 12, arrangement: "circle", factCategory: "mult-squares", description: "Twelve in circle" }
  ];

  const [currentPattern] = useState(
    visualPatterns[Math.floor(Math.random() * visualPatterns.length)]
  );

  useEffect(() => {
    if (currentStep === "visual") {
      const timer = setTimeout(() => {
        setShowVisual(false);
        setCurrentStep("discussion");
      }, 3000); // Show visual for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleShowAgain = () => {
    setShowAgainDisabled(true);
    setShowVisual(true);
    setTimeout(() => {
      setShowVisual(false);
      setShowAgainDisabled(false);
    }, 2000);
  };

  const handleComplete = () => {
    onComplete(responses);
    setCurrentStep("complete");
  };

  const renderDots = () => {
    const { arrangement, dots: dotCount } = currentPattern;
    const dots = [];
    
    // Handle special arrangements
    if (arrangement === "groups-3-3") {
      return (
        <>
          <div className="flex gap-1">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
          <div className="flex gap-1">
            {Array(3).fill(0).map((_, i) => (
              <div key={i + 3} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
        </>
      );
    }
    
    if (arrangement === "groups-4-4") {
      return (
        <>
          <div className="grid grid-cols-2 gap-1">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Array(4).fill(0).map((_, i) => (
              <div key={i + 4} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
        </>
      );
    }
    
    if (arrangement === "groups-5-4") {
      return (
        <>
          <div className="grid grid-cols-3 gap-1">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Array(4).fill(0).map((_, i) => (
              <div key={i + 5} className="w-4 h-4 bg-primary-500 rounded-full"></div>
            ))}
          </div>
        </>
      );
    }
    
    if (arrangement === "circle") {
      const radius = 48;
      const centerX = 64;
      const centerY = 64;
      const angleStep = (2 * Math.PI) / dotCount;
      
      return Array(dotCount).fill(0).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 8;
        const y = centerY + radius * Math.sin(angle) - 8;
        
        return (
          <div
            key={i}
            className="absolute w-4 h-4 bg-primary-500 rounded-full"
            style={{ left: `${x}px`, top: `${y}px` }}
          />
        );
      });
    }
    
    if (arrangement.includes("scattered")) {
      const positions = arrangement === "scattered-small" 
        ? [[8, 8], [32, 16], [16, 32], [40, 40]]
        : [[12, 8], [48, 12], [24, 28], [56, 32], [8, 48], [36, 52], [64, 24]];
      
      return Array(dotCount).fill(0).map((_, i) => {
        const pos = positions[i] || [Math.random() * 80, Math.random() * 80];
        return (
          <div
            key={i}
            className="absolute w-4 h-4 bg-primary-500 rounded-full"
            style={{ left: `${pos[0]}px`, top: `${pos[1]}px` }}
          />
        );
      });
    }
    
    // Default grid rendering
    for (let i = 0; i < dotCount; i++) {
      dots.push(
        <div key={i} className="w-4 h-4 bg-primary-500 rounded-full"></div>
      );
    }
    return dots;
  };

  const getArrangementClass = () => {
    switch (currentPattern.arrangement) {
      case "ten-frame":
        return "grid grid-cols-5 gap-1 p-2 border-2 border-gray-800 bg-white rounded";
      case "domino-3x2":
        return "grid grid-cols-3 grid-rows-2 gap-1 p-2 border-2 border-gray-800 bg-white rounded";
      case "domino-4x2":
        return "grid grid-cols-4 grid-rows-2 gap-1 p-2 border-2 border-gray-800 bg-white rounded";
      case "domino-5x2":
        return "grid grid-cols-5 grid-rows-2 gap-1 p-2 border-2 border-gray-800 bg-white rounded";
      case "array-2x3":
        return "grid grid-cols-2 grid-rows-3 gap-2";
      case "array-2x5":
        return "grid grid-cols-2 grid-rows-5 gap-2";
      case "array-3x4":
        return "grid grid-cols-3 grid-rows-4 gap-2";
      case "line":
        return "flex flex-row gap-2";
      case "groups-3-3":
        return "flex flex-row gap-6";
      case "groups-4-4":
        return "flex flex-row gap-6";
      case "groups-5-4":
        return "flex flex-row gap-6";
      case "circle":
        return "relative w-32 h-32";
      case "scattered-small":
        return "relative w-24 h-24";
      case "scattered-medium":
        return "relative w-32 h-28";
      default:
        return "grid grid-cols-5 gap-2";
    }
  };

  if (currentStep === "visual") {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Look - Watch Carefully!</h3>
        <div className="bg-white rounded-lg p-8 mb-4 min-h-32 flex items-center justify-center border-2 border-dashed border-gray-300">
          {showVisual ? (
            <div className={getArrangementClass()}>
              {renderDots()}
            </div>
          ) : (
            <div className="text-gray-400">
              <i className="fas fa-eye-slash text-4xl mb-2"></i>
              <p>What did you see?</p>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">Visual will appear for 3 seconds...</p>
      </div>
    );
  }

  if (currentStep === "discussion") {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Discussion & Reflection</h3>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-lg p-8 mb-4 min-h-32 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-center">
                <i className="fas fa-eye-slash text-2xl mb-2"></i>
                <p className="text-sm">Visual Hidden</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={handleShowAgain}
                className="px-4 py-2"
                disabled={showAgainDisabled}
              >
                <i className="fas fa-redo mr-2"></i>
                {showAgainDisabled ? 'Showing...' : 'Show Again'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <label className="text-sm font-medium text-blue-800 block mb-2">
                What did you see?
              </label>
              <textarea
                className="w-full p-2 border rounded text-sm"
                rows={2}
                placeholder="Describe what you saw..."
                value={responses.visualDescription}
                onChange={(e) => setResponses(prev => ({
                  ...prev,
                  visualDescription: e.target.value
                }))}
              />
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <label className="text-sm font-medium text-green-800 block mb-2">
                How did you see it?
              </label>
              <textarea
                className="w-full p-2 border rounded text-sm"
                rows={2}
                placeholder="Explain your strategy..."
                value={responses.strategy}
                onChange={(e) => setResponses(prev => ({
                  ...prev,
                  strategy: e.target.value
                }))}
              />
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <label className="text-sm font-medium text-purple-800 block mb-2">
                What number sentence matches?
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm"
                placeholder="e.g., 3+2=5"
                value={responses.numberSentence}
                onChange={(e) => setResponses(prev => ({
                  ...prev,
                  numberSentence: e.target.value
                }))}
              />
            </div>

            {enableTeacherMode ? (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep("teacher-observations")}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <i className="fas fa-clipboard mr-2"></i>Record Observations
                </Button>
                <Button 
                  onClick={handleComplete}
                  variant="outline"
                  className="flex-1"
                >
                  Skip & Finish
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleComplete}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white"
                disabled={!responses.visualDescription || !responses.strategy || !responses.numberSentence}
              >
                Complete Session
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "teacher-observations") {
    return (
      <div className="space-y-6">
        <QuickLooksObservationTool
          pattern={{
            dots: currentPattern.dots,
            arrangement: currentPattern.arrangement,
            factCategory: currentPattern.factCategory,
            description: currentPattern.description
          }}
          studentId={studentId}
          onComplete={() => {
            handleComplete();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-green-50 rounded-lg p-6 text-center border-2 border-green-200">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="fas fa-check text-white text-2xl"></i>
      </div>
      <h3 className="font-semibold text-green-800 mb-2">Session Complete!</h3>
      <p className="text-sm text-green-700">Your responses have been recorded for assessment.</p>
    </div>
  );
}
