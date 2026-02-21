interface ScoreVisualizerProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ScoreVisualizer({ score, size = "md" }: ScoreVisualizerProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const getTextColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${getColor(score)} transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className={`text-right text-sm mt-1 font-medium ${getTextColor(score)}`}>
        {score}/100
      </div>
    </div>
  );
}
