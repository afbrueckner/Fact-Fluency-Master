import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentProgress, AssessmentObservation, FactCategory } from '@shared/schema';

interface QuickLooksAnalyticsProps {
  studentId: string;
}

export function QuickLooksAnalytics({ studentId }: QuickLooksAnalyticsProps) {
  const { data: observations = [] } = useQuery<AssessmentObservation[]>({
    queryKey: [`/api/students/${studentId}/observations`],
  });

  const { data: progress = [] } = useQuery<StudentProgress[]>({
    queryKey: [`/api/students/${studentId}/progress`],
  });

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  const quickLooksObservations = observations.filter(obs => 
    obs.observationType === 'quick-looks'
  ).slice(0, 10); // Most recent 10

  const getProgressForCategory = (categoryId: string) => {
    return progress.find(p => p.factCategoryId === categoryId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = factCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getVisualRecognitionTrends = () => {
    const recentSessions = quickLooksObservations.slice(0, 5);
    let immediate = 0, hesitant = 0, struggled = 0;
    
    recentSessions.forEach(obs => {
      if (obs.metadata?.visualRecognition === 'immediate') immediate++;
      else if (obs.metadata?.visualRecognition === 'hesitant') hesitant++;
      else if (obs.metadata?.visualRecognition === 'struggled') struggled++;
    });
    
    return { immediate, hesitant, struggled, total: recentSessions.length };
  };

  const getPatternTypeAnalysis = () => {
    const patternCounts: { [key: string]: number } = {};
    
    quickLooksObservations.forEach(obs => {
      const patternType = obs.metadata?.patternType || 'unknown';
      patternCounts[patternType] = (patternCounts[patternType] || 0) + 1;
    });
    
    return Object.entries(patternCounts).map(([pattern, count]) => ({
      pattern: pattern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }));
  };

  const recognitionTrends = getVisualRecognitionTrends();
  const patternAnalysis = getPatternTypeAnalysis();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Quick Looks Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickLooksObservations.length}</div>
            <p className="text-xs text-gray-500">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Immediate Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recognitionTrends.total > 0 
                ? Math.round((recognitionTrends.immediate / recognitionTrends.total) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500">Recent sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Pattern Variety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patternAnalysis.length}</div>
            <p className="text-xs text-gray-500">Different patterns practiced</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">👁️</span>
            Recent Quick Looks Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quickLooksObservations.length > 0 ? (
            <div className="space-y-4">
              {quickLooksObservations.map((obs, index) => {
                const categoryProgress = getProgressForCategory(obs.factArea);
                const metadata = obs.metadata || {};
                
                return (
                  <div key={obs.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {metadata.pattern || 'Quick Look Pattern'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getCategoryName(obs.factArea)} • {new Date(obs.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={obs.phase === 'mastery' ? 'default' : obs.phase === 'deriving' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {obs.phase}
                        </Badge>
                        <Badge 
                          variant={metadata.accuracy === 'correct' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {metadata.accuracy || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Visual Recognition:</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 ${
                            metadata.visualRecognition === 'immediate' ? 'text-green-600' :
                            metadata.visualRecognition === 'hesitant' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {metadata.visualRecognition === 'immediate' ? '⚡ Immediate' :
                             metadata.visualRecognition === 'hesitant' ? '🤔 Hesitant' : '😓 Struggled'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 ${
                            metadata.confidence === 'high' ? 'text-green-600' :
                            metadata.confidence === 'medium' ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {metadata.confidence === 'high' ? '🔥 High' :
                             metadata.confidence === 'medium' ? '👍 Medium' : '😐 Low'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Current Progress:</span>
                        <div className="mt-1">
                          {categoryProgress ? (
                            <span className="text-blue-600 font-medium">
                              {categoryProgress.accuracy}% accuracy
                            </span>
                          ) : (
                            <span className="text-gray-400">No progress data</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {metadata.strategies && metadata.strategies.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-500 text-sm">Observed Strategies:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {metadata.strategies.slice(0, 3).map((strategy: string, idx: number) => (
                            <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {strategy}
                            </span>
                          ))}
                          {metadata.strategies.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{metadata.strategies.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">👁️</span>
              <p>No Quick Looks sessions recorded yet</p>
              <p className="text-sm">Start a Quick Look session to begin tracking visual number sense development</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      {patternAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Practice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {patternAnalysis.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{item.count}</div>
                  <div className="text-sm text-gray-600">{item.pattern}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}