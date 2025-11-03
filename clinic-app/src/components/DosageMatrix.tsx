import React from 'react';

interface DosageMatrixProps {
  drug: {
    frequency: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
      night: boolean;
    };
    timingRelation: string;
    timeOffsetMinutes: number;
  };
  onChange: (patch: any) => void;
}

export default function DosageMatrix({ drug, onChange }: DosageMatrixProps) {
  const toggleFrequency = (time: 'morning' | 'afternoon' | 'evening' | 'night') => {
    onChange({
      frequency: {
        ...drug.frequency,
        [time]: !drug.frequency[time]
      }
    });
  };

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Frequency (Dosage Times)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => toggleFrequency(time)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                drug.frequency[time]
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Timing Relation</label>
          <select
            value={drug.timingRelation}
            onChange={(e) => onChange({ timingRelation: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="After Food">After Food</option>
            <option value="Before Food">Before Food</option>
            <option value="With Food">With Food</option>
            <option value="Empty Stomach">Empty Stomach</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Time Offset (minutes)</label>
          <input
            type="number"
            value={drug.timeOffsetMinutes}
            onChange={(e) => onChange({ timeOffsetMinutes: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded"
            min="0"
            step="15"
          />
        </div>
      </div>
    </div>
  );
}