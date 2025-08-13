// Mock API client that uses localStorage instead of making HTTP requests
import {
  getStudent,
  getProgress,
  getPoints,
  getStudentRewards,
  getAvatar,
  getTransactions,
  getObservations,
  getRewardItems,
  getFactCategories,
  getGames,
  addPoints,
  spendPoints,
  unlockReward,
  equipReward,
  updateProgress,
  addObservation
} from './localStorage';

// Helper to extract cost from unlockCondition
function getItemCost(item: any): number {
  if (item.unlockCondition && item.unlockCondition.type === 'points') {
    return item.unlockCondition.value;
  }
  return 0;
}

// Simulate API delay for realistic UX
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Student endpoints
  async getStudent(id: string) {
    await delay();
    return getStudent();
  },

  // Progress endpoints
  async getStudentProgress(studentId: string) {
    await delay();
    return getProgress();
  },

  async updateStudentProgress(studentId: string, categoryId: string, updates: any) {
    await delay();
    updateProgress(categoryId, updates);
    return { success: true };
  },

  // Points endpoints
  async getStudentPoints(studentId: string) {
    await delay();
    return getPoints();
  },

  async addStudentPoints(studentId: string, amount: number, reason: string) {
    await delay();
    addPoints(amount, reason);
    return getPoints();
  },

  async spendStudentPoints(studentId: string, amount: number, reason: string) {
    await delay();
    const success = spendPoints(amount, reason);
    if (success) {
      return getPoints();
    } else {
      throw new Error('Insufficient points');
    }
  },

  // Rewards endpoints
  async getStudentRewards(studentId: string) {
    await delay();
    return getStudentRewards();
  },

  async unlockStudentReward(studentId: string, rewardItemId: string) {
    await delay();
    return unlockReward(rewardItemId);
  },

  async equipStudentReward(studentId: string, rewardItemId: string) {
    await delay();
    const rewardItems = getRewardItems();
    const item = rewardItems.find(item => item.id === rewardItemId);
    if (item) {
      equipReward(rewardItemId, item.category);
    }
    return { success: true };
  },

  // Avatar endpoints
  async getStudentAvatar(studentId: string) {
    await delay();
    return getAvatar();
  },

  // Transaction endpoints
  async getStudentTransactions(studentId: string) {
    await delay();
    return getTransactions();
  },

  // Observation endpoints
  async getObservations(studentId: string) {
    await delay();
    return getObservations();
  },

  async createObservation(observation: any) {
    await delay();
    addObservation(observation);
    return { success: true };
  },

  // Static data endpoints
  async getRewardItems() {
    await delay();
    return getRewardItems();
  },

  async getFactCategories() {
    await delay();
    return getFactCategories();
  },

  async getGames() {
    await delay();
    return getGames();
  }
};