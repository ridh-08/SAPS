import React from 'react';
import { RegionalEvent } from '../types/GameTypes';
import { Newspaper, X } from 'lucide-react';

interface EventModalProps {
  events: RegionalEvent[];
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ events, onClose }) => {
  if (events.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Newspaper className="w-6 h-6 mr-3 text-blue-600" />
              Regional Events Update
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">The following events occurred this year, impacting the region:</p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {events.map((event, idx) => (
              <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-800">{event.name}</h3>
                <p className="text-sm text-blue-700 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

