import { useState, useRef, DragEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FactCategory, SelfAssessment, InsertSelfAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface StudentSelfAssessmentProps {
  studentId: string;
  onComplete?: () => void;
}

interface MathFact {
  id: string;
  problem: string;
  answer: number;
  category: string;
}

interface DropZone {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

// Foundational facts sorting categories based on Bay-Williams & Kling framework
const FOUNDATIONAL_DROP_ZONES: DropZone[] = [
  {
    id: "know-it",
    title: "I Know It",
    description: "I can answer this quickly and confidently",
    color: "bg-green-50 border-green-300 text-green-800",
    icon: "✓"
  },
  {
    id: "used-strategy", 
    title: "I Used a Strategy",
    description: "I figured it out using a thinking strategy",
    color: "bg-blue-50 border-blue-300 text-blue-800",
    icon: "🧠"
  },
  {
    id: "counted",
    title: "I Counted",
    description: "I had to count to solve this",
    color: "bg-orange-50 border-orange-300 text-orange-800",
    icon: "📱"
  }
];

// Combinations of 10 sorting categories
const COMBINATIONS_DROP_ZONES: DropZone[] = [
  {
    id: "less-than-10",
    title: "Less Than 10",
    description: "The sum is less than 10",
    color: "bg-red-50 border-red-300 text-red-800",
    icon: "↓"
  },
  {
    id: "equal-to-10",
    title: "Equal to 10", 
    description: "The sum equals exactly 10",
    color: "bg-green-50 border-green-300 text-green-800",
    icon: "="
  },
  {
    id: "more-than-10",
    title: "More Than 10",
    description: "The sum is greater than 10",
    color: "bg-purple-50 border-purple-300 text-purple-800",
    icon: "↑"
  }
];

// Generate math facts based on Bay-Williams framework
const generateFoundationalFacts = (): MathFact[] => {
  const facts: MathFact[] = [];
  
  // +/- 1 or 2 facts
  for (let i = 1; i <= 10; i++) {
    facts.push({
      id: `add-1-${i}`,
      problem: `${i} + 1`,
      answer: i + 1,
      category: 'foundational'
    });
    facts.push({
      id: `add-2-${i}`,
      problem: `${i} + 2`, 
      answer: i + 2,
      category: 'foundational'
    });
  }
  
  // Doubles facts
  for (let i = 1; i <= 10; i++) {
    facts.push({
      id: `double-${i}`,
      problem: `${i} + ${i}`,
      answer: i + i,
      category: 'foundational'
    });
  }
  
  // 10 + facts
  for (let i = 1; i <= 10; i++) {
    facts.push({
      id: `ten-plus-${i}`,
      problem: `10 + ${i}`,
      answer: 10 + i,
      category: 'foundational'
    });
  }
  
  return facts.slice(0, 15); // Limit to manageable set
};

const generateCombinationsOf10Facts = (): MathFact[] => {
  const facts: MathFact[] = [];
  
  // Generate various addition problems with different sums
  const problems = [
    [3, 4], [2, 5], [6, 2], [4, 3], [1, 6], // Less than 10
    [5, 5], [4, 6], [3, 7], [2, 8], [1, 9], // Equal to 10
    [6, 7], [5, 8], [7, 6], [8, 5], [9, 4]  // More than 10
  ];
  
  problems.forEach(([a, b], index) => {
    facts.push({
      id: `combo-${index}`,
      problem: `${a} + ${b}`,
      answer: a + b,
      category: 'combinations'
    });
  });
  
  return facts;
};

export function StudentSelfAssessment({ studentId, onComplete }: StudentSelfAssessmentProps) {
  const [currentAssessmentType, setCurrentAssessmentType] = useState<'foundational' | 'combinations' | null>(null);
  const [facts, setFacts] = useState<MathFact[]>([]);
  const [sortedFacts, setSortedFacts] = useState<{ [key: string]: MathFact[] }>({});
  const [draggedFact, setDraggedFact] = useState<MathFact | null>(null);
  const [confidence, setConfidence] = useState<number>(3);
  const [showResults, setShowResults] = useState(false);

  const queryClient = useQueryClient();

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: (data: InsertSelfAssessment) => 
      apiRequest("POST", `/api/students/${studentId}/self-assessments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/self-assessments`] });
    },
  });

  const startFoundationalAssessment = () => {
    const foundationalFacts = generateFoundationalFacts();
    setFacts(foundationalFacts);
    setCurrentAssessmentType('foundational');
    setSortedFacts({});
    setShowResults(false);
  };

  const startCombinationsAssessment = () => {
    const combinationFacts = generateCombinationsOf10Facts();
    setFacts(combinationFacts);
    setCurrentAssessmentType('combinations');
    setSortedFacts({});
    setShowResults(false);
  };

  const handleDragStart = (e: DragEvent, fact: MathFact) => {
    setDraggedFact(fact);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, dropZoneId: string) => {
    e.preventDefault();
    if (!draggedFact) return;

    // Remove fact from unsorted facts
    setFacts(prev => prev.filter(f => f.id !== draggedFact.id));
    
    // Add fact to sorted category
    setSortedFacts(prev => ({
      ...prev,
      [dropZoneId]: [...(prev[dropZoneId] || []), draggedFact]
    }));
    
    setDraggedFact(null);
  };

  const handleFactReturn = (fact: MathFact, fromZone: string) => {
    // Remove from sorted zone
    setSortedFacts(prev => ({
      ...prev,
      [fromZone]: prev[fromZone].filter(f => f.id !== fact.id)
    }));
    
    // Return to unsorted facts
    setFacts(prev => [...prev, fact]);
  };

  const completeAssessment = async () => {
    const totalFacts = Object.values(sortedFacts).flat().length;
    const unsortedCount = facts.length;
    
    if (totalFacts === 0) return;

    // Create summary of sorting results
    const sortingSummary = Object.entries(sortedFacts).map(([zone, facts]) => ({
      category: zone,
      count: facts.length,
      facts: facts.map(f => f.problem)
    }));

    const assessmentData: InsertSelfAssessment = {
      studentId,
      factCategoryId: currentAssessmentType === 'foundational' ? 'foundational-addition' : 'combinations-of-10',
      sortingChoice: JSON.stringify(sortingSummary),
      confidence,
      notes: `Assessment type: ${currentAssessmentType}. Sorted ${totalFacts} facts, ${unsortedCount} unsorted.`
    };

    try {
      await saveAssessmentMutation.mutateAsync(assessmentData);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  const resetAssessment = () => {
    setCurrentAssessmentType(null);
    setFacts([]);
    setSortedFacts({});
    setShowResults(false);
  };

  const getCurrentDropZones = () => {
    return currentAssessmentType === 'foundational' ? FOUNDATIONAL_DROP_ZONES : COMBINATIONS_DROP_ZONES;
  };

  if (showResults) {
    const totalSorted = Object.values(sortedFacts).flat().length;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Assessment Complete!</h3>
          <p className="text-gray-600">You sorted {totalSorted} math facts. Great job reflecting on your learning!</p>
        </div>

        <div className="grid gap-4">
          {getCurrentDropZones().map(zone => {
            const zoneFacts = sortedFacts[zone.id] || [];
            return (
              <div key={zone.id} className={`p-4 rounded-lg border-2 ${zone.color}`}>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>{zone.icon}</span>
                  {zone.title} ({zoneFacts.length} facts)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {zoneFacts.map(fact => (
                    <Badge key={fact.id} variant="secondary" className="text-sm">
                      {fact.problem}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={resetAssessment} variant="outline">
            Try Another Assessment
          </Button>
          <Button onClick={onComplete}>
            Finish
          </Button>
        </div>
      </div>
    );
  }

  if (!currentAssessmentType) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Student Self-Assessment</h3>
          <p className="text-gray-600">Choose an assessment type to begin sorting math facts</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-semibold text-blue-800 mb-2">Foundational Addition Facts</h4>
            <p className="text-blue-700 text-sm mb-4">
              Sort addition facts based on how you solve them: know it, use a strategy, or count.
            </p>
            <Button onClick={startFoundationalAssessment} className="w-full">
              Start Foundational Facts
            </Button>
          </div>

          <div className="p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
            <h4 className="font-semibold text-purple-800 mb-2">Combinations & Sums</h4>
            <p className="text-purple-700 text-sm mb-4">
              Sort addition problems by their sum: less than 10, equal to 10, or more than 10.
            </p>
            <Button onClick={startCombinationsAssessment} className="w-full">
              Start Combinations Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {currentAssessmentType === 'foundational' ? 'Foundational Addition Facts' : 'Combinations & Sums'}
        </h3>
        <p className="text-gray-600">
          Drag each math fact card to the category that best describes how you would solve it
        </p>
      </div>

      {/* Unsorted Facts */}
      {facts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Math Facts to Sort ({facts.length} remaining)</h4>
          <div className="flex flex-wrap gap-2">
            {facts.map(fact => (
              <div
                key={fact.id}
                draggable
                onDragStart={(e) => handleDragStart(e, fact)}
                className="bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-lg font-mono text-center">{fact.problem}</div>
                <div className="text-xs text-gray-500 text-center mt-1">= {fact.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop Zones */}
      <div className="grid gap-4">
        {getCurrentDropZones().map(zone => {
          const zoneFacts = sortedFacts[zone.id] || [];
          return (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zone.id)}
              className={`min-h-24 p-4 rounded-lg border-2 border-dashed ${zone.color} transition-all hover:border-solid hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">{zone.icon}</span>
                  {zone.title}
                </h4>
                <Badge variant="outline">{zoneFacts.length}</Badge>
              </div>
              <p className="text-sm opacity-75 mb-3">{zone.description}</p>
              
              {zoneFacts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {zoneFacts.map(fact => (
                    <div
                      key={fact.id}
                      onClick={() => handleFactReturn(fact, zone.id)}
                      className="bg-white border rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-mono">{fact.problem}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {zoneFacts.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  Drop math facts here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confidence Rating */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">How confident do you feel about these facts?</h4>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => setConfidence(rating)}
              className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                confidence === rating
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          1 = Not confident • 5 = Very confident
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button onClick={resetAssessment} variant="outline">
          Start Over
        </Button>
        <Button 
          onClick={completeAssessment}
          disabled={Object.values(sortedFacts).flat().length === 0}
        >
          Complete Assessment
        </Button>
      </div>
    </div>
  );
}