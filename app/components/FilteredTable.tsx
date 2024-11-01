// app/components/FilteredTable.tsx
'use client';

import { useState, useMemo } from 'react';

export interface RowData {
  origin: string;
  destination: string;
  value: string;
}

interface FilteredTableProps {
  data: RowData[];
}

export function FilteredTable({ data }: FilteredTableProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  const uniqueOrigins = useMemo(() => {
    return Array.from(new Set(data.map(row => row.origin))).sort();
  }, [data]);

  const uniqueDestinations = useMemo(() => {
    let destinations;
    if (selectedOrigin) {
      destinations = data
        .filter(row => row.origin === selectedOrigin)
        .map(row => row.destination);
    } else {
      destinations = data.map(row => row.destination);
    }
    return Array.from(new Set(destinations)).sort();
  }, [data, selectedOrigin]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesOrigin = !selectedOrigin || row.origin === selectedOrigin;
      const matchesDestination = !selectedDestination || row.destination === selectedDestination;
      return matchesOrigin && matchesDestination;
    });
  }, [data, selectedOrigin, selectedDestination]);

  const handleOriginChange = (value: string) => {
    setSelectedOrigin(value);
    const validDestinations = data
      .filter(row => row.origin === value)
      .map(row => row.destination);
    if (value === '' || validDestinations.includes(selectedDestination)) {
      return;
    }
    setSelectedDestination('');
  };

  const handleClearFilters = () => {
    setSelectedOrigin('');
    setSelectedDestination('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-end">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin {selectedOrigin && `(${selectedOrigin})`}
          </label>
          <select
            className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            value={selectedOrigin}
            onChange={(e) => handleOriginChange(e.target.value)}
          >
            <option value="">All Origins</option>
            {uniqueOrigins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination {selectedDestination && `(${selectedDestination})`}
          </label>
          <select
            className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
          >
            <option value="">All Destinations</option>
            {uniqueDestinations.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleClearFilters}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${selectedOrigin || selectedDestination 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          disabled={!selectedOrigin && !selectedDestination}
        >
          Clear Filters
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} entries
          {(selectedOrigin || selectedDestination) && (
            <span>
              {selectedOrigin && ` • Origin: ${selectedOrigin}`}
              {selectedDestination && ` • Destination: ${selectedDestination}`}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.origin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.destination}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}