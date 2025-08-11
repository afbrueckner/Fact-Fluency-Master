import { 
  type Student, 
  type InsertStudent,
  type FactCategory,
  type StudentProgress,
  type InsertStudentProgress,
  type Game,
  type GameResult,
  type InsertGameResult,
  type AssessmentObservation,
  type InsertAssessmentObservation,
  type QuickLooksSession,
  type InsertQuickLooksSession,
  type SelfAssessment,
  type InsertSelfAssessment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Fact Categories
  getFactCategories(): Promise<FactCategory[]>;
  getFactCategoriesByOperation(operation: string): Promise<FactCategory[]>;
  
  // Student Progress
  getStudentProgress(studentId: string): Promise<StudentProgress[]>;
  getStudentProgressByCategory(studentId: string, factCategoryId: string): Promise<StudentProgress | undefined>;
  updateStudentProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  
  // Games
  getGames(): Promise<Game[]>;
  getGamesByCategory(category: string): Promise<Game[]>;
  getGame(id: string): Promise<Game | undefined>;
  
  // Game Results
  saveGameResult(result: InsertGameResult): Promise<GameResult>;
  getGameResults(studentId: string): Promise<GameResult[]>;
  
  // Assessment Observations
  saveObservation(observation: InsertAssessmentObservation): Promise<AssessmentObservation>;
  getObservations(studentId: string): Promise<AssessmentObservation[]>;
  
  // Quick Looks Sessions
  saveQuickLooksSession(session: InsertQuickLooksSession): Promise<QuickLooksSession>;
  getQuickLooksSessions(studentId: string): Promise<QuickLooksSession[]>;
  
  // Self Assessments
  saveSelfAssessment(assessment: InsertSelfAssessment): Promise<SelfAssessment>;
  getSelfAssessments(studentId: string): Promise<SelfAssessment[]>;
  updateSelfAssessment(id: string, updates: Partial<InsertSelfAssessment>): Promise<SelfAssessment>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private factCategories: Map<string, FactCategory>;
  private studentProgress: Map<string, StudentProgress>;
  private games: Map<string, Game>;
  private gameResults: Map<string, GameResult>;
  private observations: Map<string, AssessmentObservation>;
  private quickLooksSessions: Map<string, QuickLooksSession>;
  private selfAssessments: Map<string, SelfAssessment>;

  constructor() {
    this.students = new Map();
    this.factCategories = new Map();
    this.studentProgress = new Map();
    this.games = new Map();
    this.gameResults = new Map();
    this.observations = new Map();
    this.quickLooksSessions = new Map();
    this.selfAssessments = new Map();
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default student
    const defaultStudent: Student = {
      id: "student-1",
      name: "Alex Rodriguez",
      grade: 6,
      section: "A",
      initials: "AR",
      createdAt: new Date(),
    };
    this.students.set(defaultStudent.id, defaultStudent);

    // Initialize fact categories
    const factCategoriesData: FactCategory[] = [
      {
        id: "add-plus-minus-1-2",
        operation: "addition",
        category: "foundational",
        name: "+/- 1 or 2",
        description: "Adding or subtracting 1 or 2",
        examples: ["3+1", "7+2", "9-1", "5-2"],
        phase: "counting"
      },
      {
        id: "add-doubles",
        operation: "addition",
        category: "foundational",
        name: "Doubles",
        description: "Adding the same number to itself",
        examples: ["2+2", "6+6", "8+8", "9+9"],
        phase: "counting"
      },
      {
        id: "add-combinations-10",
        operation: "addition",
        category: "foundational",
        name: "Combinations of 10",
        description: "Number pairs that sum to 10",
        examples: ["3+7", "8+2", "5+5", "4+6"],
        phase: "deriving"
      },
      {
        id: "add-10-plus",
        operation: "addition",
        category: "foundational",
        name: "10 + facts",
        description: "Adding 10 to single digits",
        examples: ["10+3", "10+7", "10+9", "10+5"],
        phase: "deriving"
      },
      {
        id: "mult-2-5-10",
        operation: "multiplication",
        category: "foundational",
        name: "2s, 5s, 10s",
        description: "Multiplication by 2, 5, and 10",
        examples: ["7×2", "6×5", "8×10", "4×5"],
        phase: "counting"
      },
      {
        id: "mult-0-1",
        operation: "multiplication",
        category: "foundational",
        name: "0s, 1s",
        description: "Multiplication by 0 and 1",
        examples: ["6×0", "9×1", "1×8", "0×5"],
        phase: "counting"
      },
      {
        id: "mult-squares",
        operation: "multiplication",
        category: "foundational",
        name: "Squares",
        description: "Multiplying a number by itself",
        examples: ["3×3", "7×7", "9×9", "4×4"],
        phase: "deriving"
      }
    ];

    factCategoriesData.forEach(category => {
      this.factCategories.set(category.id, category);
    });

    // Initialize games
    const gamesData: Game[] = [
      {
        id: "racing-bears",
        name: "Racing Bears",
        description: "Practice +0, +1, +2 facts with racing theme",
        operation: "addition",
        category: "foundational",
        targetFacts: ["+0", "+1", "+2"],
        emoji: "🐻",
        difficulty: "beginner"
      },
      {
        id: "doubles-bingo",
        name: "Doubles Bingo",
        description: "Master doubles facts with bingo gameplay",
        operation: "addition",
        category: "foundational",
        targetFacts: ["doubles"],
        emoji: "🎯",
        difficulty: "beginner"
      },
      {
        id: "trios",
        name: "Trios",
        description: "Practice multiplication facts by making trios",
        operation: "multiplication",
        category: "foundational",
        targetFacts: ["×2", "×5", "×10"],
        emoji: "🎲",
        difficulty: "intermediate"
      },
      {
        id: "sum-war",
        name: "Sum War",
        description: "Battle with addition using derived strategies",
        operation: "addition",
        category: "derived",
        targetFacts: ["near doubles", "making ten"],
        emoji: "⚔️",
        difficulty: "intermediate"
      },
      {
        id: "salute",
        name: "Salute!",
        description: "Practice fact families with missing addends",
        operation: "mixed",
        category: "derived",
        targetFacts: ["fact families", "missing addends"],
        emoji: "👋",
        difficulty: "intermediate"
      },
      {
        id: "three-dice-take",
        name: "Three Dice Take",
        description: "Multi-operation practice with strategic thinking",
        operation: "mixed",
        category: "advanced",
        targetFacts: ["all operations"],
        emoji: "🎲",
        difficulty: "advanced"
      }
    ];

    gamesData.forEach(game => {
      this.games.set(game.id, game);
    });

    // Initialize sample progress data
    const progressData: StudentProgress[] = [
      {
        id: "progress-1",
        studentId: "student-1",
        factCategoryId: "add-plus-minus-1-2",
        phase: "mastery",
        accuracy: 95,
        efficiency: 90,
        flexibility: 80,
        strategyUse: 85,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-2",
        studentId: "student-1",
        factCategoryId: "add-doubles",
        phase: "mastery",
        accuracy: 92,
        efficiency: 88,
        flexibility: 85,
        strategyUse: 90,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-3",
        studentId: "student-1",
        factCategoryId: "add-combinations-10",
        phase: "deriving",
        accuracy: 80,
        efficiency: 70,
        flexibility: 75,
        strategyUse: 78,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "progress-4",
        studentId: "student-1",
        factCategoryId: "mult-2-5-10",
        phase: "mastery",
        accuracy: 88,
        efficiency: 85,
        flexibility: 80,
        strategyUse: 82,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      }
    ];

    progressData.forEach(progress => {
      this.studentProgress.set(progress.id, progress);
    });
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      createdAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async getFactCategories(): Promise<FactCategory[]> {
    return Array.from(this.factCategories.values());
  }

  async getFactCategoriesByOperation(operation: string): Promise<FactCategory[]> {
    return Array.from(this.factCategories.values()).filter(
      category => category.operation === operation
    );
  }

  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    return Array.from(this.studentProgress.values()).filter(
      progress => progress.studentId === studentId
    );
  }

  async getStudentProgressByCategory(studentId: string, factCategoryId: string): Promise<StudentProgress | undefined> {
    return Array.from(this.studentProgress.values()).find(
      progress => progress.studentId === studentId && progress.factCategoryId === factCategoryId
    );
  }

  async updateStudentProgress(insertProgress: InsertStudentProgress): Promise<StudentProgress> {
    const existing = await this.getStudentProgressByCategory(
      insertProgress.studentId, 
      insertProgress.factCategoryId
    );

    if (existing) {
      const updated: StudentProgress = {
        ...existing,
        ...insertProgress,
        updatedAt: new Date(),
      };
      this.studentProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const progress: StudentProgress = {
        ...insertProgress,
        id,
        accuracy: insertProgress.accuracy ?? 0,
        efficiency: insertProgress.efficiency ?? 0,
        flexibility: insertProgress.flexibility ?? 0,
        strategyUse: insertProgress.strategyUse ?? 0,
        lastPracticed: new Date(),
        updatedAt: new Date(),
      };
      this.studentProgress.set(id, progress);
      return progress;
    }
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGamesByCategory(category: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      game => game.category === category
    );
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async saveGameResult(insertResult: InsertGameResult): Promise<GameResult> {
    const id = randomUUID();
    const result: GameResult = {
      ...insertResult,
      id,
      completedAt: new Date(),
    };
    this.gameResults.set(id, result);
    return result;
  }

  async getGameResults(studentId: string): Promise<GameResult[]> {
    return Array.from(this.gameResults.values()).filter(
      result => result.studentId === studentId
    );
  }

  async saveObservation(insertObservation: InsertAssessmentObservation): Promise<AssessmentObservation> {
    const id = randomUUID();
    const observation: AssessmentObservation = {
      ...insertObservation,
      id,
      createdAt: new Date(),
    };
    this.observations.set(id, observation);
    return observation;
  }

  async getObservations(studentId: string): Promise<AssessmentObservation[]> {
    return Array.from(this.observations.values()).filter(
      observation => observation.studentId === studentId
    );
  }

  async saveQuickLooksSession(insertSession: InsertQuickLooksSession): Promise<QuickLooksSession> {
    const id = randomUUID();
    const session: QuickLooksSession = {
      ...insertSession,
      id,
      completedAt: new Date(),
    };
    this.quickLooksSessions.set(id, session);
    return session;
  }

  async getQuickLooksSessions(studentId: string): Promise<QuickLooksSession[]> {
    return Array.from(this.quickLooksSessions.values()).filter(
      session => session.studentId === studentId
    );
  }

  async saveSelfAssessment(insertAssessment: InsertSelfAssessment): Promise<SelfAssessment> {
    const id = randomUUID();
    const assessment: SelfAssessment = {
      ...insertAssessment,
      id,
      createdAt: new Date(),
    };
    this.selfAssessments.set(id, assessment);
    return assessment;
  }

  async getSelfAssessments(studentId: string): Promise<SelfAssessment[]> {
    return Array.from(this.selfAssessments.values()).filter(
      assessment => assessment.studentId === studentId
    );
  }

  async updateSelfAssessment(id: string, updates: Partial<InsertSelfAssessment>): Promise<SelfAssessment> {
    const existing = this.selfAssessments.get(id);
    if (!existing) {
      throw new Error(`Self assessment with id ${id} not found`);
    }
    
    const updated: SelfAssessment = {
      ...existing,
      ...updates,
    };
    this.selfAssessments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
