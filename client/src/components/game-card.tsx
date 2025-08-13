import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";
import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "foundational": return "bg-blue-100 text-blue-800";
      case "derived": return "bg-purple-100 text-purple-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{game.emoji}</span>
            <div>
              <CardTitle className="text-lg">{game.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {game.operation}
              </CardDescription>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge className={getDifficultyColor(game.difficulty)}>
            {game.difficulty}
          </Badge>
          <Badge className={getCategoryColor(game.category)}>
            {game.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {game.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 mr-2" />
            <span>Target Facts: {game.targetFacts.slice(0, 3).join(", ")}{game.targetFacts.length > 3 ? "..." : ""}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onPlay(game.id)} 
          className="w-full"
          size="sm"
        >
          Play Game
        </Button>
      </CardFooter>
    </Card>
  );
}