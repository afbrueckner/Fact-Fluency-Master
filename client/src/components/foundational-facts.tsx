import { StudentProgress, FactCategory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface FoundationalFactsProps {
  progress: StudentProgress[];
  factCategories: FactCategory[];
}

export function FoundationalFacts({ progress, factCategories }: FoundationalFactsProps) {
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

  const additionCategories = factCategories.filter(
    cat => cat.operation === "addition" && cat.category === "foundational"
  );
  
  const multiplicationCategories = factCategories.filter(
    cat => cat.operation === "multiplication" && cat.category === "foundational"
  );

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Foundational Facts Practice</h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Addition Facts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-plus text-blue-500 mr-2"></i>Addition Facts
            </h3>
            <div className="space-y-3">
              {additionCategories.map((category) => {
                const categoryProgress = getProgressForCategory(category.id);
                const accuracy = categoryProgress?.accuracy || 0;
                
                return (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      {getStatusBadge(categoryProgress)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          accuracy >= 90 ? 'bg-green-500' : 
                          accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Examples: {category.examples.slice(0, 3).join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multiplication Facts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-times text-purple-500 mr-2"></i>Multiplication Facts
            </h3>
            <div className="space-y-3">
              {multiplicationCategories.map((category) => {
                const categoryProgress = getProgressForCategory(category.id);
                const accuracy = categoryProgress?.accuracy || 0;
                
                return (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      {getStatusBadge(categoryProgress)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          accuracy >= 90 ? 'bg-green-500' : 
                          accuracy >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Examples: {category.examples.slice(0, 3).join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
