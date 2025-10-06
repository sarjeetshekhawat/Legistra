import React, { useState, useEffect } from 'react';
import { analyzeDocument, getTaskStatus, getDocuments, exportAnalysis } from '../services/api';

// Helper function to validate and process clauses
const processClauses = (clauses) => {
  const isDescriptiveLegalHeading = (rawHeading) => {
    if (!rawHeading || typeof rawHeading !== 'string') return false;

    const heading = rawHeading.trim();
    if (heading.length === 0) return false;

    // Reject purely numeric headings
    if (/^[\d\s.,;:\-()[\]\/\\]+$/.test(heading)) return false;
    if (/^\s*\d{1,4}\s*$/.test(heading)) return false;
    if (/^\d/.test(heading) && heading.length < 15) return false;
    if (/\s+\d{1,2}\s*$/.test(heading)) return false;

    // Length and character requirements
    if (heading.length < 5) return false;
    const letterMatches = heading.match(/[a-zA-Z]/g);
    if (!letterMatches || letterMatches.length < 4) return false;
    if (!/[a-zA-Z]{4,}/.test(heading)) return false;

    // Reject generic terms
    const lowerHeading = heading.toLowerCase();
    const invalidTerms = [
      'clause', 'section', 'article', 'paragraph', 'item',
      'part', 'title', 'heading', 'subsection', 'subparagraph',
      'unnamed', 'undefined', 'null', 'n/a', 'na', 'none',
      'blank', 'untitled', 'unknown', 'untitled clause'
    ];
    if (invalidTerms.includes(lowerHeading)) return false;
    if (/^(clause|section|article|paragraph|part|item)\s*\d+$/i.test(heading)) return false;

    // Digit ratio check
    const nonSpaceChars = heading.replace(/\s/g, '');
    const digitCount = (nonSpaceChars.match(/\d/g) || []).length;
    if (digitCount / nonSpaceChars.length > 0.3) return false;

    return true;
  };

  const finalClauses = [];
  let activeClause = null;

  (clauses || []).forEach((clause) => {
    let proposedHeading = null;
    let clauseContent = '';

    if (typeof clause === 'string') {
      clauseContent = clause.trim();
    } else if (clause && typeof clause === 'object') {
      clauseContent = (clause.content || '').trim();
      if (clause.heading && isDescriptiveLegalHeading(clause.heading)) {
        proposedHeading = clause.heading.trim();
      }
    }

    if (!clauseContent) return;

    if (proposedHeading) {
      activeClause = { heading: proposedHeading, content: clauseContent };
      finalClauses.push(activeClause);
    } else {
      if (activeClause) {
        activeClause.content += '\n\n' + clauseContent;
      } else {
        activeClause = { heading: null, content: clauseContent };
        finalClauses.push(activeClause);
      }
    }
  });

  return finalClauses;
};

const Analysis = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.data.documents);
    } catch (err) {
      setError('Failed to fetch documents');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDocument) {
      setError('Please select a document');
      return;
    }
    setError('');
    setAnalysisResult(null);
    setStatus('Starting analysis...');
    try {
      const response = await analyzeDocument(selectedDocument);
      setTaskId(response.data.task_id);
      setStatus('Processing...');
      pollTaskStatus(response.data.task_id);
    } catch (err) {
      setError('Failed to start analysis');
    }
  };

  const pollTaskStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await getTaskStatus(id);
        const task = response.data;
        setStatus(task.state);
        if (task.state === 'SUCCESS') {
          setAnalysisResult(task.result);
          clearInterval(interval);
        } else if (task.state === 'FAILURE') {
          setError('Analysis failed');
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to check task status');
        clearInterval(interval);
      }
    }, 1000);
  };



  const handleExportAnalysis = async () => {
    try {
      const response = await exportAnalysis(selectedDocument);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_report_${selectedDocument}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export analysis');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Analysis Results</h2>

      {/* Document Selection */}
      <div className="card mb-6">
        <h3 className="text-lg font-medium mb-4">Select Document</h3>
        <select
          value={selectedDocument}
          onChange={(e) => setSelectedDocument(e.target.value)}
          className="border rounded p-2 mb-4"
        >
          <option value="">Select a document</option>
          {documents.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.filename}
            </option>
          ))}
        </select>
        <button
          onClick={handleAnalyze}
          disabled={!selectedDocument || status === 'Processing...'}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Analyze Document
        </button>
        {status && <p className="mt-2">{status}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {analysisResult && (
        <>
          {/* Document Summary */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4">Document Summary</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{analysisResult.analysis.summary}</p>
            </div>
          </div>

    {/* Identified Clauses */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4">Identified Clauses</h3>
            {(() => {
              const finalClauses = processClauses(analysisResult.analysis.clauses);

              // Empty state if no valid clauses found
              if (finalClauses.length === 0) {
                return (
                  <div className="text-center py-8 bg-gray-100 rounded-lg">
                    <p className="text-gray-500 text-base">No standard clauses identified in this document.</p>
                  </div>
                );
              }

              // Render consolidated clauses as collapsible accordions
              return (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    {finalClauses.length} clause{finalClauses.length !== 1 ? 's' : ''} identified
                  </p>
                  {finalClauses.map((clauseBlock, idx) => (
                    <details
                      key={idx}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <summary className="cursor-pointer p-4 font-semibold text-blue-800 hover:bg-blue-50 transition-colors flex items-center justify-between">
                        <span>
                          {clauseBlock.heading || `Clause ${idx + 1}`}
                        </span>
                        <svg className="w-5 h-5 text-blue-600 transform transition-transform duration-200 details-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">
                          {clauseBlock.content}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Clause Classification Summary */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4">Clause Classification Summary</h3>
            {analysisResult.analysis.classification && Object.keys(analysisResult.analysis.classification).length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {Object.entries(analysisResult.analysis.classification).map(([category, percentage]) => (
                  <li key={category} className="capitalize">
                    {category.replace(/_/g, ' ')}: {percentage.toFixed(1)}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No clause classifications available.</p>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="card mb-6">
            <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Risks</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {analysisResult.analysis.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Export Analysis */}
          <div className="flex justify-end">
            <button
              onClick={handleExportAnalysis}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Export Analysis Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;