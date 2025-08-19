import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { ProgressOverview } from "@/components/progress-overview";
import { FoundationalFacts } from "@/components/foundational-facts";
import { DerivedStrategies } from "@/components/derived-strategies";
import { GameCard } from "@/components/game-card";
import { Student, StudentProgress, FactCategory, Game } from "@shared/schema";

export default function Dashboard() {

  const { data: progress = [] } = useQuery<StudentProgress[]>({
    queryKey: ["/api/students/student-1/progress"],
  });

  const { data: factCategories = [] } = useQuery<FactCategory[]>({
    queryKey: ["/api/fact-categories"],
  });

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const handlePlayGame = (gameId: string) => {
    // In a real implementation, this would navigate to the game
    console.log("Playing game:", gameId);
  };

  // Featured games for dashboard
  const featuredGames = games.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressOverview progress={progress} factCategories={factCategories} />
        
        <FoundationalFacts progress={progress} factCategories={factCategories} />
        
        <DerivedStrategies progress={progress} factCategories={factCategories} />
        
        {/* Featured Games Section */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Featured Math Fact Games</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onPlay={handlePlayGame} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* Bay-Williams & Kling Framework */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Bay-Williams & Kling Framework</h2>
            
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <div className="bg-primary-50 rounded-lg p-4 text-center border-2 border-primary-200">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold text-primary-800 text-sm mb-2">Focus on Fluency</h3>
                <p className="text-xs text-primary-700">Accuracy, efficiency, flexibility, and appropriate strategies</p>
              </div>
              
              <div className="bg-secondary-50 rounded-lg p-4 text-center border-2 border-secondary-200">
                <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold text-secondary-800 text-sm mb-2">Three Phases</h3>
                <p className="text-xs text-secondary-700">Counting → Deriving → Mastery progression</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold text-purple-800 text-sm mb-2">Foundational First</h3>
                <p className="text-xs text-purple-700">Master foundational facts before derived strategies</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 text-center border-2 border-red-200">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-semibold text-red-800 text-sm mb-2">No Timed Tests</h3>
                <p className="text-xs text-red-700">Timed tests don't assess true fluency components</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center border-2 border-orange-200">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="font-semibold text-orange-800 text-sm mb-2">Enjoyable Practice</h3>
                <p className="text-xs text-orange-700">Substantial practice through engaging games</p>
              </div>
            </div>
            
            {/* No Timed Tests Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-ban text-red-500 mt-1"></i>
                <div>
                  <h4 className="font-medium text-red-800">Research-Based Approach: No Timed Tests</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Following NCTM guidelines, we focus on understanding and flexible thinking rather than speed. 
                    Timed tests can create math anxiety and don't assess true fluency components like flexibility and appropriate strategy use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
