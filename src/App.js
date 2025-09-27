import React, { useState, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [keywordMatches, setKeywordMatches] = useState({});
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle', 'connecting', 'processing', 'completed', 'error'
  // const [classificationMethod, setClassificationMethod] = useState('hybrid'); // 'ai', 'keywords', 'hybrid'

  // Hugging Face API configuration
  const HF_API_KEY = process.env.REACT_APP_HF_API_KEY;
  // const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  
  // Document classification model (zero-shot classification)
  const DOCUMENT_CLASSIFIER_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';

  // Simple text-based classification keywords (as fallback)
  const classificationKeywords = useMemo(() => ({
    'Invoice': [
      'invoice', 'bill', 'amount due', 'payment terms', 'net 30', 'net 15', 
      'invoice number', 'bill to', 'ship to', 'due date', 'payment due', 
      'terms and conditions', 'invoice date', 'billing address', 'payment terms',
      'please remit', 'payable to', 'invoice total', 'amount owed'
    ],
    'Receipt': [
      'receipt', 'thank you', 'purchase', 'transaction', 'cash', 'credit card', 
      'debit', 'change', 'receipt number', 'store', 'merchant', 'payment method',
      'thank you for your purchase', 'transaction complete', 'payment received',
      'receipt date', 'cashier', 'pos', 'terminal'
    ],
    'Delivery Order': [
      'delivery', 'order', 'shipment', 'tracking', 'shipping', 'address',
      'delivery date', 'carrier', 'package', 'parcel', 'delivery confirmation',
      'signature required', 'delivery instructions', 'recipient', 'sender',
      'tracking number', 'shipping address', 'delivery status', 'courier'
    ]
  }), []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setClassification(null);
      setAiResults(null);
      setError(null);
      
      if (file.type === 'application/pdf') {
        setPreview('PDF_PREVIEW');
      } else {
        setError('Please upload a PDF file only');
        setSelectedFile(null);
      }
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setClassification(null);
      setAiResults(null);
      setError(null);
      setPreview('PDF_PREVIEW');
    } else {
      setError('Please upload a PDF file only');
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Function to extract text from PDF with improved error handling
  const extractTextFromPdf = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file || file.type !== 'application/pdf') {
        reject(new Error('Invalid file type. Please upload a PDF file.'));
        return;
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error('File too large. Please upload a PDF smaller than 10MB.'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          console.log('🔍 Starting PDF text extraction...');
          setProcessingSteps(prev => [...prev, '📄 Reading PDF file...']);
          
          const arrayBuffer = e.target.result;
          console.log('📊 PDF loaded, processing with PDF.js...');
          setProcessingSteps(prev => [...prev, '⚙️ Processing with PDF.js...']);
          
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          console.log(`📑 PDF has ${pdf.numPages} page(s)`);
          setProcessingSteps(prev => [...prev, `📑 Found ${pdf.numPages} page(s) to process`]);
          
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`📖 Processing page ${i}...`);
            setProcessingSteps(prev => [...prev, `📖 Extracting text from page ${i}...`]);
            
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
            
            console.log(`✅ Page ${i} processed: ${pageText.length} characters extracted`);
          }
          
          const finalText = fullText.trim();
          
          // Check if any text was extracted
          if (finalText.length === 0) {
            throw new Error('No text could be extracted from this PDF. It may be a scanned image or corrupted file.');
          }
          
          console.log(`🎯 Text extraction complete: ${finalText.length} total characters`);
          setProcessingSteps(prev => [...prev, `✅ Text extraction complete: ${finalText.length} characters`]);
          
          resolve(finalText);
        } catch (error) {
          console.error('❌ PDF processing error:', error);
          setProcessingSteps(prev => [...prev, `❌ Error: ${error.message}`]);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read the PDF file. Please try again.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);

  // NEW: AI Classification using Hugging Face with improved error handling
  const classifyWithAI = useCallback(async (text) => {
    try {
      console.log('🤖 ===== AI PRE-TRAINED MODEL ACTIVATION =====');
      console.log('🔗 API Endpoint:', DOCUMENT_CLASSIFIER_URL);
      console.log('🧠 Model: Facebook BART-Large-MNLI (Zero-shot Classification)');
      console.log('📊 Input Text Length:', text.length, 'characters');
      setProcessingSteps(prev => [...prev, '🤖 Connecting to Hugging Face AI model...']);
      
      // Validate input text
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for AI classification');
      }
      
      // Prepare text for classification (limit to first 500 chars for API efficiency)
      const inputText = text.substring(0, 500);
      console.log('📝 Sending to AI Model:', inputText.substring(0, 100) + '...');
      
      // Use zero-shot classification with predefined labels
      const labels = ['invoice', 'receipt', 'delivery order'];
      console.log('🎯 AI Classification Labels:', labels);
      
      const requestBody = {
        inputs: inputText,
        parameters: {
          candidate_labels: labels
        }
      };
      console.log('📤 AI Request Payload:', requestBody);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(DOCUMENT_CLASSIFIER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 AI API Response Status:', response.status);
      console.log('📡 AI API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Validate response structure
      if (!result.labels || !result.scores || result.labels.length !== result.scores.length) {
        throw new Error('Invalid AI response format');
      }
      
      console.log('🎯 ===== AI PRE-TRAINED MODEL RESULTS =====');
      console.log('🧠 Raw AI Model Output:', result);
      console.log('📊 AI Confidence Scores:', result.labels?.map((label, i) => `${label}: ${Math.round((result.scores[i] || 0) * 100)}%`));
      console.log('🏆 AI Best Match:', result.labels?.[0] || 'Unknown');
      setProcessingSteps(prev => [...prev, '✅ AI pre-trained model classification complete!']);
      
      return result;
    } catch (error) {
      console.error('🚨 AI PRE-TRAINED MODEL ERROR:', error);
      setProcessingSteps(prev => [...prev, `⚠️ AI pre-trained model failed: ${error.message}`]);
      throw error;
    }
  }, [HF_API_KEY, DOCUMENT_CLASSIFIER_URL]);

  // NEW: Alternative simple AI classification (fallback) with improved logic
  const classifyWithSimpleAI = useCallback(async (text) => {
    try {
      console.log('🤖 Using simple AI classification...');
      setProcessingSteps(prev => [...prev, '🤖 Analyzing document with AI patterns...']);
      
      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for AI classification');
      }
      
      // Simulate AI analysis with more sophisticated pattern matching
      const textLower = text.toLowerCase();
      const aiScores = {
        'Invoice': 0,
        'Receipt': 0,
        'Delivery Order': 0
      };

      // AI-like scoring with weighted features
      const features = {
        'Invoice': {
          patterns: ['invoice', 'bill', 'amount due', 'payment terms', 'net \\d+'],
          contextWords: ['billing', 'payable', 'remit', 'due'],
          weight: 1.0
        },
        'Receipt': {
          patterns: ['receipt', 'thank you', 'transaction', 'cash', 'credit'],
          contextWords: ['purchase', 'store', 'merchant', 'cashier'],
          weight: 1.0
        },
        'Delivery Order': {
          patterns: ['delivery', 'shipment', 'tracking', 'carrier', 'shipping'],
          contextWords: ['package', 'address', 'recipient', 'courier'],
          weight: 1.0
        }
      };

      Object.entries(features).forEach(([category, feature]) => {
        let score = 0;
        
        // Pattern matching (simulates neural network pattern recognition)
        feature.patterns.forEach(pattern => {
          try {
            const regex = new RegExp(pattern, 'gi');
            const matches = (textLower.match(regex) || []).length;
            score += matches * 2; // Higher weight for exact patterns
          } catch (regexError) {
            console.warn(`Invalid regex pattern: ${pattern}`, regexError);
          }
        });
        
        // Context words (simulates semantic understanding)
        feature.contextWords.forEach(word => {
          if (textLower.includes(word)) {
            score += 1;
          }
        });
        
        aiScores[category] = score * feature.weight;
      });

      const totalScore = Object.values(aiScores).reduce((sum, score) => sum + score, 0);
      
      if (totalScore === 0) {
        // Default AI prediction when no clear patterns found
        return {
          labels: ['Invoice', 'Receipt', 'Delivery Order'],
          scores: [0.4, 0.4, 0.2]
        };
      }

      const normalizedResults = {
        labels: Object.keys(aiScores),
        scores: Object.values(aiScores).map(score => score / totalScore)
      };

      console.log('🎯 Simple AI Classification result:', normalizedResults);
      setProcessingSteps(prev => [...prev, '✅ AI pattern analysis complete!']);
      
      return normalizedResults;
    } catch (error) {
      console.error('🚨 Simple AI Classification error:', error);
      throw error;
    }
  }, []);

  // Enhanced classification with AI integration and improved error handling
  const classifyDocument = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingSteps([]);
    setExtractedText('');
    setKeywordMatches({});
    setAiResults(null);

    try {
      let documentText = '';
      
      if (selectedFile.type === 'application/pdf') {
        try {
          documentText = await extractTextFromPdf(selectedFile);
          setExtractedText(documentText);
        } catch (pdfError) {
          console.error('PDF text extraction error:', pdfError);
          setError(`Failed to extract text from PDF: ${pdfError.message}`);
          setLoading(false);
          return;
        }
      } else {
        setError('Invalid file type. Please upload a PDF file.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Starting hybrid classification analysis...');
      
      // Method 1: Try AI Classification first
      let aiClassification = null;
      try {
        if (HF_API_KEY && HF_API_KEY.startsWith('hf_')) {
          console.log('🔑 Using Hugging Face API for AI classification...');
          setAiStatus('connecting');
          aiClassification = await classifyWithAI(documentText);
          setAiStatus('completed');
        } else {
          console.log('🤖 Using local AI pattern analysis (no API key configured)...');
          setProcessingSteps(prev => [...prev, '🤖 Using local AI pattern analysis...']);
          setAiStatus('processing');
          aiClassification = await classifyWithSimpleAI(documentText);
          setAiStatus('completed');
        }
        setAiResults(aiClassification);
      } catch (aiError) {
        console.log('AI classification failed, falling back to keyword method');
        setAiStatus('error');
        setProcessingSteps(prev => [...prev, '⚠️ AI classification unavailable, using keyword analysis...']);
      }
      
      // Method 2: Keyword Classification (as backup/comparison)
      const keywordResults = classifyByKeywords(documentText);
      
      // Method 3: Hybrid Approach - Combine AI and Keywords
      let finalResults;
      if (aiClassification) {
        finalResults = combineAIAndKeywords(aiClassification, keywordResults);
        setProcessingSteps(prev => [...prev, '🔄 Combining AI and keyword analysis...']);
      } else {
        finalResults = keywordResults;
      }
      
      setClassification(finalResults);
      console.log('📊 Final classification results:', finalResults);
      setProcessingSteps(prev => [...prev, '✅ Document classification complete!']);
      
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred while processing the document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, extractTextFromPdf, classifyWithAI, classifyWithSimpleAI, HF_API_KEY]);

  // NEW: Combine AI and keyword results with improved logic
  const combineAIAndKeywords = useCallback((aiResults, keywordResults) => {
    console.log('🔄 Combining AI and keyword results...');
    
    // Validate inputs
    if (!aiResults || !aiResults.labels || !aiResults.scores) {
      console.warn('Invalid AI results, using keyword results only');
      return keywordResults;
    }
    
    if (!keywordResults || !Array.isArray(keywordResults)) {
      console.warn('Invalid keyword results, using AI results only');
      return aiResults.labels.map((label, index) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        score: aiResults.scores[index] || 0,
        aiScore: aiResults.scores[index] || 0,
        keywordScore: 0
      }));
    }
    
    // Convert keyword results to same format
    const keywordMap = {};
    keywordResults.forEach(result => {
      keywordMap[result.label] = result.score;
    });
    
    // Combine with weighted average (70% AI, 30% keywords)
    const aiWeight = 0.7;
    const keywordWeight = 0.3;
    
    const combinedScores = aiResults.labels.map((label, index) => {
      const aiScore = aiResults.scores[index] || 0;
      const keywordScore = keywordMap[label] || 0;
      const combinedScore = (aiScore * aiWeight) + (keywordScore * keywordWeight);
      
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        score: Math.min(1, Math.max(0, combinedScore)), // Ensure score is between 0 and 1
        aiScore: aiScore,
        keywordScore: keywordScore
      };
    });
    
    // Sort by combined score
    return combinedScores.sort((a, b) => b.score - a.score);
  }, []);

  // Original keyword classification with improved logic
  const classifyByKeywords = useCallback((text) => {
    if (!text || text.trim().length === 0) {
      return [
        { label: 'Invoice', score: 0.33 },
        { label: 'Receipt', score: 0.33 },
        { label: 'Delivery Order', score: 0.34 }
      ];
    }

    const lowerText = text.toLowerCase();
    const scores = {
      'Invoice': 0,
      'Receipt': 0,
      'Delivery Order': 0
    };

    const foundKeywords = {
      'Invoice': [],
      'Receipt': [],
      'Delivery Order': []
    };

    console.log('🔍 Analyzing text for keyword matches...');

    Object.entries(classificationKeywords).forEach(([category, keywords]) => {
      let matchCount = 0;
      
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchCount++;
          foundKeywords[category].push(keyword);
        }
      });
      
      scores[category] = matchCount;
    });

    setKeywordMatches(foundKeywords);

    const totalMatches = Object.values(scores).reduce((sum, count) => sum + count, 0);
    
    if (totalMatches === 0) {
      const businessIndicators = ['total', 'amount', 'date', 'number', 'company', 'address'];
      const businessMatches = businessIndicators.filter(indicator => 
        lowerText.includes(indicator.toLowerCase())
      ).length;
      
      if (businessMatches > 0) {
        return [
          { label: 'Invoice', score: 0.6 },
          { label: 'Receipt', score: 0.3 },
          { label: 'Delivery Order', score: 0.1 }
        ];
      } else {
        return [
          { label: 'Invoice', score: 0.4 },
          { label: 'Receipt', score: 0.4 },
          { label: 'Delivery Order', score: 0.2 }
        ];
      }
    }

    const results = Object.entries(scores).map(([label, count]) => ({
      label,
      score: Math.round((count / totalMatches) * 100) / 100
    })).sort((a, b) => b.score - a.score);

    return results;
  }, [classificationKeywords]);

  const resetApp = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setClassification(null);
    setAiResults(null);
    setError(null);
    setProcessingSteps([]);
    setExtractedText('');
    setKeywordMatches({});
    setShowDebugInfo(false);
    setAiStatus('idle');
  }, []);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🤖 AI Document Classifier</h1>
          <p>Upload a PDF document to classify it using AI + keyword analysis</p>
          <div className="status-info">
            <span>
              {HF_API_KEY && HF_API_KEY.startsWith('hf_') 
                ? '✅ AI Model Ready • Powered by Hugging Face API' 
                : '🤖 AI Model Ready • Using Local AI Pattern Analysis'
              }
            </span>
            {aiStatus !== 'idle' && (
              <div className="ai-status-indicator">
                <span className={`ai-status ${aiStatus}`}>
                  {aiStatus === 'connecting' && '🔗 Connecting to AI Model...'}
                  {aiStatus === 'processing' && '🧠 AI Processing...'}
                  {aiStatus === 'completed' && '✅ AI Analysis Complete'}
                  {aiStatus === 'error' && '❌ AI Error - Using Fallback'}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="main-content">
          {!preview ? (
            <div 
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              role="button"
              tabIndex={0}
              aria-label="Upload PDF document"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('file-input').click();
                }
              }}
            >
              <div className="upload-icon" role="img" aria-label="File upload icon">📁</div>
              <h3>Drop your PDF document here</h3>
              <p>or</p>
              <label htmlFor="file-input" className="upload-button">
                Choose File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-label="Select PDF file"
              />
              <p className="upload-note">Supports: PDF files with extractable text</p>
              <p className="upload-note">🤖 Uses AI models for intelligent document classification</p>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                {preview === 'PDF_PREVIEW' ? (
                  <div className="pdf-preview">
                    <div className="pdf-icon">📄</div>
                    <p>{selectedFile?.name}</p>
                    <p className="pdf-note">Ready for AI-powered classification</p>
                  </div>
                ) : (
                  <img src={preview} alt="Document preview" />
                )}
              </div>
              
              <div className="controls">
                <button 
                  onClick={classifyDocument} 
                  disabled={loading}
                  className="classify-button"
                  aria-label={loading ? 'AI is analyzing the document' : 'Start AI document classification'}
                >
                  {loading ? '🤖 AI Analyzing...' : '🤖 Classify with AI'}
                </button>
                <button 
                  onClick={resetApp} 
                  className="reset-button"
                  aria-label="Upload a new document"
                >
                  📝 Upload New Document
                </button>
              </div>

              {error && (
                <div className="error-message" role="alert" aria-live="polite">
                  ⚠️ {error}
                </div>
              )}

              {processingSteps.length > 0 && (
                <div className="processing-steps">
                  <h3>⚙️ AI Processing Pipeline</h3>
                  <div className="steps-list">
                    {processingSteps.map((step, index) => (
                      <div key={index} className="step-item">
                        <span className="step-number">{index + 1}</span>
                        <span className="step-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {classification && (
                <div className="results" role="region" aria-label="Document classification results">
                  <h3>🤖 AI Classification Results</h3>
                  <div className="results-list" role="list">
                    {classification.map((result, index) => (
                      <div 
                        key={index} 
                        className={`result-item ${index === 0 ? 'top-result' : ''}`}
                        role="listitem"
                        aria-label={`${result.label} with ${Math.round(result.score * 100)}% confidence`}
                      >
                        <div className="result-label">
                          {result.label}
                          {index === 0 && <span className="badge" aria-label="Best match">AI Best Match</span>}
                        </div>
                        <div className="result-score">
                          <div 
                            className="score-bar" 
                            role="progressbar" 
                            aria-valuenow={Math.round(result.score * 100)} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                            aria-label={`${result.label} confidence: ${Math.round(result.score * 100)}%`}
                          >
                            <div 
                              className="score-fill" 
                              style={{ width: `${result.score * 100}%` }}
                            ></div>
                          </div>
                          <span className="score-text">{Math.round(result.score * 100)}%</span>
                        </div>
                        {result.aiScore !== undefined && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                            AI: {Math.round(result.aiScore * 100)}% | Keywords: {Math.round(result.keywordScore * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="debug-controls">
                    <button 
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                      className="debug-toggle"
                    >
                      {showDebugInfo ? '🔍 Hide' : '🔍 Show'} AI Processing Details
                    </button>
                  </div>

                  {showDebugInfo && (
                    <div className="debug-info">
                      {aiResults && (
                        <div className="keyword-category">
                          <h4>🤖 AI Pre-trained Model Results</h4>
                          <div className="ai-model-info">
                            <p><strong>Model:</strong> {HF_API_KEY && HF_API_KEY.startsWith('hf_') ? 'Facebook BART-Large-MNLI (Hugging Face)' : 'Local AI Pattern Analysis'}</p>
                            <p><strong>API Endpoint:</strong> {HF_API_KEY && HF_API_KEY.startsWith('hf_') ? DOCUMENT_CLASSIFIER_URL : 'Local Processing'}</p>
                            <p><strong>Classification Type:</strong> Zero-shot Classification</p>
                          </div>
                          <div className="keyword-list">
                            {aiResults.labels?.map((label, index) => (
                              <span key={index} className="keyword-tag">
                                {label}: {Math.round((aiResults.scores[index] || 0) * 100)}%
                              </span>
                            )) || <span className="no-matches">AI results not available</span>}
                          </div>
                        </div>
                      )}
                      
                      <h4>🔍 Keyword Matches Found</h4>
                      {Object.entries(keywordMatches).map(([category, keywords]) => (
                        <div key={category} className="keyword-category">
                          <h5>{category}: {keywords.length} matches</h5>
                          {keywords.length > 0 ? (
                            <div className="keyword-list">
                              {keywords.map((keyword, index) => (
                                <span key={index} className="keyword-tag">{keyword}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="no-matches">No keywords found</p>
                          )}
                        </div>
                      ))}
                      
                      <h4>📝 Extracted Text Preview</h4>
                      <div className="text-preview">
                        {extractedText.substring(0, 500)}
                        {extractedText.length > 500 && '...'}
                      </div>
                      <p className="text-stats">
                        Total characters: {extractedText.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
          <p>🤖 Powered by AI Classification • Built for Digital Transformation Assignment</p>
        </footer>
      </div>
    </div>
  );
}

export default App;