interface TenFrameProps {
  number: number;
  className?: string;
}

export function TenFrame({ number, className = "" }: TenFrameProps) {
  const dots = Array.from({ length: 10 }, (_, i) => i < number);

  return (
    <div className={`inline-block ${className}`}>
      <div className="grid grid-cols-5 gap-1 p-2 border-2 border-gray-400 rounded bg-white">
        {dots.map((filled, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full border border-gray-300 ${
              filled ? "bg-blue-500" : "bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}