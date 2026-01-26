import React, { useState, useEffect } from 'react';
import { analyzeDocument, getTaskStatus, getDocuments, exportAnalysis, analyzeDocumentFastMultilingual } from '../services/api';

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
    setTaskId(null);
    setStatus('Starting fast multilingual analysis...');
    
    try {
      // Use fast multilingual analysis to avoid timeout
      const response = await analyzeDocumentFastMultilingual(selectedDocument);
      
      if (response.status === 200 && response.data) {
        // Fast multilingual analysis completed immediately
        setAnalysisResult(response.data);
        setStatus('Fast analysis completed');
        console.log('Fast multilingual analysis completed:', response.data);
        
        // Display language info if available
        const languageInfo = response.data.language_info;
        if (languageInfo) {
          console.log(`Detected language: ${languageInfo.detected_language}`);
          console.log(`Analysis type: ${languageInfo.analysis_type}`);
        }
      } else {
        setError('Invalid response from server');
        setStatus('');
      }
    } catch (err) {
      console.error('Error starting fast analysis:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to start analysis';
      setError(`Failed to start analysis: ${errorMsg}`);
      setStatus('');
    }
  };

  const pollTaskStatus = (id) => {
    let pollCount = 0;
    const maxPolls = 300; // 5 minutes max (300 * 1 second)
    
    const interval = setInterval(async () => {
      pollCount++;
      
      // Timeout after max polls
      if (pollCount > maxPolls) {
        clearInterval(interval);
        setError('Analysis timeout - task is taking too long. Please check backend logs.');
        setStatus('TIMEOUT');
        return;
      }
      
      try {
        const response = await getTaskStatus(id);
        const task = response.data;
        
        // Update status display
        if (task.state === 'PENDING') {
          setStatus(`Pending... (${pollCount}s)`);
        } else if (task.state === 'PROGRESS') {
          const progress = task.progress || 0;
          setStatus(`Processing... ${progress}%`);
        } else {
          setStatus(task.state);
        }
        
        // Handle final states
        if (task.state === 'SUCCESS') {
          setAnalysisResult(task.result);
          setStatus('Completed');
          clearInterval(interval);
        } else if (task.state === 'FAILURE') {
          const errorMsg = task.error || task.status || 'Analysis failed';
          setError(`Analysis failed: ${errorMsg}`);
          setStatus('FAILED');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling task status:', err);
        // Don't stop polling on network errors, but log them
        if (pollCount > 10) {
          setError('Failed to check task status. Please check if backend is running.');
          clearInterval(interval);
        }
      }
    }, 1000);
    
    // Store interval ID for cleanup if component unmounts
    return () => clearInterval(interval);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
        <p className="text-gray-600">
          AI-powered legal document analysis complete
        </p>
      </div>

      {/* Document Selection Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Select Document</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a document</option>
                {(documents || []).map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.filename}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!selectedDocument || status === 'Processing...'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'Processing...' ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Analyze Document
                </>
              )}
            </button>
            
            {status && (
              <div className={`p-3 rounded-md ${
                status.includes('completed') || status.includes('Fast') 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${
                  status.includes('completed') || status.includes('Fast') 
                    ? 'text-green-800' 
                    : 'text-blue-800'
                }`}>
                  {status}
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && analysisResult.analysis && (
        <>
          {/* Language Information */}
          {analysisResult.language_info && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Language Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Detected Language</p>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {analysisResult.language_info.detected_language}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Analysis Type</p>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {analysisResult.language_info.analysis_type}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Model Used</p>
                    <p className="text-sm text-gray-900">{analysisResult.language_info.model_used}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Processing Time</p>
                    <p className="text-sm font-semibold text-orange-600">
                      {analysisResult.analysis.processing_time?.toFixed(2)} seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Document Summary</h2>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 leading-relaxed">
                  {analysisResult.analysis.summary || 'No summary available'}
                </p>
              </div>
            </div>
          </div>

          {/* Identified Clauses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Identified Clauses</h2>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {(() => {
                    const finalClauses = processClauses(analysisResult.analysis.clauses);
                    return `${finalClauses.length} found`;
                  })()}
                </div>
              </div>
              
              {(() => {
                const finalClauses = processClauses(analysisResult.analysis.clauses);

                if (finalClauses.length === 0) {
                  return (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-base">No standard clauses identified in this document.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
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
          </div>

          {/* Clause Classification Summary */}
          {analysisResult.analysis.classification && Object.keys(analysisResult.analysis.classification).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Clause Classification Summary</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.analysis.classification || {}).map(([category, percentage]) => (
                    <div key={category} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Number(percentage).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {category.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Risk Assessment</h2>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {(analysisResult.analysis.risks || []).length} risks
                </div>
              </div>
              
              {(analysisResult.analysis.risks || []).length > 0 ? (
                <div className="space-y-3">
                  {(analysisResult.analysis.risks || []).map((risk, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-800">{risk}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-base">No risks identified in this document.</p>
                </div>
              )}
            </div>
          </div>

          {/* Export Analysis */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleExportAnalysis}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Analysis Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;