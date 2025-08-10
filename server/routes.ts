import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertStudentSchema,
  insertStudentProgressSchema,
  insertGameResultSchema,
  insertAssessmentObservationSchema,
  insertQuickLooksSessionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Student routes
  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  // Fact categories routes
  app.get("/api/fact-categories", async (req, res) => {
    try {
      const categories = await storage.getFactCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fact categories" });
    }
  });

  app.get("/api/fact-categories/:operation", async (req, res) => {
    try {
      const categories = await storage.getFactCategoriesByOperation(req.params.operation);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fact categories" });
    }
  });

  // Student progress routes
  app.get("/api/students/:studentId/progress", async (req, res) => {
    try {
      const progress = await storage.getStudentProgress(req.params.studentId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student progress" });
    }
  });

  app.put("/api/students/:studentId/progress", async (req, res) => {
    try {
      const data = insertStudentProgressSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const progress = await storage.updateStudentProgress(data);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Games routes
  app.get("/api/games", async (req, res) => {
    try {
      const { category } = req.query;
      const games = category 
        ? await storage.getGamesByCategory(category as string)
        : await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Game results routes
  app.post("/api/students/:studentId/game-results", async (req, res) => {
    try {
      const data = insertGameResultSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const result = await storage.saveGameResult(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid game result data" });
    }
  });

  app.get("/api/students/:studentId/game-results", async (req, res) => {
    try {
      const results = await storage.getGameResults(req.params.studentId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game results" });
    }
  });

  // Assessment observations routes
  app.post("/api/students/:studentId/observations", async (req, res) => {
    try {
      const data = insertAssessmentObservationSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const observation = await storage.saveObservation(data);
      res.status(201).json(observation);
    } catch (error) {
      res.status(400).json({ message: "Invalid observation data" });
    }
  });

  app.get("/api/students/:studentId/observations", async (req, res) => {
    try {
      const observations = await storage.getObservations(req.params.studentId);
      res.json(observations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch observations" });
    }
  });

  // Quick Looks sessions routes
  app.post("/api/students/:studentId/quick-looks", async (req, res) => {
    try {
      const data = insertQuickLooksSessionSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const session = await storage.saveQuickLooksSession(data);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid Quick Looks session data" });
    }
  });

  app.get("/api/students/:studentId/quick-looks", async (req, res) => {
    try {
      const sessions = await storage.getQuickLooksSessions(req.params.studentId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Quick Looks sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
