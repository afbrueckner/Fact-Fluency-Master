import { StudentProgress, FactCategory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DerivedStrategiesProps {
  progress: StudentProgress[];
  factCategories: FactCategory[];
}

export function DerivedStrategies({ progress, factCategories }: DerivedStrategiesProps) {
  const getProgressForCategory = (categoryId: string) => {
    return progress.find(p => p.factCategoryId === categoryId);
  };

  const getStatusBadge = (categoryProgress: StudentProgress | undefined) => {
    if (!categoryProgress) {
      return <Badge variant="destructive" className="text-xs">Not Started</Badge>;
    }
    
    if (categoryProgress.phase === "mastery" && categoryProgress.accuracy >= 90) {
      return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Mastered</Badge>;
    } else if (categoryProgress.accuracy >= 70) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Needs Practice</Badge>;
    }
  };

  // Mock derived strategies data since they're not in the initial categories
  const derivedStrategies = {
    addition: [
      {
        id: "near-doubles",
        name: "Near Doubles",
        description: "Use doubles facts to solve nearby problems",
        examples: ["6+7 = 6+6+1", "8+7 = 7+7+1", "9+8 = 8+8+1"],
        explanation: "If you know 6+6=12, then 6+7 is just one more: 13"
      },
      {
        id: "making-ten",
        name: "Making Ten",
        description: "Break apart numbers to make ten first",
        examples: ["8+3 = 8+2+1", "9+5 = 9+1+4", "7+4 = 7+3+1"],
        explanation: "Break 8+3 into 8+2+1, make 10, then add 1 more"
      },
      {
        id: "pretend-ten",
        name: "Pretend-a-Ten",
        description: "Add 10 then adjust by subtracting the difference",
        examples: ["8+6 = 8+10-4", "9+7 = 9+10-3", "7+5 = 7+10-5"],
        explanation: "8+6: pretend 6 is 10, so 8+10=18, then subtract 4"
      }
    ],
    multiplication: [
      {
        id: "adding-group",
        name: "Adding a Group",
        description: "Use known facts to build new ones by adding groups",
        examples: ["3×4 = 2×4+4", "6×3 = 5×3+3", "4×7 = 3×7+7"],
        explanation: "If you know 2×4=8, then 3×4 is 8+4=12"
      },
      {
        id: "subtracting-group",
        name: "Subtracting a Group",
        description: "Use larger known facts by subtracting a group",
        examples: ["9×6 = 10×6-6", "8×4 = 10×4-8", "7×5 = 10×5-15"],
        explanation: "If you know 10×6=60, then 9×6 is 60-6=54"
      },
      {
        id: "doubling",
        name: "Doubling",
        description: "Double known facts to find new ones",
        examples: ["4×6 = 2×(2×6)", "6×8 = 2×(3×8)", "8×4 = 2×(4×4)"],
        explanation: "If you know 2×6=12, then 4×6 is double: 24"
      },
      {
        id: "nearby-square",
        name: "Nearby Square",
        description: "Use square facts to solve nearby problems",
        examples: ["7×8 = 7×7+7", "6×7 = 7×7-7", "8×9 = 8×8+8"],
        explanation: "If you know 7×7=49, then 7×8 is 49+7=56"
      },
      {
        id: "break-apart",
        name: "Break Apart",
        description: "Break one factor into easier parts",
        examples: ["7×6 = 5×6+2×6", "8×6 = 4×6+4×6", "9×4 = 10×4-1×4"],
        explanation: "Break 7×6 into (5+2)×6 = 5×6+2×6 = 30+12=42"
      }
    ]
  };

  const handlePracticeStrategy = (strategyId: string) => {
    console.log("Practicing strategy:", strategyId);
    // In a real implementation, this would navigate to strategy practice
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Derived Fact Strategies</h2>
        
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
              <div>
                <h4 className="font-medium text-blue-800">Building on Foundation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Derived strategies use foundational facts you already know to solve new problems. 
                  Master foundational facts first, then learn these reasoning strategies for fluency.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Addition Derived Strategies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-plus text-green-500 mr-2"></i>Addition Strategies
            </h3>
            <div className="space-y-4">
              {derivedStrategies.addition.map((strategy) => (
                <div key={strategy.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{strategy.name}</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Addition
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                  
                  <div className="bg-white rounded p-3 mb-3 border-l-4 border-green-500">
                    <p className="text-xs font-medium text-green-800 mb-1">Strategy Example:</p>
                    <p className="text-sm text-green-700">{strategy.explanation}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Practice Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handlePracticeStrategy(strategy.id)}
                  >
                    <i className="fas fa-play mr-2"></i>Practice Strategy
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Multiplication Derived Strategies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-times text-purple-500 mr-2"></i>Multiplication Strategies
            </h3>
            <div className="space-y-4">
              {derivedStrategies.multiplication.map((strategy) => (
                <div key={strategy.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{strategy.name}</h4>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                      Multiplication
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                  
                  <div className="bg-white rounded p-3 mb-3 border-l-4 border-purple-500">
                    <p className="text-xs font-medium text-purple-800 mb-1">Strategy Example:</p>
                    <p className="text-sm text-purple-700">{strategy.explanation}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Practice Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.examples.map((example, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                    onClick={() => handlePracticeStrategy(strategy.id)}
                  >
                    <i className="fas fa-play mr-2"></i>Practice Strategy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Development Timeline */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Strategy Development Timeline</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Master Foundational Facts</p>
                <p className="text-sm text-gray-600">Build automatic recall of basic patterns like doubles, +1/+2, ×2/×5/×10</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Learn Derived Strategies</p>
                <p className="text-sm text-gray-600">Use known facts to reason through new problems with understanding</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Achieve Fluency</p>
                <p className="text-sm text-gray-600">Select appropriate strategies automatically with accuracy and efficiency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
