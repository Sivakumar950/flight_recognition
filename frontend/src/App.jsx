import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

// Reads from frontend/.env → VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || '/predict'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.')
      return
    }
    setSelectedFile(file)
    setError(null)
    setResult(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }, [])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1]
        try {
          const response = await axios.post(API_URL, { image: base64 }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
          })
          setResult(response.data)
        } catch (err) {
          if (err.code === 'ECONNABORTED') {
            setError('Request timed out. Please try again.')
          } else if (err.response) {
            setError(`Server error: ${err.response.status}`)
          } else {
            setError('Network error. Check your connection and API URL.')
          }
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError('Failed to process image.')
      setLoading(false)
    }
  }

  const resetState = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getConfidenceColor = (confidence) => {
    const val = parseFloat(confidence)
    if (val >= 80) return '#00e676'
    if (val >= 50) return '#ffab00'
    return '#ff5252'
  }

  const getConfidenceLabel = (confidence) => {
    const val = parseFloat(confidence)
    if (val >= 80) return 'High'
    if (val >= 50) return 'Medium'
    return 'Low'
  }

  return (
    <div className="app">
      {/* Animated background */}
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L28 14L24 16L16 28L8 16L4 14L16 4Z" fill="url(#grad)" />
                <path d="M16 4L28 14L16 12L4 14L16 4Z" fill="rgba(255,255,255,0.3)" />
                <defs>
                  <linearGradient id="grad" x1="4" y1="4" x2="28" y2="28">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">FlightRec</span>
          </div>
          <p className="tagline">AI-Powered Aircraft Recognition</p>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="container">
          {/* Hero Text */}
          <div className="hero">
            <h1 className="hero-title">
              Identify Any Aircraft<br />
              <span className="hero-gradient">In Seconds</span>
            </h1>
            <p className="hero-sub">
              Upload an image and our AI will identify the aircraft type, airline, and provide a confidence score.
            </p>
          </div>

          {/* Upload Card */}
          <div className="card upload-card">
            <div
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="drop-zone"
            >
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Aircraft preview" className="preview-img" />
                  <div className="preview-overlay">
                    <span>Click or drop to replace</span>
                  </div>
                </div>
              ) : (
                <div className="drop-content">
                  <div className="drop-icon">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 8V32M24 8L16 16M24 8L32 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 28V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="drop-title">Drop your aircraft image here</p>
                  <p className="drop-sub">or click to browse · PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
              />
            </div>

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                id="analyze-btn"
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Analyze Aircraft
                  </>
                )}
              </button>
              {selectedFile && (
                <button className="btn btn-ghost" onClick={resetState} id="reset-btn">
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="card error-card" id="error-card">
              <div className="error-icon">⚠</div>
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="card results-card" id="results-card">
              <h2 className="results-title">
                <svg viewBox="0 0 20 20" fill="currentColor" className="results-icon">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Identification Results
              </h2>
              <div className="results-grid">
                <div className="result-item">
                  <span className="result-label">Aircraft Type</span>
                  <span className="result-value">{result.aircraft_type || 'Unknown'}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Airline</span>
                  <span className="result-value">{result.airline || 'Unknown'}</span>
                </div>
                <div className="result-item result-confidence">
                  <span className="result-label">Confidence</span>
                  <div className="confidence-display">
                    <div className="confidence-bar-bg">
                      <div
                        className="confidence-bar-fill"
                        style={{
                          width: `${parseFloat(result.confidence) || 0}%`,
                          background: getConfidenceColor(result.confidence),
                        }}
                      />
                    </div>
                    <span
                      className="confidence-value"
                      style={{ color: getConfidenceColor(result.confidence) }}
                    >
                      {result.confidence}%
                      <span className="confidence-label">
                        {getConfidenceLabel(result.confidence)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History hint */}
          {result && (
            <p className="history-hint">
              Result has been saved to your prediction history.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>FlightRec &copy; {new Date().getFullYear()} &middot; Powered by Amazon Bedrock</p>
      </footer>
    </div>
  )
}

export default App
