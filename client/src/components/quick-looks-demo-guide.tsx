import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function QuickLooksDemoGuide() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    {
      title: "Enable Teacher Mode",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Before starting a Quick Look session:</p>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked className="rounded" readOnly />
              <label className="text-sm font-medium">Teacher Mode (Record Observations)</label>
            </div>
            <p className="text-xs text-blue-700">
              Check this box to enable detailed observation recording with quick buttons
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Visual Pattern Display",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Students see diverse visual patterns:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded p-3 border">
              <h4 className="text-xs font-medium mb-2">Ten Frame</h4>
              <div className="grid grid-cols-5 gap-1 p-2 border-2 border-gray-800 w-fit">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-blue-500 rounded-full"></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Builds combinations of 10</p>
            </div>
            <div className="bg-white rounded p-3 border">
              <h4 className="text-xs font-medium mb-2">Domino Pattern</h4>
              <div className="grid grid-cols-3 grid-rows-2 gap-1 p-2 border-2 border-gray-800 w-fit">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-blue-500 rounded-full"></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Develops doubles thinking</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quick Observation Recording",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Record observations with minimal typing:</p>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-xs font-medium mb-2">Student Name Quick Select</h4>
              <div className="flex flex-wrap gap-1">
                {['Alex', 'Maya', 'Jordan', 'Casey'].map(name => (
                  <Button key={name} size="sm" variant="outline" className="text-xs h-6">
                    {name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-xs font-medium mb-2">Strategy Selection</h4>
              <div className="grid grid-cols-2 gap-1">
                {['Counted all dots', 'Saw as double', 'Used five-structure', 'Instant recognition'].map(strategy => (
                  <Button key={strategy} size="sm" variant="outline" className="text-xs h-auto p-1 whitespace-normal">
                    {strategy}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Performance Assessment Grid",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Quick assessment with visual indicators:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-xs font-medium mb-2">Learning Phase</h4>
              <div className="space-y-1">
                <Button size="sm" variant="default" className="w-full text-xs justify-start h-6">
                  🔢 Counting
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs justify-start h-6">
                  🧠 Deriving
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs justify-start h-6">
                  ⚡ Mastery
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <h4 className="text-xs font-medium mb-2">Visual Recognition</h4>
              <div className="space-y-1">
                <Button size="sm" variant="default" className="w-full text-xs justify-start h-6">
                  ⚡ Immediate
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs justify-start h-6">
                  🤔 Hesitant
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs justify-start h-6">
                  😓 Struggled
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Progress Integration",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Observations automatically update student progress:</p>
          <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="text-sm font-medium text-green-800 mb-2">Automatic Progress Updates</h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Visual recognition speed → Efficiency scores</li>
              <li>• Learning phase → Overall progress tracking</li>
              <li>• Strategy use → Flexibility development</li>
              <li>• Accuracy → Fluency measurements</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Analytics Dashboard</h4>
            <p className="text-xs text-blue-700">
              View trends in visual recognition, pattern practice variety, and connections to math fact fluency progress
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            Quick Looks Teacher Tools - Step-by-Step Guide
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Step {currentStep} of {steps.length}</Badge>
            <span className="text-sm text-gray-600">{steps[currentStep - 1].title}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {steps[currentStep - 1].content}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous Step
            </Button>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 === currentStep ? 'bg-blue-500' : 
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button 
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {currentStep === steps.length && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-green-800 mb-2">Ready to Try It!</h3>
              <p className="text-sm text-gray-600 mb-4">
                You're now ready to use the enhanced Quick Looks tools with your students.
              </p>
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                Start Quick Look Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}