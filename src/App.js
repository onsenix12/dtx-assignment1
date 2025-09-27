import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simple text-based classification keywords
  const classificationKeywords = {
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
  };


  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setClassification(null);
      setError(null);
      
      // Only accept PDF files
      if (file.type === 'application/pdf') {
        setPreview('PDF_PREVIEW');
      } else {
        setError('Please upload a PDF file only');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setClassification(null);
      setError(null);
      setPreview('PDF_PREVIEW');
    } else {
      setError('Please upload a PDF file only');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Function to extract text from PDF
  const extractTextFromPdf = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          let fullText = '';
          
          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
          }
          
          resolve(fullText.trim());
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const classifyDocument = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      let documentText = '';
      
      // Handle PDF files by extracting text
      if (selectedFile.type === 'application/pdf') {
        try {
          documentText = await extractTextFromPdf(selectedFile);
          console.log('Extracted PDF text:', documentText);
        } catch (pdfError) {
          console.error('PDF text extraction error:', pdfError);
          setError('Failed to extract text from PDF. Please try with a different PDF or convert to image.');
          setLoading(false);
          return;
        }
      } else {
        // For image files, we'll use a simple heuristic approach
        // In a real application, you might want to use OCR here
        setError('Image files require OCR for text extraction. Please use PDF files for text-based classification.');
        setLoading(false);
        return;
      }
      
      // Classify based on extracted text
      const results = classifyByKeywords(documentText);
      setClassification(results);
      
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing the document.');
    } finally {
      setLoading(false);
    }
  };

  const classifyByKeywords = (text) => {
    const lowerText = text.toLowerCase();
    const scores = {
      'Invoice': 0,
      'Receipt': 0,
      'Delivery Order': 0
    };

    console.log('Extracted text for analysis:', text.substring(0, 200) + '...');
    console.log('Text length:', text.length);

    // Count keyword matches for each category
    Object.entries(classificationKeywords).forEach(([category, keywords]) => {
      let matchCount = 0;
      const foundKeywords = [];
      
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchCount++;
          foundKeywords.push(keyword);
        }
      });
      
      scores[category] = matchCount;
      console.log(`${category} matches:`, matchCount, 'Keywords found:', foundKeywords);
    });

    // Calculate total matches
    const totalMatches = Object.values(scores).reduce((sum, count) => sum + count, 0);
    console.log('Total keyword matches:', totalMatches);
    
    // If no matches found, try a more lenient approach
    if (totalMatches === 0) {
      console.log('No keywords found, using fallback analysis...');
      
      // Look for common business document indicators
      const businessIndicators = ['total', 'amount', 'date', 'number', 'company', 'address'];
      const businessMatches = businessIndicators.filter(indicator => 
        lowerText.includes(indicator.toLowerCase())
      ).length;
      
      if (businessMatches > 0) {
        // If it looks like a business document, give higher weight to Invoice
        return [
          { label: 'Invoice', score: 0.6 },
          { label: 'Receipt', score: 0.3 },
          { label: 'Delivery Order', score: 0.1 }
        ];
      } else {
        // If no business indicators, use default distribution
        return [
          { label: 'Invoice', score: 0.4 },
          { label: 'Receipt', score: 0.4 },
          { label: 'Delivery Order', score: 0.2 }
        ];
      }
    }

    // Convert to percentages and sort
    const results = Object.entries(scores).map(([label, count]) => ({
      label,
      score: Math.round((count / totalMatches) * 100) / 100
    })).sort((a, b) => b.score - a.score);

    console.log('Final classification results:', results);
    return results;
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreview(null);
    setClassification(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>📄 Invoice Document Classifier</h1>
          <p>Upload a PDF document to classify it as Invoice, Receipt, or Delivery Order</p>
          <div className="status-info">
            <span>✅ Ready to analyze documents</span>
          </div>
        </header>

        <div className="main-content">
          {!preview ? (
            <div 
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="upload-icon">📁</div>
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
              />
              <p className="upload-note">Supports: PDF files with extractable text</p>
              <p className="upload-note">📝 Works best with PDFs that contain text (not scanned images)</p>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                {preview === 'PDF_PREVIEW' ? (
                  <div className="pdf-preview">
                    <div className="pdf-icon">📄</div>
                    <p>{selectedFile?.name}</p>
                    <p className="pdf-note">PDF detected. For best results, please convert to image or take a screenshot first.</p>
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
                >
                  {loading ? '🔄 Classifying...' : '🔍 Classify Document'}
                </button>
                <button onClick={resetApp} className="reset-button">
                  📝 Upload New Document
                </button>
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {classification && (
                <div className="results">
                  <h3>📊 Classification Results</h3>
                  <div className="results-list">
                    {classification.map((result, index) => (
                      <div key={index} className={`result-item ${index === 0 ? 'top-result' : ''}`}>
                        <div className="result-label">
                          {result.label}
                          {index === 0 && <span className="badge">Best Match</span>}
                        </div>
                        <div className="result-score">
                          <div className="score-bar">
                            <div 
                              className="score-fill" 
                              style={{ width: `${result.score * 100}%` }}
                            ></div>
                          </div>
                          <span className="score-text">{Math.round(result.score * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
          <p>🤖 Powered by Text Analysis • Built for Digital Transformation Assignment</p>
        </footer>
      </div>
    </div>
  );
}

export default App;