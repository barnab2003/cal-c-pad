import React, { useRef, useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import './MathCanvas.css';

const MathCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // New State for Drawing Tools
  const [tool, setTool] = useState('pen'); // 'pen', 'line', 'rect', 'circle'
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 500; // Big, spacious drawing pad
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1A1B26'; // Dark background for the canvas to match theme
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3EE08F'; // Neon mint ink
    ctx.lineWidth = 3;

    const handleResize = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
        
        canvas.width = canvas.parentElement.clientWidth;
        ctx.fillStyle = '#1A1B26';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#3EE08F';
        ctx.lineWidth = 3;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startInteraction = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);
    // Take a snapshot of the canvas before drawing the new shape
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawInteraction = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // If drawing a shape, restore the snapshot first to clear the preview
    if (tool !== 'pen' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
    }

    if (tool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.rect(startX, startY, x - startX, y - startY);
      ctx.stroke();
    } else if (tool === 'circle') {
      ctx.beginPath();
      const radius = Math.sqrt(Math.pow(startX - x, 2) + Math.pow(startY - y, 2));
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const stopInteraction = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1A1B26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult('');
  };

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
        setResult("\\text{Error: " + (data.error || "Unknown server error") + "}");
      }
    } catch (error) {
      setResult("\\text{Error: Could not connect to the server.}");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-theme-wrapper">
      
      {/* HEADER SECTION */}
      <header className="glass-header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <h1 className="logo-text">CAL-C-PAD</h1>
        </div>
        <nav className="glass-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how">How it Works</a>
        </nav>
        <button className="btn-outline">Log in</button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <div className="hero-text">
          <h2>Make your complex math<br/>make complete sense</h2>
          <p>Draw equations, geometry, or physics diagrams instantly. Our AI engine dives into fully connected details to understand what drives your problem.</p>
        </div>

        <div className="app-container glass-card">
          
          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="tool-group">
              <button className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')}>✎ Pen</button>
              <button className={`tool-btn ${tool === 'line' ? 'active' : ''}`} onClick={() => setTool('line')}>— Line</button>
              <button className={`tool-btn ${tool === 'rect' ? 'active' : ''}`} onClick={() => setTool('rect')}>▭ Rect</button>
              <button className={`tool-btn ${tool === 'circle' ? 'active' : ''}`} onClick={() => setTool('circle')}>◯ Circle</button>
            </div>
            <div className="action-group">
              <button onClick={clearCanvas} className="btn-text">Clear</button>
              <button onClick={calculateMath} disabled={isLoading} className="btn-primary">
                {isLoading ? 'Solving...' : 'Calculate Now'}
              </button>
            </div>
          </div>

          {/* CANVAS */}
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={startInteraction}
              onMouseMove={drawInteraction}
              onMouseUp={stopInteraction}
              onMouseLeave={stopInteraction}
              onTouchStart={startInteraction}
              onTouchMove={drawInteraction}
              onTouchEnd={stopInteraction}
              onTouchCancel={stopInteraction}
            />
          </div>

          {/* RESULT */}
          {result && (
            <div className="result-glass">
              <BlockMath math={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MathCanvas;