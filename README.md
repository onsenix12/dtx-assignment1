# 📄 Invoice Document Classifier

A modern React application that automatically classifies PDF documents as **Invoice**, **Receipt**, or **Delivery Order** using intelligent text analysis and keyword matching.

![App Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![PDF.js](https://img.shields.io/badge/PDF.js-5.4.149-red)

## 🚀 Live Demo

Visit the live application: [Invoice Classifier](https://onsenix12.github.io/dtx-assignment1)

## ✨ Features

- **📁 Drag & Drop Interface**: Intuitive file upload with drag-and-drop support
- **🤖 AI-Powered Classification**: Uses Hugging Face BART model for zero-shot classification
- **🔄 Hybrid AI Approach**: Combines AI results (70%) with keyword analysis (30%)
- **📊 Visual Results**: Beautiful progress bars and confidence scores
- **📄 PDF Text Extraction**: Extracts text from PDF documents using PDF.js
- **🛡️ Enhanced Security**: File processing happens entirely client-side
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-time Processing**: Instant classification with detailed processing pipeline
- **🔍 Debug Mode**: Advanced debugging information for AI analysis

## 🎯 Supported Document Types

The classifier can identify three types of business documents:

### 📋 Invoice
- Keywords: "invoice", "bill", "amount due", "payment terms", "net 30", "invoice number", etc.
- Common business billing documents

### 🧾 Receipt  
- Keywords: "receipt", "thank you", "purchase", "transaction", "cash", "credit card", etc.
- Purchase confirmations and payment receipts

### 📦 Delivery Order
- Keywords: "delivery", "order", "shipment", "tracking", "shipping", "carrier", etc.
- Shipping and delivery documentation

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1 with Hooks optimization
- **PDF Processing**: PDF.js 5.4.149 with enhanced error handling
- **AI Classification**: Hugging Face BART model (zero-shot classification)
- **AI Fallback**: Local pattern analysis with weighted features
- **Performance**: useCallback, useMemo for optimized rendering
- **Security**: Client-side processing with file validation
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Styling**: Custom CSS with modern gradients and animations
- **Build Tool**: Create React App
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- (Optional) Hugging Face API key for enhanced AI classification

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/onsenix12/dtx-assignment1.git
   cd dtx-assignment1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AI API (Optional but Recommended)**
   
   For enhanced AI classification using Hugging Face models:
   
   a. Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)
   
   b. Create a `.env` file in the project root:
   ```bash
   # Create .env file
   echo "REACT_APP_HF_API_KEY=your_huggingface_api_key_here" > .env
   ```
   
   c. Replace `your_huggingface_api_key_here` with your actual API key (starts with `hf_`)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🤖 AI Configuration

The application uses a **hybrid AI approach**:

- **With API Key**: Uses Hugging Face's BART model for zero-shot classification
- **Without API Key**: Uses sophisticated local AI pattern analysis
- **Always**: Combines AI results with keyword analysis for best accuracy

## 📖 How to Use

1. **Upload a Document**
   - Drag and drop a PDF file onto the upload area, or
   - Click "Choose File" to browse and select a PDF

2. **Classify the Document**
   - Click the "🔍 Classify Document" button
   - The app will extract text from the PDF and analyze it

3. **View Results**
   - See classification results with confidence scores
   - The best match is highlighted with a "Best Match" badge
   - Results are displayed as progress bars with percentages

4. **Upload Another Document**
   - Click "📝 Upload New Document" to start over

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode |
| `npm test` | Launches the test runner |
| `npm run build` | Builds the app for production |
| `npm run eject` | Ejects from Create React App (one-way operation) |

## 🏗️ Project Structure

```
dtx-assignment1/
├── public/
│   ├── pdf.worker.min.js    # PDF.js worker for text extraction
│   └── index.html
├── src/
│   ├── App.js               # Main application component
│   ├── App.css              # Application styles
│   └── index.js             # Application entry point
├── package.json
└── README.md
```

## 🧠 How It Works

### Text Extraction
- Uses PDF.js to extract text content from PDF documents
- Processes all pages of multi-page documents
- Handles text-based PDFs (not scanned images)
- **Enhanced Security**: File size validation (10MB limit) and type checking
- **Error Handling**: Graceful fallback for corrupted or image-based PDFs

### AI-Powered Classification Algorithm
1. **🤖 AI Analysis**: 
   - **With API**: Uses Hugging Face BART model for zero-shot classification
   - **Without API**: Uses sophisticated local AI pattern analysis with weighted features
   - **Timeout Protection**: 30-second timeout to prevent hanging requests
2. **🔍 Keyword Matching**: Analyzes extracted text against predefined keyword lists
3. **🔄 Hybrid Approach**: Combines AI results (70%) with keyword analysis (30%)
4. **📊 Confidence Scoring**: Converts AI and keyword scores to percentage confidence
5. **🛡️ Fallback System**: Uses business indicators when no clear patterns are found
6. **⚡ Performance**: Optimized with React hooks for better rendering performance

### Classification Keywords

The system uses comprehensive keyword lists for each document type:

- **Invoice**: 20+ keywords including billing terms, payment conditions
- **Receipt**: 15+ keywords including transaction terms, payment methods  
- **Delivery Order**: 15+ keywords including shipping terms, tracking info

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with gradient backgrounds
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Visual Feedback**: Progress bars, badges, and color-coded results
- **Responsive Layout**: Optimized for all screen sizes
- **Enhanced Accessibility**: 
  - ARIA labels and roles for screen readers
  - Full keyboard navigation support
  - Progress bar accessibility with proper values
  - Alert regions for dynamic content updates
- **Debug Information**: Toggle-able detailed AI processing information
- **Status Indicators**: Real-time AI processing status with visual feedback

## 🚀 Deployment

The application is automatically deployed to GitHub Pages:

- **Production URL**: https://onsenix12.github.io/dtx-assignment1
- **Build Command**: `npm run build`
- **Deploy Branch**: `gh-pages`

## 🔍 Limitations

- **PDF Text Only**: Works best with PDFs containing extractable text
- **No OCR Support**: Scanned images within PDFs may not be processed
- **File Size Limit**: Maximum 10MB file size for processing
- **Text Extraction**: Requires PDFs with extractable text (not scanned images)
- **English Language**: Optimized for English business documents
- **Internet Required**: Hugging Face API requires internet connection (fallback available)

## 🔒 Security & Privacy

- **Client-Side Processing**: PDF files never leave your browser
- **Local Text Extraction**: All PDF processing happens locally using PDF.js
- **Minimal Data Transmission**: Only extracted text snippets (500 chars) sent to AI API
- **No File Storage**: Documents are not saved or stored anywhere
- **Privacy Mode**: Can operate entirely offline with local AI analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of a Digital Transformation assignment and is for educational purposes.

## 👨‍💻 Author

**Onsenix12**
- GitHub: [@onsenix12](https://github.com/onsenix12)
- Project: Digital Transformation Assignment 1

## 🙏 Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- PDF processing powered by [PDF.js](https://mozilla.github.io/pdf.js/)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

**Built for Digital Transformation Assignment • Powered by Text Analysis** 🤖

<!-- Deployment trigger: $(date) -->
