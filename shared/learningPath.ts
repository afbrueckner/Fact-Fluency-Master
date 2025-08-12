import { StudentProgress, FactCategory } from './schema';

export interface LearningPathRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'foundational' | 'derived' | 'assessment' | 'review';
  targetFacts: string[];
  suggestedActivities: Activity[];
  estimatedTime: number; // minutes
  prerequisites: string[];
  nextSteps: string[];
}

export interface Activity {
  type: 'game' | 'practice' | 'assessment' | 'strategy-instruction';
  name: string;
  description: string;
  gameId?: string;
  duration: number; // minutes
}

export interface LearningPath {
  studentId: string;
  currentPhase: 'counting' | 'deriving' | 'mastery';
  overallProgress: {
    accuracy: number;
    efficiency: number;
    flexibility: number;
    strategyUse: number;
  };
  strengths: string[];
  growthAreas: string[];
  recommendations: LearningPathRecommendation[];
  nextMilestones: Milestone[];
  generatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  category: string;
  requiredAccuracy: number;
  isCompleted: boolean;
}

export interface LearningPathAnalysis {
  studentProgress: StudentProgress[];
  factCategories: FactCategory[];
  studentId: string;
}

export class LearningPathEngine {
  static analyzeLearningPath(analysis: LearningPathAnalysis): LearningPath {
    const { studentProgress, factCategories, studentId } = analysis;
    
    const overallProgress = this.calculateOverallProgress(studentProgress);
    const currentPhase = this.determineCurrentPhase(studentProgress);
    const strengths = this.identifyStrengths(studentProgress, factCategories);
    const growthAreas = this.identifyGrowthAreas(studentProgress, factCategories);
    const recommendations = this.generateRecommendations(studentProgress, factCategories);
    const nextMilestones = this.generateMilestones(studentProgress, factCategories);

    return {
      studentId,
      currentPhase,
      overallProgress,
      strengths,
      growthAreas,
      recommendations,
      nextMilestones,
      generatedAt: new Date()
    };
  }

  private static calculateOverallProgress(progress: StudentProgress[]) {
    if (progress.length === 0) {
      return { accuracy: 0, efficiency: 0, flexibility: 0, strategyUse: 0 };
    }

    return {
      accuracy: Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length),
      efficiency: Math.round(progress.reduce((sum, p) => sum + p.efficiency, 0) / progress.length),
      flexibility: Math.round(progress.reduce((sum, p) => sum + p.flexibility, 0) / progress.length),
      strategyUse: Math.round(progress.reduce((sum, p) => sum + p.strategyUse, 0) / progress.length)
    };
  }

  private static determineCurrentPhase(progress: StudentProgress[]): 'counting' | 'deriving' | 'mastery' {
    if (progress.length === 0) return 'counting';

    const phaseWeights = { counting: 0, deriving: 1, mastery: 2 };
    const averagePhase = progress.reduce((sum, p) => sum + phaseWeights[p.phase as keyof typeof phaseWeights], 0) / progress.length;

    if (averagePhase < 0.5) return 'counting';
    if (averagePhase < 1.5) return 'deriving';
    return 'mastery';
  }

  private static identifyStrengths(progress: StudentProgress[], categories: FactCategory[]): string[] {
    const strengths: string[] = [];
    
    // Identify categories with high performance (90%+ accuracy)
    const strongCategories = progress.filter(p => p.accuracy >= 90);
    strongCategories.forEach(p => {
      const category = categories.find(c => c.id === p.factCategoryId);
      if (category) {
        strengths.push(`${category.name} (${category.operation})`);
      }
    });

    // Identify strong fluency components
    const overallProgress = this.calculateOverallProgress(progress);
    if (overallProgress.accuracy >= 85) strengths.push('Strong accuracy');
    if (overallProgress.efficiency >= 85) strengths.push('Good speed and efficiency');
    if (overallProgress.flexibility >= 85) strengths.push('Flexible strategy use');
    if (overallProgress.strategyUse >= 85) strengths.push('Strategic thinking');

    return strengths.slice(0, 4); // Top 4 strengths
  }

  private static identifyGrowthAreas(progress: StudentProgress[], categories: FactCategory[]): string[] {
    const growthAreas: string[] = [];
    
    // Identify categories needing improvement (less than 70% accuracy)
    const weakCategories = progress.filter(p => p.accuracy < 70);
    weakCategories.forEach(p => {
      const category = categories.find(c => c.id === p.factCategoryId);
      if (category) {
        growthAreas.push(`${category.name} (${category.operation})`);
      }
    });

    // Identify weak fluency components
    const overallProgress = this.calculateOverallProgress(progress);
    if (overallProgress.accuracy < 75) growthAreas.push('Accuracy needs improvement');
    if (overallProgress.efficiency < 75) growthAreas.push('Speed and efficiency');
    if (overallProgress.flexibility < 75) growthAreas.push('Strategy flexibility');
    if (overallProgress.strategyUse < 75) growthAreas.push('Strategy development');

    return growthAreas.slice(0, 4); // Top 4 growth areas
  }

  private static generateRecommendations(progress: StudentProgress[], categories: FactCategory[]): LearningPathRecommendation[] {
    const recommendations: LearningPathRecommendation[] = [];
    
    // Find categories that need immediate attention (accuracy < 60%)
    const urgentCategories = progress.filter(p => p.accuracy < 60);
    urgentCategories.forEach((p, index) => {
      const category = categories.find(c => c.id === p.factCategoryId);
      if (category && index < 2) { // Limit to top 2 urgent items
        recommendations.push({
          id: `urgent-${p.factCategoryId}`,
          title: `Focus on ${category.name}`,
          description: `This foundational area needs immediate attention. Current accuracy: ${p.accuracy}%`,
          priority: 'high',
          category: category.category as 'foundational' | 'derived',
          targetFacts: category.examples,
          suggestedActivities: this.getActivitiesForCategory(category, 'intensive'),
          estimatedTime: 30,
          prerequisites: [],
          nextSteps: [`Achieve 75% accuracy in ${category.name}`]
        });
      }
    });

    // Find categories ready for advancement (accuracy 70-85%)
    const advancementCategories = progress.filter(p => p.accuracy >= 70 && p.accuracy < 85);
    advancementCategories.forEach((p, index) => {
      const category = categories.find(c => c.id === p.factCategoryId);
      if (category && index < 2) { // Limit to top 2 advancement items
        recommendations.push({
          id: `advance-${p.factCategoryId}`,
          title: `Build fluency in ${category.name}`,
          description: `You're making good progress! Let's build speed and flexibility. Current accuracy: ${p.accuracy}%`,
          priority: 'medium',
          category: category.category as 'foundational' | 'derived',
          targetFacts: category.examples,
          suggestedActivities: this.getActivitiesForCategory(category, 'building'),
          estimatedTime: 20,
          prerequisites: [`70% accuracy in ${category.name}`],
          nextSteps: [`Achieve 90% accuracy and improve efficiency in ${category.name}`]
        });
      }
    });

    // Add assessment recommendation if student has mixed progress
    if (progress.some(p => p.accuracy >= 80) && progress.some(p => p.accuracy < 70)) {
      recommendations.push({
        id: 'comprehensive-assessment',
        title: 'Complete Self-Assessment',
        description: 'Reflect on your problem-solving strategies to identify your best approaches',
        priority: 'medium',
        category: 'assessment',
        targetFacts: [],
        suggestedActivities: [
          {
            type: 'assessment',
            name: 'Strategy Sorting Assessment',
            description: 'Sort math facts by how you solve them',
            duration: 15
          }
        ],
        estimatedTime: 15,
        prerequisites: [],
        nextSteps: ['Use assessment insights to focus practice']
      });
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
  }

  private static getActivitiesForCategory(category: FactCategory, focus: 'intensive' | 'building'): Activity[] {
    const activities: Activity[] = [];
    
    if (focus === 'intensive') {
      // For struggling areas, focus on foundational practice
      activities.push(
        {
          type: 'strategy-instruction',
          name: `${category.name} Strategy Lesson`,
          description: `Learn key strategies for ${category.name}`,
          duration: 10
        },
        {
          type: 'practice',
          name: 'Guided Practice',
          description: 'Practice with visual supports and prompts',
          duration: 15
        },
        {
          type: 'game',
          name: 'Foundation Game',
          description: `Play games focused on ${category.name}`,
          gameId: this.getGameForCategory(category),
          duration: 15
        }
      );
    } else {
      // For building areas, focus on fluency and application
      activities.push(
        {
          type: 'game',
          name: 'Fluency Game',
          description: `Build speed and accuracy with ${category.name}`,
          gameId: this.getGameForCategory(category),
          duration: 15
        },
        {
          type: 'practice',
          name: 'Timed Practice',
          description: 'Work on efficiency with structured timing',
          duration: 10
        }
      );
    }
    
    return activities;
  }

  private static getGameForCategory(category: FactCategory): string {
    // Map categories to appropriate games
    const gameMapping: { [key: string]: string } = {
      'add-plus-minus-1-2': 'racing-bears',
      'add-doubles': 'doubles-bingo',
      'add-combinations-10': 'sum-war',
      'mult-2-5-10': 'trios',
      'mult-squares': 'three-dice-take'
    };
    
    return gameMapping[category.id] || 'racing-bears';
  }

  private static generateMilestones(progress: StudentProgress[], categories: FactCategory[]): Milestone[] {
    const milestones: Milestone[] = [];
    const now = new Date();
    
    // Generate milestone for each category that's not yet mastered
    progress.forEach((p, index) => {
      const category = categories.find(c => c.id === p.factCategoryId);
      if (category && p.accuracy < 90 && index < 3) { // Limit to 3 near-term milestones
        const weeksToAdd = p.accuracy < 60 ? 4 : p.accuracy < 80 ? 2 : 1;
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + (weeksToAdd * 7));
        
        milestones.push({
          id: `milestone-${p.factCategoryId}`,
          title: `Master ${category.name}`,
          description: `Achieve 90% accuracy in ${category.name} facts`,
          targetDate,
          category: category.name,
          requiredAccuracy: 90,
          isCompleted: p.accuracy >= 90
        });
      }
    });
    
    return milestones;
  }
}