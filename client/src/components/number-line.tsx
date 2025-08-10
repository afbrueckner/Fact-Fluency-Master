interface NumberLineProps {
  highlightNumbers?: number[];
  max?: number;
  className?: string;
}

export function NumberLine({ highlightNumbers = [], max = 20, className = "" }: NumberLineProps) {
  const numbers = Array.from({ length: max + 1 }, (_, i) => i);
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Number line */}
      <div className="relative">
        {/* Line */}
        <div className="h-0.5 bg-gray-400" style={{ width: `${max * 20}px` }}></div>
        
        {/* Tick marks and numbers */}
        <div className="relative flex justify-between" style={{ width: `${max * 20}px` }}>
          {numbers.map((num) => {
            const shouldLabel = num % 5 === 0; // Label every 5th number
            const isHighlighted = highlightNumbers.includes(num);
            
            return (
              <div key={num} className="relative flex flex-col items-center">
                {/* Tick mark */}
                <div 
                  className={`w-0.5 bg-gray-400 ${shouldLabel ? 'h-3' : 'h-2'}`}
                  style={{ transform: 'translateY(-100%)' }}
                ></div>
                
                {/* Number label */}
                {shouldLabel && (
                  <span 
                    className={`text-xs mt-1 ${
                      isHighlighted ? 'text-blue-600 font-bold' : 'text-gray-600'
                    }`}
                    style={{ transform: 'translateY(-100%)' }}
                  >
                    {num}
                  </span>
                )}
                

              </div>
            );
          })}
        </div>
      </div>
      
      {/* Arrow indicators for highlighted numbers */}
      {highlightNumbers.length > 0 && (
        <div className="mt-2 text-xs text-blue-600">
          Numbers: {highlightNumbers.join(', ')}
        </div>
      )}
    </div>
  );
}