// Local storage utilities for browser-based data persistence
import type { 
  Student, 
  StudentProgress, 
  StudentPoints, 
  StudentReward, 
  StudentAvatar, 
  PointTransaction,
  RewardItem,
  FactCategory,
  Game
} from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  STUDENT: 'math-fluency-student',
  PROGRESS: 'math-fluency-progress',
  POINTS: 'math-fluency-points',
  REWARDS: 'math-fluency-rewards',
  AVATAR: 'math-fluency-avatar',
  TRANSACTIONS: 'math-fluency-transactions',
  OBSERVATIONS: 'math-fluency-observations'
} as const;

// Helper functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setInStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Student data
export function getStudent(): Student {
  return getFromStorage(STORAGE_KEYS.STUDENT, {
    id: "student-1",
    name: "Alex Rodriguez",
    grade: 6,
    section: "A",
    initials: "AR",
    createdAt: new Date()
  });
}

export function setStudent(student: Student): void {
  setInStorage(STORAGE_KEYS.STUDENT, student);
}

// Progress data
export function getProgress(): StudentProgress[] {
  return getFromStorage(STORAGE_KEYS.PROGRESS, [
    {
      id: "progress-1",
      studentId: "student-1",
      factCategoryId: "add-plus-minus-1-2",
      phase: "counting",
      accuracy: 75,
      efficiency: 45,
      flexibility: 60,
      strategyUse: 50,
      lastPracticed: new Date(),
      updatedAt: new Date()
    }
  ]);
}

export function setProgress(progress: StudentProgress[]): void {
  setInStorage(STORAGE_KEYS.PROGRESS, progress);
}

export function updateProgress(categoryId: string, updates: Partial<StudentProgress>): void {
  const progress = getProgress();
  const index = progress.findIndex(p => p.factCategoryId === categoryId);
  
  if (index >= 0) {
    progress[index] = { ...progress[index], ...updates };
  } else {
    progress.push({
      id: `progress-${Date.now()}`,
      studentId: "student-1",
      factCategoryId: categoryId,
      phase: "counting",
      accuracy: 0,
      efficiency: 0,
      flexibility: 0,
      strategyUse: 0,
      lastPracticed: new Date(),
      updatedAt: new Date(),
      ...updates
    });
  }
  
  setProgress(progress);
}

// Points data
export function getPoints(): StudentPoints {
  return getFromStorage(STORAGE_KEYS.POINTS, {
    id: "points-1",
    studentId: "student-1",
    totalPoints: 150,
    spentPoints: 0,
    availablePoints: 150,
    updatedAt: new Date()
  });
}

export function setPoints(points: StudentPoints): void {
  setInStorage(STORAGE_KEYS.POINTS, points);
}

export function addPoints(amount: number, reason: string): void {
  const points = getPoints();
  const newPoints = {
    ...points,
    totalPoints: points.totalPoints + amount,
    availablePoints: points.availablePoints + amount,
    updatedAt: new Date()
  };
  setPoints(newPoints);
  
  // Add transaction
  addTransaction(amount, reason);
}

export function spendPoints(amount: number, reason: string): boolean {
  const points = getPoints();
  if (points.availablePoints >= amount) {
    const newPoints = {
      ...points,
      spentPoints: points.spentPoints + amount,
      availablePoints: points.availablePoints - amount,
      updatedAt: new Date()
    };
    setPoints(newPoints);
    addTransaction(-amount, reason);
    return true;
  }
  return false;
}

// Transactions
export function getTransactions(): PointTransaction[] {
  return getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
}

export function addTransaction(points: number, reason: string): void {
  const transactions = getTransactions();
  transactions.unshift({
    id: `transaction-${Date.now()}`,
    studentId: "student-1",
    category: points > 0 ? "earned" : "spent",
    points,
    reason,
    metadata: {},
    createdAt: new Date()
  });
  setInStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
}

// Rewards
export function getStudentRewards(): StudentReward[] {
  return getFromStorage(STORAGE_KEYS.REWARDS, []);
}

export function setStudentRewards(rewards: StudentReward[]): void {
  setInStorage(STORAGE_KEYS.REWARDS, rewards);
}

export function unlockReward(rewardItemId: string): StudentReward {
  const rewards = getStudentRewards();
  const newReward: StudentReward = {
    id: `reward-${Date.now()}`,
    studentId: "student-1",
    rewardItemId,
    isEquipped: false,
    unlockedAt: new Date()
  };
  rewards.push(newReward);
  setStudentRewards(rewards);
  return newReward;
}

export function equipReward(rewardItemId: string, category: string): void {
  const rewards = getStudentRewards();
  
  // Unequip other items in the same category
  rewards.forEach(reward => {
    if (reward.isEquipped) {
      const item = getRewardItems().find(item => item.id === reward.rewardItemId);
      if (item?.category === category) {
        reward.isEquipped = false;
      }
    }
  });
  
  // Equip the new item
  const reward = rewards.find(r => r.rewardItemId === rewardItemId);
  if (reward) {
    reward.isEquipped = true;
  }
  
  setStudentRewards(rewards);
}

// Avatar
export function getAvatar(): StudentAvatar {
  return getFromStorage(STORAGE_KEYS.AVATAR, {
    id: "avatar-1",
    studentId: "student-1",
    avatarType: "emoji",
    baseColor: "#4F46E5",
    accessories: {},
    outfit: null,
    expression: "happy",
    background: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export function setAvatar(avatar: StudentAvatar): void {
  setInStorage(STORAGE_KEYS.AVATAR, avatar);
}

// Observations - removed since QuickLookObservation type doesn't exist
export function getObservations(): any[] {
  return getFromStorage(STORAGE_KEYS.OBSERVATIONS, []);
}

export function addObservation(observation: any): void {
  const observations = getObservations();
  observations.unshift({
    ...observation,
    id: `obs-${Date.now()}`,
    createdAt: new Date()
  });
  setInStorage(STORAGE_KEYS.OBSERVATIONS, observations);
}

// Static data (these don't change, so we can define them here)
export function getRewardItems(): RewardItem[] {
  return [
    {
      id: "background-space-1",
      name: "Space Station",
      category: "background",
      type: "space",
      description: "Explore the cosmos with this stellar background!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "background-ocean-1",
      name: "Ocean Paradise",
      category: "background",
      type: "ocean",
      description: "Dive into learning with ocean waves!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "background-forest-1",
      name: "Forest Adventure",
      category: "background",
      type: "forest",
      description: "Nature-inspired learning environment!",
      icon: null,
      unlockCondition: { type: "points", value: 50 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-excited-1",
      name: "Super Excited",
      category: "expression",
      type: "excited",
      description: "Show your enthusiasm for math!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-happy-1",
      name: "Happy Face",
      category: "expression",
      type: "happy",
      description: "Spread positive math vibes!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "expression-cool-1",
      name: "Cool & Confident",
      category: "expression",
      type: "cool",
      description: "Math is cool, and so are you!",
      icon: null,
      unlockCondition: { type: "points", value: 25 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "accessory-hat-1",
      name: "Math Wizard Hat",
      category: "accessory",
      type: "hat",
      description: "Channel your inner math wizard!",
      icon: null,
      unlockCondition: { type: "points", value: 75 },
      rarity: "rare",
      createdAt: new Date()
    },
    {
      id: "accessory-glasses-1",
      name: "Smart Glasses",
      category: "accessory",
      type: "glasses",
      description: "Look smart while solving problems!",
      icon: null,
      unlockCondition: { type: "points", value: 40 },
      rarity: "common",
      createdAt: new Date()
    },
    {
      id: "accessory-bow-1",
      name: "Victory Bow",
      category: "accessory",
      type: "bow",
      description: "Celebrate your math achievements!",
      icon: null,
      unlockCondition: { type: "points", value: 60 },
      rarity: "rare",
      createdAt: new Date()
    }
  ];
}

export function getFactCategories(): FactCategory[] {
  return [
    {
      id: "add-plus-minus-1-2",
      operation: "addition",
      category: "foundational",
      name: "Plus 1, Plus 2",
      description: "Adding 1 and 2 to numbers",
      examples: ["1+1", "2+1", "3+1", "4+1", "5+1", "1+2", "2+2", "3+2", "4+2", "5+2"],
      phase: "mastery"
    },
    {
      id: "add-doubles",
      operation: "addition",
      category: "foundational",
      name: "Doubles Facts",
      description: "Adding a number to itself",
      examples: ["1+1", "2+2", "3+3", "4+4", "5+5", "6+6", "7+7", "8+8", "9+9"],
      phase: "mastery"
    },
    {
      id: "mult-2s-5s-10s",
      operation: "multiplication",
      category: "foundational",
      name: "2s, 5s, and 10s",
      description: "Multiplication by 2, 5, and 10",
      examples: ["2×1", "2×2", "2×3", "5×1", "5×2", "5×3", "10×1", "10×2", "10×3"],
      phase: "deriving"
    }
  ];
}

export function getGames(): Game[] {
  return [
    {
      id: "racing-bears",
      name: "Racing Bears",
      description: "Help the bears race by solving addition facts quickly! Students take turns solving facts to move their bear forward.",
      operation: "addition",
      category: "foundational",
      targetFacts: ["1+1", "2+1", "3+1", "1+2", "2+2", "3+2", "4+1", "5+1", "6+1", "7+1", "8+1", "9+1"],
      emoji: "🐻",
      difficulty: "beginner"
    },
    {
      id: "doubles-bingo",
      name: "Doubles Bingo",
      description: "Classic bingo game focused on doubles facts. Mark spaces as you solve doubles problems!",
      operation: "addition",
      category: "foundational",
      targetFacts: ["1+1", "2+2", "3+3", "4+4", "5+5", "6+6", "7+7", "8+8", "9+9"],
      emoji: "🎯",
      difficulty: "beginner"
    },
    {
      id: "sum-war",
      name: "Sum War",
      description: "Card game where players compare sums. Higher sum wins the round!",
      operation: "addition",
      category: "derived",
      targetFacts: ["3+4", "5+6", "7+8", "4+5", "6+7", "8+9", "2+9", "3+8"],
      emoji: "⚔️",
      difficulty: "intermediate"
    },
    {
      id: "trios",
      name: "Trios",
      description: "Find three numbers that make the target sum. Great for developing addition fluency!",
      operation: "addition",
      category: "derived",
      targetFacts: ["combinations to 10", "combinations to 15", "combinations to 20"],
      emoji: "🔢",
      difficulty: "intermediate"
    },
    {
      id: "salute",
      name: "Salute",
      description: "Partner game where one player guesses the missing addend. Builds part-whole understanding!",
      operation: "addition",
      category: "derived",
      targetFacts: ["missing addends", "part-whole relationships"],
      emoji: "👋",
      difficulty: "intermediate"
    },
    {
      id: "three-dice-take",
      name: "Three Dice Take",
      description: "Roll three dice and use addition and subtraction to reach target numbers!",
      operation: "mixed",
      category: "advanced",
      targetFacts: ["mixed addition", "mixed subtraction", "strategic thinking"],
      emoji: "🎲",
      difficulty: "advanced"
    }
  ];
}

