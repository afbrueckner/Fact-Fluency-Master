import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentProgress, GameResult, AssessmentObservation, FactCategory } from "@shared/schema";

interface AssessmentAnalyticsProps {
  studentId: string;
}

export function AssessmentAnalytics({ studentId }: AssessmentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  const { data: progress = [] } = useQuery<StudentProgress[]>({
    queryKey: [`/api/students/${studentId}/progress`],
  });

  const { data: gameResults = [] } = useQuery<GameResult[]>({
    queryKey: [`/api/students/${studentId}/game-results`],
  });

  const { data: observations = [] } = useQuery<AssessmentObservation[]>({
    queryKey: [`/api/students/${studentId}/observations`],
  });

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  // Calculate overall fluency metrics
  const overallMetrics = {
    accuracy: Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / Math.max(progress.length, 1)),
    efficiency: Math.round(progress.reduce((sum, p) => sum + p.efficiency, 0) / Math.max(progress.length, 1)),
    flexibility: Math.round(progress.reduce((sum, p) => sum + p.flexibility, 0) / Math.max(progress.length, 1)),
    strategyUse: Math.round(progress.reduce((sum, p) => sum + p.strategyUse, 0) / Math.max(progress.length, 1))
  };

  // Phase distribution
  const phaseDistribution = progress.reduce((dist, p) => {
    dist[p.phase] = (dist[p.phase] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  // Recent game performance
  const recentGames = gameResults
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  // Strategy usage from observations
  const strategyFrequency = observations.reduce((freq, obs) => {
    if (obs.observationType === "strategy") {
      const strategies = obs.content.toLowerCase();
      if (strategies.includes("doubles")) freq.doubles = (freq.doubles || 0) + 1;
      if (strategies.includes("counting")) freq.counting = (freq.counting || 0) + 1;
      if (strategies.includes("making ten")) freq.makingTen = (freq.makingTen || 0) + 1;
      if (strategies.includes("known fact")) freq.knownFact = (freq.knownFact || 0) + 1;
    }
    return freq;
  }, {} as Record<string, number>);

  // Areas needing attention
  const needsAttention = progress
    .filter(p => p.accuracy < 70 || p.phase === "counting")
    .map(p => {
      const category = factCategories.find(c => c.id === p.factCategoryId);
      return { progress: p, category };
    })
    .filter(item => item.category);

  // Strengths
  const strengths = progress
    .filter(p => p.accuracy >= 90 && p.phase === "mastery")
    .map(p => {
      const category = factCategories.find(c => c.id === p.factCategoryId);
      return { progress: p, category };
    })
    .filter(item => item.category);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "counting": return "bg-red-100 text-red-800";
      case "deriving": return "bg-yellow-100 text-yellow-800";
      case "mastery": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Assessment Analytics</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["week", "month", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeRange === range
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {range === "all" ? "All Time" : `Last ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Fluency Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Fluency Components</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(overallMetrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                <span className={getMetricColor(value)}>{value}%</span>
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {key === "strategyUse" ? "Strategy Use" : key}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Learning Phase Distribution</h4>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(phaseDistribution).map(([phase, count]) => (
            <div key={phase} className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
              <Badge className={`text-xs ${getPhaseColor(phase)}`}>
                {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">fact areas</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Goal:</strong> Move students from counting → deriving → mastery for each fact area.
            Most middle school students should be in the deriving or mastery phases.
          </p>
        </div>
      </div>

      {/* Strategy Usage */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Strategy Observations</h4>
        {Object.keys(strategyFrequency).length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(strategyFrequency).map(([strategy, count]) => (
              <div key={strategy} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <p className="text-sm text-gray-600 capitalize">
                  {strategy.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No strategy observations recorded yet</p>
            <p className="text-sm">Start observing student thinking during games and activities</p>
          </div>
        )}
      </div>

      {/* Recent Game Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Recent Game Performance</h4>
        {recentGames.length > 0 ? (
          <div className="space-y-3">
            {recentGames.slice(0, 5).map((game) => (
              <div key={game.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-800">{game.gameId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(game.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{game.score} points</p>
                  <p className={`text-sm ${getMetricColor(game.accuracy)}`}>
                    {game.accuracy}% accuracy
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No games played yet</p>
            <p className="text-sm">Game performance data will appear here after playing</p>
          </div>
        )}
      </div>

      {/* Areas Needing Attention */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-red-700 mb-4">Needs Attention</h4>
          {needsAttention.length > 0 ? (
            <div className="space-y-3">
              {needsAttention.slice(0, 5).map(({ progress, category }) => (
                <div key={progress.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-medium text-red-800">{category?.name}</p>
                  <div className="flex justify-between text-sm text-red-600 mt-1">
                    <span>{progress.accuracy}% accuracy</span>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {progress.phase}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">All areas performing well!</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-green-700 mb-4">Strengths</h4>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.slice(0, 5).map(({ progress, category }) => (
                <div key={progress.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-medium text-green-800">{category?.name}</p>
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>{progress.accuracy}% accuracy</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      mastered
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Keep working toward mastery!</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Next Steps & Recommendations</h4>
        <div className="space-y-3">
          {overallMetrics.accuracy < 70 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>Focus on Accuracy:</strong> Use concrete manipulatives and visual models to build understanding before moving to abstract practice.
              </p>
            </div>
          )}
          
          {phaseDistribution.counting > (phaseDistribution.deriving || 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>Strategy Development:</strong> Introduce derived strategies like doubles, making ten, and breaking apart numbers.
              </p>
            </div>
          )}
          
          {overallMetrics.flexibility < 60 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Build Flexibility:</strong> Show multiple ways to solve the same problem and discuss which strategies are most efficient.
              </p>
            </div>
          )}
          
          {Object.keys(strategyFrequency).length <= 2 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-700">
                <strong>Expand Strategy Toolkit:</strong> Introduce and practice a wider variety of problem-solving strategies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}