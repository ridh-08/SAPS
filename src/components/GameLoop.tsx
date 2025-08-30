import React from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface GameLoopProps {
  year: number;
  startYear: number;
  endYear: number;
  gameActive: boolean;
  onNextYear: () => void;
  onRestart: () => void;
  onFinish: () => void;
  isLastYear: boolean;
}

export const GameLoop: React.FC<GameLoopProps> = ({
  year,
  startYear,
  endYear,
  gameActive,
  onNextYear,
  onRestart,
  onFinish,
  isLastYear
}) => {
  const progress = ((year - startYear) / (endYear - startYear)) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Game Progress</h3>
          <p className="text-gray-600">Year {year} of {endYear}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRestart}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </button>
          
          {isLastYear ? (
            <button
              onClick={onFinish}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Flag className="w-4 h-4 mr-2" />
              Finish Game
            </button>
          ) : (
            <button
              onClick={onNextYear}
              disabled={!gameActive}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Next Year
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Started: {startYear}</span>
        <span>Progress: {progress.toFixed(0)}%</span>
        <span>End: {endYear}</span>
      </div>

      {isLastYear && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium text-center">
            🎉 Final year! Click "Finish Game" to see your results and regional comparison.
          </p>
        </div>
      )}
    </div>
  );
};