import { User } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import type { StudentAvatar, StudentReward, RewardItem } from '@shared/schema';

interface HeaderProps {
  student: {
    id?: string;
    name: string;
    grade: number;
    section: string;
    initials: string;
  };
}

export function Header({ student }: HeaderProps) {
  const studentId = student.id || "student-1";

  // Fetch student avatar and rewards data
  const { data: avatar } = useQuery<StudentAvatar>({
    queryKey: [`/api/students/${studentId}/avatar`],
  });

  const { data: studentRewards = [] } = useQuery<StudentReward[]>({
    queryKey: [`/api/students/${studentId}/rewards`],
  });

  const { data: rewardItems = [] } = useQuery<RewardItem[]>({
    queryKey: ["/api/reward-items"],
  });

  // Helper functions to get equipped items
  const getEquippedBackground = () => {
    const equippedBackgroundReward = studentRewards.find(reward => 
      reward.isEquipped && rewardItems.find(item => 
        item.id === reward.rewardItemId && item.category === "background"
      )
    );
    
    if (equippedBackgroundReward) {
      const backgroundItem = rewardItems.find(item => item.id === equippedBackgroundReward.rewardItemId);
      if (backgroundItem?.id === "background-space-1") {
        return "bg-gradient-to-br from-purple-900 via-blue-900 to-black";
      }
      if (backgroundItem?.id === "background-ocean-1") {
        return "bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600";
      }
      if (backgroundItem?.id === "background-forest-1") {
        return "bg-gradient-to-br from-green-600 via-green-500 to-green-700";
      }
    }
    
    return "bg-gradient-to-br from-blue-400 to-purple-600"; // default
  };

  const getEquippedAccessories = () => {
    return studentRewards
      .filter(reward => reward.isEquipped)
      .map(reward => rewardItems.find(item => item.id === reward.rewardItemId))
      .filter(item => item && item.category === "accessory");
  };

  const getEquippedExpression = () => {
    const equippedExpressionReward = studentRewards.find(reward => 
      reward.isEquipped && rewardItems.find(item => 
        item.id === reward.rewardItemId && item.category === "expression"
      )
    );
    
    if (equippedExpressionReward) {
      const expressionItem = rewardItems.find(item => item.id === equippedExpressionReward.rewardItemId);
      if (expressionItem?.id === "expression-excited-1") return "😁";
      if (expressionItem?.id === "expression-happy-1") return "😊";
      if (expressionItem?.id === "expression-cool-1") return "😎";
    }
    
    return "😊"; // default
  };

  const backgroundClass = getEquippedBackground();
  const equippedAccessories = getEquippedAccessories();
  const expression = getEquippedExpression();

  return (
    <header className="bg-white shadow-sm border-b-2 border-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-calculator text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-serif">Math Fact Fluency</h1>
              <p className="text-xs text-gray-600">Bay-Williams & Kling Framework</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{student.name}</p>
              <p className="text-xs text-gray-500">Grade {student.grade} • Section {student.section}</p>
            </div>
            
            {/* Mini Avatar */}
            <div className={`w-10 h-10 rounded-full ${backgroundClass} flex items-center justify-center relative overflow-hidden border-2 border-white shadow-sm`}>
              {/* Stars for space background */}
              {backgroundClass.includes("purple-900") && (
                <>
                  <div className="absolute top-0 left-2 text-white text-xs">⭐</div>
                  <div className="absolute bottom-0 right-1 text-white text-xs">✨</div>
                </>
              )}
              
              {/* Main expression */}
              <div className="text-lg z-10">{expression}</div>
              
              {/* Equipped accessories */}
              {equippedAccessories.map((accessory) => (
                <div key={accessory?.id} className="absolute">
                  {accessory?.id === "accessory-hat-1" && (
                    <div className="absolute -top-1 text-sm">🎩</div>
                  )}
                  {accessory?.id === "accessory-glasses-1" && (
                    <div className="absolute text-xs">🤓</div>
                  )}
                  {accessory?.id === "accessory-bow-1" && (
                    <div className="absolute -top-0.5 text-sm">🎀</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
