import React, { useState } from 'react';
import { searchDocuments } from '../services/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    documentType: '',
    riskLevel: '',
    dateRange: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await searchDocuments(query, filters);
      setResults(response.data.results);
    } catch (err) {
      setError('Failed to search documents. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Search & Query</h2>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search across all documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.documentType}
            onChange={(e) => setFilters({...filters, documentType: e.target.value})}
            className="input-field"
          >
            <option value="">All Document Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">DOC</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
            className="input-field"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="input-field"
          />
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Search Results</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{result.filename}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                      result.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.riskLevel} Risk
                    </span>
                    <span className="text-sm text-gray-500">
                      {(result.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{result.snippet}</p>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-800 text-sm">View</button>
                  <button className="text-primary-600 hover:text-primary-800 text-sm">Analyze</button>
                  <button className="text-primary-600 hover:text-primary-800 text-sm">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
