import { useState } from "react";
import { AssessmentObservation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StrategyInterview } from "./strategy-interview";
import { PhaseAssessment } from "./phase-assessment";
import { AssessmentAnalytics } from "./assessment-analytics";
import { StudentSelfAssessment } from "./student-self-assessment";

interface AssessmentToolsProps {
  observations: AssessmentObservation[];
  onAddObservation: (observation: {
    observationType: string;
    content: string;
    factArea: string;
    phase: string;
  }) => void;
}

export function AssessmentTools({ observations, onAddObservation }: AssessmentToolsProps) {
  const [showNewObservation, setShowNewObservation] = useState(false);
  const [showStrategyInterview, setShowStrategyInterview] = useState(false);
  const [showPhaseAssessment, setShowPhaseAssessment] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSelfAssessment, setShowSelfAssessment] = useState(false);
  const [newObservation, setNewObservation] = useState({
    observationType: "",
    content: "",
    factArea: "",
    phase: ""
  });

  const handleSubmitObservation = () => {
    if (newObservation.content && newObservation.factArea && newObservation.phase) {
      onAddObservation(newObservation);
      setNewObservation({
        observationType: "",
        content: "",
        factArea: "",
        phase: ""
      });
      setShowNewObservation(false);
    }
  };

  const handleInterviewComplete = (results: any) => {
    // Convert interview results to observation
    const observation = {
      observationType: "interview",
      content: `Strategy Interview: ${results.accuracy}% accuracy, ${results.overallPhase} phase. Strategies observed: ${results.strategiesObserved.join(", ")}`,
      factArea: results.factArea,
      phase: results.overallPhase
    };
    onAddObservation(observation);
    setShowStrategyInterview(false);
  };

  const handlePhaseAssessmentComplete = (results: any) => {
    // Convert phase assessment results to observation
    const observation = {
      observationType: "phase-assessment",
      content: `Phase Assessment: ${results.overallPhase} phase (${results.confidence}% confidence). Key indicators: ${results.indicators.filter((i: any) => i.observed).map((i: any) => i.behavior).slice(0, 3).join(", ")}`,
      factArea: results.factArea,
      phase: results.overallPhase
    };
    onAddObservation(observation);
    setShowPhaseAssessment(false);
  };

  const handleSelfAssessmentComplete = () => {
    const observation = {
      observationType: "self-assessment",
      content: "Student completed self-assessment using sorting mats framework. Results logged separately for detailed analysis.",
      factArea: "Multiple Areas",
      phase: "Self-Reported"
    };
    onAddObservation(observation);
    setShowSelfAssessment(false);
  };

  const getObservationTypeColor = (type: string) => {
    switch (type) {
      case "strategy":
        return "bg-blue-100 text-blue-800";
      case "thinking":
        return "bg-green-100 text-green-800";
      case "communication":
        return "bg-purple-100 text-purple-800";
      case "interview":
        return "bg-indigo-100 text-indigo-800";
      case "phase-assessment":
        return "bg-violet-100 text-violet-800";
      case "self-assessment":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Assessment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alternative Assessment Methods</h3>
        <div className="space-y-3">
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-800">Observation Tools</h4>
              <i className="fas fa-eye text-green-600"></i>
            </div>
            <p className="text-sm text-green-700 mt-1">Track student thinking during game play</p>
            <Button 
              size="sm"
              className="mt-2 bg-green-100 text-green-800 hover:bg-green-200"
              onClick={() => setShowNewObservation(true)}
            >
              Add Observation
            </Button>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-800">Strategy Interviews</h4>
              <i className="fas fa-comments text-blue-600"></i>
            </div>
            <p className="text-sm text-blue-700 mt-1">Ask students to explain their thinking</p>
            <Button 
              size="sm"
              className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
              onClick={() => setShowStrategyInterview(true)}
            >
              Start Interview
            </Button>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-purple-800">Phase Assessment</h4>
              <i className="fas fa-user-check text-purple-600"></i>
            </div>
            <p className="text-sm text-purple-700 mt-1">Determine student's current learning phase</p>
            <Button 
              size="sm"
              className="mt-2 bg-purple-100 text-purple-800 hover:bg-purple-200"
              onClick={() => setShowPhaseAssessment(true)}
            >
              Start Assessment
            </Button>
          </div>
          
          <div className="bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-pink-800">Student Self-Assessment</h4>
              <i className="fas fa-user-graduate text-pink-600"></i>
            </div>
            <p className="text-sm text-pink-700 mt-1">Students sort facts using the Bay-Williams sorting mats framework</p>
            <Button 
              size="sm"
              className="mt-2 bg-pink-100 text-pink-800 hover:bg-pink-200"
              onClick={() => setShowSelfAssessment(true)}
            >
              Start Self-Assessment
            </Button>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-orange-800">Progress Analytics</h4>
              <i className="fas fa-chart-line text-orange-600"></i>
            </div>
            <p className="text-sm text-orange-700 mt-1">Comprehensive progress analysis and insights</p>
            <Button 
              size="sm"
              className="mt-2 bg-orange-100 text-orange-800 hover:bg-orange-200"
              onClick={() => setShowAnalytics(true)}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* New Observation Form */}
      {showNewObservation && (
        <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Add New Observation</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observation Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={newObservation.observationType}
                onChange={(e) => setNewObservation(prev => ({
                  ...prev,
                  observationType: e.target.value
                }))}
              >
                <option value="">Select type...</option>
                <option value="strategy">Strategy Use</option>
                <option value="thinking">Mathematical Thinking</option>
                <option value="communication">Communication</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fact Area
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., Addition doubles, Multiplication 5s"
                value={newObservation.factArea}
                onChange={(e) => setNewObservation(prev => ({
                  ...prev,
                  factArea: e.target.value
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={newObservation.phase}
                onChange={(e) => setNewObservation(prev => ({
                  ...prev,
                  phase: e.target.value
                }))}
              >
                <option value="">Select phase...</option>
                <option value="counting">Counting</option>
                <option value="deriving">Deriving</option>
                <option value="mastery">Mastery</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observation
              </label>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows={3}
                placeholder="Describe what you observed about the student's thinking or strategy use..."
                value={newObservation.content}
                onChange={(e) => setNewObservation(prev => ({
                  ...prev,
                  content: e.target.value
                }))}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleSubmitObservation} className="bg-primary-500 hover:bg-primary-600">
                Save Observation
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewObservation(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Observations */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Recent Observations</h4>
        <div className="space-y-3">
          {observations.slice(0, 5).map((observation) => (
            <div key={observation.id} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium">{observation.content}</p>
                    <Badge className={`text-xs ${getObservationTypeColor(observation.observationType)}`}>
                      {observation.observationType}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {observation.factArea} • {observation.phase} • {observation.createdAt ? new Date(observation.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {observations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-clipboard-list text-3xl mb-2"></i>
              <p>No observations yet. Start by adding your first observation!</p>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Interview Modal */}
      {showStrategyInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <StrategyInterview
              onComplete={handleInterviewComplete}
              onCancel={() => setShowStrategyInterview(false)}
            />
          </div>
        </div>
      )}

      {/* Phase Assessment Modal */}
      {showPhaseAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PhaseAssessment
              onComplete={handlePhaseAssessmentComplete}
              onCancel={() => setShowPhaseAssessment(false)}
            />
          </div>
        </div>
      )}

      {/* Self Assessment Modal */}
      {showSelfAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Student Self-Assessment</h3>
              <Button
                variant="outline"
                onClick={() => setShowSelfAssessment(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </Button>
            </div>
            <div className="p-6">
              <StudentSelfAssessment
                studentId="student-1"
                onComplete={handleSelfAssessmentComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Assessment Analytics</h3>
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </Button>
            </div>
            <AssessmentAnalytics studentId="student-1" />
          </div>
        </div>
      )}
    </div>
  );
}
