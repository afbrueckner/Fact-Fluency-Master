import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FactCategory, SelfAssessment, InsertSelfAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface StudentSelfAssessmentProps {
  studentId: string;
  onComplete?: () => void;
}

const SORTING_CATEGORIES = [
  {
    id: "know-quickly",
    title: "I Know These Quickly",
    description: "I can solve these fast and I'm confident in my answers",
    color: "bg-green-100 text-green-800 border-green-300",
    emoji: "🚀"
  },
  {
    id: "know-slowly", 
    title: "I Know These, But Slowly",
    description: "I can figure these out, but it takes me some time",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    emoji: "🤔"
  },
  {
    id: "still-learning",
    title: "I'm Still Learning These",
    description: "These are challenging for me and I need more practice",
    color: "bg-red-100 text-red-800 border-red-300", 
    emoji: "📚"
  }
];

export function StudentSelfAssessment({ studentId, onComplete }: StudentSelfAssessmentProps) {
  const [currentCategory, setCurrentCategory] = useState<FactCategory | null>(null);
  const [sortingChoice, setSortingChoice] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);

  const queryClient = useQueryClient();

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  const { data: existingAssessments = [] } = useQuery<SelfAssessment[]>({
    queryKey: [`/api/students/${studentId}/self-assessments`],
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: (data: InsertSelfAssessment) => 
      apiRequest("POST", `/api/students/${studentId}/self-assessments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/self-assessments`] });
    },
  });

  // Filter out categories that have already been assessed today
  const unassessedCategories = factCategories.filter(category => {
    const today = new Date().toDateString();
    return !existingAssessments.some(assessment => 
      assessment.factCategoryId === category.id && 
      assessment.createdAt && new Date(assessment.createdAt).toDateString() === today
    );
  });

  useEffect(() => {
    if (assessmentStarted && unassessedCategories.length > 0) {
      setCurrentCategory(unassessedCategories[categoryIndex] || null);
    }
  }, [assessmentStarted, categoryIndex, unassessedCategories]);

  const handleStartAssessment = () => {
    if (unassessedCategories.length === 0) {
      return;
    }
    setAssessmentStarted(true);
    setCategoryIndex(0);
    setSortingChoice("");
    setConfidence(3);
    setNotes("");
  };

  const handleSortingChoice = async (choice: string) => {
    if (!currentCategory) return;

    setSortingChoice(choice);
    
    const assessmentData: InsertSelfAssessment = {
      studentId,
      factCategoryId: currentCategory.id,
      sortingChoice: choice,
      confidence,
      notes: notes.trim() || undefined,
    };

    try {
      await saveAssessmentMutation.mutateAsync(assessmentData);
      
      // Move to next category or complete
      if (categoryIndex < unassessedCategories.length - 1) {
        setCategoryIndex(categoryIndex + 1);
        setSortingChoice("");
        setNotes("");
        setConfidence(3);
      } else {
        setAssessmentStarted(false);
        onComplete?.();
      }
    } catch (error) {
      console.error("Failed to save self assessment:", error);
    }
  };

  const getFactExamples = (category: FactCategory) => {
    const examples = [];
    if (category.operation === "addition") {
      examples.push(`${category.name.includes("1") ? "7 + 1" : category.name.includes("doubles") ? "6 + 6" : "8 + 5"}`);
      examples.push(`${category.name.includes("1") ? "4 + 1" : category.name.includes("doubles") ? "4 + 4" : "7 + 6"}`);
    } else if (category.operation === "subtraction") {
      examples.push(`${category.name.includes("1") ? "8 - 1" : category.name.includes("doubles") ? "12 - 6" : "13 - 5"}`);
      examples.push(`${category.name.includes("1") ? "5 - 1" : category.name.includes("doubles") ? "8 - 4" : "14 - 6"}`);
    } else if (category.operation === "multiplication") {
      examples.push(`${category.name.includes("2") ? "6 × 2" : category.name.includes("5") ? "7 × 5" : "8 × 4"}`);
      examples.push(`${category.name.includes("2") ? "9 × 2" : category.name.includes("5") ? "6 × 5" : "7 × 6"}`);
    } else if (category.operation === "division") {
      examples.push(`${category.name.includes("2") ? "12 ÷ 2" : category.name.includes("5") ? "35 ÷ 5" : "32 ÷ 4"}`);
      examples.push(`${category.name.includes("2") ? "18 ÷ 2" : category.name.includes("5") ? "30 ÷ 5" : "42 ÷ 6"}`);
    }
    return examples;
  };

  if (!assessmentStarted) {
    return (
      <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Math Facts Self-Assessment</h3>
          <p className="text-gray-600 mb-6">
            Help us understand how you feel about different math facts by sorting them into three groups.
          </p>

          <div className="grid gap-4 mb-6">
            {SORTING_CATEGORIES.map((category) => (
              <div key={category.id} className={`border-2 rounded-lg p-4 ${category.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <h4 className="font-semibold">{category.title}</h4>
                </div>
                <p className="text-sm">{category.description}</p>
              </div>
            ))}
          </div>

          {unassessedCategories.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700">
                ✓ You've completed your self-assessment for today! Great job reflecting on your learning.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-700 text-sm">
                <strong>Instructions:</strong> You'll see different types of math facts. 
                Think about how you feel when solving them, then choose which group they belong in.
                There are no wrong answers - this helps us understand your learning!
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleStartAssessment}
              disabled={unassessedCategories.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {unassessedCategories.length === 0 ? "Assessment Complete" : "Start Self-Assessment"}
            </Button>
          </div>

          {unassessedCategories.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              {unassessedCategories.length} fact areas to assess
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Assessment Complete!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for sharing how you feel about these math facts. 
            This information helps your teacher understand your learning.
          </p>
          <Button onClick={() => setAssessmentStarted(false)} className="bg-blue-600 hover:bg-blue-700">
            Finish
          </Button>
        </div>
      </div>
    );
  }

  const examples = getFactExamples(currentCategory);
  const progress = categoryIndex + 1;
  const total = unassessedCategories.length;

  return (
    <div className="bg-white p-6 max-w-3xl mx-auto rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Self-Assessment</h3>
          <Badge variant="outline" className="text-sm">
            {progress} of {total}
          </Badge>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / total) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-medium text-gray-800 mb-3">{currentCategory.name}</h4>
        <p className="text-gray-600 mb-4">{currentCategory.description}</p>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Example problems:</p>
          <div className="flex gap-4 text-lg font-mono">
            {examples.map((example, index) => (
              <div key={index} className="bg-blue-50 px-3 py-2 rounded border">
                {example}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-gray-800 mb-4">
          How do you feel about solving these types of problems?
        </p>
        
        <div className="grid gap-3">
          {SORTING_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSortingChoice(category.id)}
              className={`border-2 rounded-lg p-4 text-left transition-all hover:shadow-md ${
                sortingChoice === category.id 
                  ? category.color.replace("100", "200") + " shadow-md" 
                  : category.color + " hover:bg-opacity-80"
              }`}
              disabled={saveAssessmentMutation.isPending}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.emoji}</span>
                <h4 className="font-semibold">{category.title}</h4>
              </div>
              <p className="text-sm">{category.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Confidence Level (1 = Not confident, 5 = Very confident)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setConfidence(level)}
              className={`w-12 h-12 rounded-full border-2 transition-all ${
                confidence === level
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Any thoughts or notes? (Optional)
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Share any thoughts about these problems..."
          className="w-full"
          rows={3}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Remember:</strong> There are no right or wrong answers here. 
          We want to understand how YOU feel about these math facts to help with your learning.
        </p>
      </div>
    </div>
  );
}