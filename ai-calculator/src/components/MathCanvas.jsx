import React, { useRef, useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './MathCanvas.css';

const MathCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set a responsive internal resolution
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400; 
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    // Handle window resize to keep canvas size accurate
    const handleResize = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
        
        canvas.width = canvas.parentElement.clientWidth;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- MOUSE & TOUCH EVENTS ---
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const getTouchPos = (canvas, touchEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  };

  const startTouchDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const { x, y } = getTouchPos(canvas, e.nativeEvent);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const { x, y } = getTouchPos(canvas, e.nativeEvent);
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopTouchDrawing = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  // --- CLEAR FUNCTION ---
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult('');
  };

  // --- CAPTURE AND SEND ---
  const calculateMath = async () => {
    const canvas = canvasRef.current;
    const base64Image = canvas.toDataURL('image/png');
    
    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('https://ai-i-pad-style-calculator.onrender.com/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.result);
      } else {
        setResult("Error: " + (data.error || "Unknown server error"));
      }
    } catch (error) {
      console.error("Failed to connect to server:", error);
      setResult("Error: Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      
      {/* HEADER SECTION */}
      <header className="neo-header">
        <div className="logo-container">
          <h1 className="logo-text">CAL-C-PAD</h1>
        </div>
        <nav className="neo-nav">
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#contacts" className="nav-link">Contacts</a>
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-layout">
        
        {/* LEFT PANEL: Hero & Info */}
        <section className="hero-section">
            <h2 className="hero-title">Handwritten<br/>Math Solver</h2>
            <p className="hero-subtitle">Draw your complex equations on the canvas and let our AI engine compute the exact result in seconds.</p>
            
            <div className="stats-badge neo-box">
              <span className="badge-highlight">100%</span> Accurate
            </div>
        </section>

        {/* RIGHT PANEL: Interactive App */}
        <section className="interaction-section">
          
          <div className="canvas-container neo-box">
            <div className="canvas-header">
                <span>Draw here:</span>
            </div>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startTouchDrawing}
              onTouchMove={drawTouch}
              onTouchEnd={stopTouchDrawing}
              onTouchCancel={stopTouchDrawing}
              style={{ cursor: 'crosshair', touchAction: 'none' }} 
            />
          </div>

          <div className="controls-bar">
            <button onClick={clearCanvas} className="neo-btn btn-clear">
              Clear Canvas
            </button>
            <button onClick={calculateMath} disabled={isLoading} className="neo-btn btn-solve">
              {isLoading ? 'Calculating...' : 'Solve Equation'}
            </button>
          </div>

          {result && (
            <div className="result-container neo-box">
              <BlockMath math={result.replace(/\$/g, '')} />
            </div>
          )}

        </section>
      </main>

      {/* FOOTER SECTION */}
      <footer className="neo-footer">
        <p>&copy; {new Date().getFullYear()} CAL-C-PAD. Built for the modern web.</p>
      </footer>

    </div>
  );
};

export default MathCanvas;