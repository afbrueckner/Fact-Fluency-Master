import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "foundational":
        return "bg-blue-100 text-blue-800";
      case "derived":
        return "bg-green-100 text-green-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-primary-500 hover:bg-primary-600";
      case "intermediate":
        return "bg-secondary-500 hover:bg-secondary-600";
      case "advanced":
        return "bg-accent-500 hover:bg-accent-600";
      default:
        return "bg-primary-500 hover:bg-primary-600";
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{game.name}</h3>
        <span className="text-2xl">{game.emoji}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
      <div className="flex items-center justify-between mb-3">
        <Badge className={`text-xs ${getCategoryColor(game.category)}`}>
          {game.operation === "mixed" ? "Mixed" : game.operation.charAt(0).toUpperCase() + game.operation.slice(1)}
        </Badge>
        <span className="text-xs text-gray-500 capitalize">{game.category}</span>
      </div>
      <Button 
        className={`w-full text-white py-2 rounded-lg transition-colors ${getDifficultyColor(game.difficulty)}`}
        onClick={() => onPlay(game.id)}
      >
        <i className="fas fa-play mr-2"></i>Play Game
      </Button>
    </div>
  );
}
