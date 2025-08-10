import { StudentProgress, FactCategory } from "@shared/schema";

interface ProgressOverviewProps {
  progress: StudentProgress[];
  factCategories: FactCategory[];
}

export function ProgressOverview({ progress, factCategories }: ProgressOverviewProps) {
  const getPhaseProgress = (phase: string) => {
    const phaseProgress = progress.filter(p => p.phase === phase);
    if (phaseProgress.length === 0) return 0;
    return Math.round(
      phaseProgress.reduce((sum, p) => sum + p.accuracy, 0) / phaseProgress.length
    );
  };

  const getOverallFluencyProgress = () => {
    if (progress.length === 0) return { accuracy: 0, efficiency: 0, flexibility: 0, strategyUse: 0 };
    
    return {
      accuracy: Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length),
      efficiency: Math.round(progress.reduce((sum, p) => sum + p.efficiency, 0) / progress.length),
      flexibility: Math.round(progress.reduce((sum, p) => sum + p.flexibility, 0) / progress.length),
      strategyUse: Math.round(progress.reduce((sum, p) => sum + p.strategyUse, 0) / progress.length)
    };
  };

  const fluencyProgress = getOverallFluencyProgress();

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Your Math Fact Journey</h2>
        
        {/* Progress Phases */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-primary-700">Phase 1: Counting</h3>
              <span className="text-2xl">🔢</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Uses objects or mental counting</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${getPhaseProgress('counting')}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getPhaseProgress('counting')}% Complete</p>
          </div>
          
          <div className="bg-secondary-50 rounded-lg p-4 border-l-4 border-secondary-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-secondary-700">Phase 2: Deriving</h3>
              <span className="text-2xl">🧠</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Uses reasoning strategies</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-secondary-500 h-2 rounded-full" 
                style={{ width: `${getPhaseProgress('deriving')}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getPhaseProgress('deriving')}% Complete</p>
          </div>
          
          <div className="bg-accent-50 rounded-lg p-4 border-l-4 border-accent-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-orange-700">Phase 3: Mastery</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Efficient production (3 seconds)</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent-500 h-2 rounded-full" 
                style={{ width: `${getPhaseProgress('mastery')}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{getPhaseProgress('mastery')}% Complete</p>
          </div>
        </div>

        {/* Fluency Components */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Fluency Components Progress</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <p className="text-sm font-medium">Accuracy</p>
              <p className="text-xs text-gray-600">{fluencyProgress.accuracy}%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-tachometer-alt text-blue-600"></i>
              </div>
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-xs text-gray-600">{fluencyProgress.efficiency}%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-random text-purple-600"></i>
              </div>
              <p className="text-sm font-medium">Flexibility</p>
              <p className="text-xs text-gray-600">{fluencyProgress.flexibility}%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-lightbulb text-orange-600"></i>
              </div>
              <p className="text-sm font-medium">Strategy Use</p>
              <p className="text-xs text-gray-600">{fluencyProgress.strategyUse}%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
