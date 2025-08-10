import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface QuickLooksDisplayProps {
  onComplete: (responses: { visualDescription: string; strategy: string; numberSentence: string }) => void;
}

export function QuickLooksDisplay({ onComplete }: QuickLooksDisplayProps) {
  const [currentStep, setCurrentStep] = useState<"visual" | "discussion" | "complete">("visual");
  const [showVisual, setShowVisual] = useState(true);
  const [responses, setResponses] = useState({
    visualDescription: "",
    strategy: "",
    numberSentence: ""
  });

  // Sample visual patterns for demonstration
  const visualPatterns = [
    { dots: 5, arrangement: "line" },
    { dots: 8, arrangement: "domino" },
    { dots: 6, arrangement: "rectangle" },
    { dots: 9, arrangement: "square" }
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
    setShowVisual(true);
    setTimeout(() => setShowVisual(false), 2000);
  };

  const handleComplete = () => {
    onComplete(responses);
    setCurrentStep("complete");
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < currentPattern.dots; i++) {
      dots.push(
        <div key={i} className="w-4 h-4 bg-primary-500 rounded-full"></div>
      );
    }
    return dots;
  };

  const getArrangementClass = () => {
    switch (currentPattern.arrangement) {
      case "line":
        return "flex flex-row gap-2";
      case "domino":
        return "grid grid-cols-4 gap-2";
      case "rectangle":
        return "grid grid-cols-3 gap-2";
      case "square":
        return "grid grid-cols-3 gap-2";
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
              >
                <i className="fas fa-redo mr-2"></i>Show Again
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

            <Button 
              onClick={handleComplete}
              className="w-full bg-secondary-500 hover:bg-secondary-600 text-white"
              disabled={!responses.visualDescription || !responses.strategy || !responses.numberSentence}
            >
              Complete Session
            </Button>
          </div>
        </div>
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
