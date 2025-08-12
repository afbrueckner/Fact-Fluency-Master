import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

interface QuickLooksObservationToolProps {
  pattern: {
    dots: number;
    arrangement: string;
    factCategory: string;
    description: string;
  };
  studentId: string;
  onComplete: () => void;
}

interface StudentObservation {
  studentName: string;
  strategies: string[];
  phase: 'counting' | 'deriving' | 'mastery';
  accuracy: 'incorrect' | 'correct' | 'partially-correct';
  confidence: 'low' | 'medium' | 'high';
  visualRecognition: 'immediate' | 'hesitant' | 'struggled';
  notes?: string;
}

export function QuickLooksObservationTool({ pattern, studentId, onComplete }: QuickLooksObservationToolProps) {
  const [observations, setObservations] = useState<StudentObservation[]>([]);
  const [currentStudent, setCurrentStudent] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [phase, setPhase] = useState<'counting' | 'deriving' | 'mastery'>('counting');
  const [accuracy, setAccuracy] = useState<'incorrect' | 'correct' | 'partially-correct'>('correct');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [visualRecognition, setVisualRecognition] = useState<'immediate' | 'hesitant' | 'struggled'>('immediate');
  
  const queryClient = useQueryClient();
  
  // Common student strategies organized by pattern type
  const strategyOptions = {
    'ten-frame': [
      'Counted all dots one by one',
      'Saw empty spaces (10 - x)',
      'Used five-structure (5 + x)',
      'Instant recognition',
      'Counted on from 5',
      'Made connection to addition facts'
    ],
    'domino': [
      'Counted all dots',
      'Saw as double (x + x)',
      'Counted dots on each side',
      'Used symmetry',
      'Instant recognition',
      'Connected to multiplication'
    ],
    'array': [
      'Counted by ones',
      'Counted rows/columns',
      'Used skip counting',
      'Saw as multiplication',
      'Made groups',
      'Used repeated addition'
    ],
    'groups': [
      'Counted all individually',
      'Added groups together',
      'Saw as near doubles',
      'Used known fact',
      'Made connections',
      'Instant recognition'
    ],
    'default': [
      'Counted all one by one',
      'Grouped and added',
      'Used patterns',
      'Made connections',
      'Skip counted',
      'Instant recognition'
    ]
  };

  const getStrategiesForPattern = () => {
    if (pattern.arrangement.includes('ten-frame')) return strategyOptions['ten-frame'];
    if (pattern.arrangement.includes('domino')) return strategyOptions['domino'];
    if (pattern.arrangement.includes('array')) return strategyOptions['array'];
    if (pattern.arrangement.includes('groups')) return strategyOptions['groups'];
    return strategyOptions['default'];
  };

  const saveObservationMutation = useMutation({
    mutationFn: async (observationData: any) => {
      return apiRequest("POST", `/api/students/${studentId}/observations`, observationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/observations`] });
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      return apiRequest("POST", `/api/students/${studentId}/quick-looks-progress`, progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/students/${studentId}/progress`] });
    }
  });

  const handleAddObservation = () => {
    if (currentStudent && selectedStrategies.length > 0) {
      const newObservation: StudentObservation = {
        studentName: currentStudent,
        strategies: selectedStrategies,
        phase,
        accuracy,
        confidence,
        visualRecognition,
      };
      
      setObservations([...observations, newObservation]);
      
      // Reset form
      setCurrentStudent('');
      setSelectedStrategies([]);
      setPhase('counting');
      setAccuracy('correct');
      setConfidence('medium');
      setVisualRecognition('immediate');
    }
  };

  const handleSaveAllObservations = async () => {
    for (const obs of observations) {
      const observationData = {
        observationType: 'quick-looks',
        content: `Quick Looks: ${pattern.description} - Strategies: ${obs.strategies.join(', ')} - Phase: ${obs.phase} - Visual Recognition: ${obs.visualRecognition}`,
        factArea: pattern.factCategory,
        phase: obs.phase,
        metadata: {
          pattern: pattern.description,
          strategies: obs.strategies,
          accuracy: obs.accuracy,
          confidence: obs.confidence,
          visualRecognition: obs.visualRecognition,
          patternType: pattern.arrangement
        }
      };
      
      try {
        await saveObservationMutation.mutateAsync(observationData);
        
        // Also update student progress based on Quick Looks performance
        const progressData = {
          factCategoryId: pattern.factCategory,
          visualRecognition: obs.visualRecognition,
          phase: obs.phase,
          accuracy: obs.accuracy
        };
        
        await updateProgressMutation.mutateAsync(progressData);
      } catch (error) {
        console.error('Failed to save observation or update progress:', error);
      }
    }
    
    onComplete();
  };

  const toggleStrategy = (strategy: string) => {
    setSelectedStrategies(prev =>
      prev.includes(strategy)
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const commonStudentNames = [
    'Alex', 'Maya', 'Jordan', 'Casey', 'Riley', 'Sam', 'Taylor', 'Morgan',
    'Avery', 'Quinn', 'Sage', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley'
  ];

  return (
    <div className="space-y-6">
      {/* Pattern Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">👁️</span>
            Quick Look Observations
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Pattern: {pattern.description}</span>
            <span>•</span>
            <span>Quantity: {pattern.dots}</span>
            <span>•</span>
            <Badge variant="secondary">{pattern.factCategory}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Observation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Record Student Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Name Quick Select */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Student Name</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonStudentNames.map(name => (
                <Button
                  key={name}
                  variant={currentStudent === name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStudent(name)}
                  className="text-xs"
                >
                  {name}
                </Button>
              ))}
            </div>
            <input
              type="text"
              value={currentStudent}
              onChange={(e) => setCurrentStudent(e.target.value)}
              placeholder="Or type a name..."
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What strategy did the student use? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getStrategiesForPattern().map(strategy => (
                <Button
                  key={strategy}
                  variant={selectedStrategies.includes(strategy) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStrategy(strategy)}
                  className="text-xs text-left h-auto p-2 whitespace-normal"
                >
                  {strategy}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Assessment Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Phase</label>
              <div className="space-y-1">
                {(['counting', 'deriving', 'mastery'] as const).map(p => (
                  <Button
                    key={p}
                    variant={phase === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPhase(p)}
                    className="w-full text-xs justify-start"
                  >
                    {p === 'counting' ? '🔢 Counting' : 
                     p === 'deriving' ? '🧠 Deriving' : '⚡ Mastery'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Accuracy</label>
              <div className="space-y-1">
                {(['correct', 'partially-correct', 'incorrect'] as const).map(a => (
                  <Button
                    key={a}
                    variant={accuracy === a ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAccuracy(a)}
                    className="w-full text-xs justify-start"
                  >
                    {a === 'correct' ? '✅ Correct' :
                     a === 'partially-correct' ? '🔸 Partial' : '❌ Incorrect'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Confidence</label>
              <div className="space-y-1">
                {(['high', 'medium', 'low'] as const).map(c => (
                  <Button
                    key={c}
                    variant={confidence === c ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfidence(c)}
                    className="w-full text-xs justify-start"
                  >
                    {c === 'high' ? '🔥 High' :
                     c === 'medium' ? '👍 Medium' : '😐 Low'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Recognition</label>
              <div className="space-y-1">
                {(['immediate', 'hesitant', 'struggled'] as const).map(r => (
                  <Button
                    key={r}
                    variant={visualRecognition === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVisualRecognition(r)}
                    className="w-full text-xs justify-start"
                  >
                    {r === 'immediate' ? '⚡ Immediate' :
                     r === 'hesitant' ? '🤔 Hesitant' : '😓 Struggled'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddObservation}
            disabled={!currentStudent || selectedStrategies.length === 0}
            className="w-full"
          >
            Add This Observation
          </Button>
        </CardContent>
      </Card>

      {/* Current Observations */}
      {observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recorded Observations ({observations.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {observations.map((obs, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium">{obs.studentName}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {obs.phase}
                    </Badge>
                    <Badge 
                      variant={obs.accuracy === 'correct' ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {obs.accuracy}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Strategies: {obs.strategies.join(', ')}</div>
                  <div>Confidence: {obs.confidence} • Recognition: {obs.visualRecognition}</div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex gap-3">
              <Button
                onClick={handleSaveAllObservations}
                disabled={observations.length === 0 || saveObservationMutation.isPending}
                className="flex-1"
              >
                {saveObservationMutation.isPending ? 'Saving...' : `Save All ${observations.length} Observations`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setObservations([])}
                disabled={observations.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}