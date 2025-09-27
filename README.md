# 📄 Invoice Document Classifier

A modern React application that automatically classifies PDF documents as **Invoice**, **Receipt**, or **Delivery Order** using intelligent text analysis and keyword matching.

![App Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![PDF.js](https://img.shields.io/badge/PDF.js-5.4.149-red)

## 🚀 Live Demo

Visit the live application: [Invoice Classifier](https://onsenix12.github.io/dtx-assignment1)

## ✨ Features

- **📁 Drag & Drop Interface**: Intuitive file upload with drag-and-drop support
- **🔍 Smart Classification**: Automatically categorizes documents using keyword analysis
- **📊 Visual Results**: Beautiful progress bars and confidence scores
- **📄 PDF Text Extraction**: Extracts text from PDF documents using PDF.js
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-time Processing**: Instant classification results

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

- **Frontend**: React 19.1.1
- **PDF Processing**: PDF.js 5.4.149
- **Styling**: Custom CSS with modern gradients and animations
- **Build Tool**: Create React App
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

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

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

### Classification Algorithm
1. **Keyword Matching**: Analyzes extracted text against predefined keyword lists
2. **Scoring System**: Counts keyword matches for each document type
3. **Confidence Calculation**: Converts match counts to percentage scores
4. **Fallback Analysis**: Uses business indicators when no keywords are found

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
- **Accessibility**: Clear labels, keyboard navigation, and screen reader support

## 🚀 Deployment

The application is automatically deployed to GitHub Pages:

- **Production URL**: https://onsenix12.github.io/dtx-assignment1
- **Build Command**: `npm run build`
- **Deploy Branch**: `gh-pages`

## 🔍 Limitations

- **PDF Text Only**: Works best with PDFs containing extractable text
- **No OCR Support**: Scanned images within PDFs may not be processed
- **Keyword-Based**: Relies on text content rather than document structure
- **English Language**: Optimized for English business documents

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
