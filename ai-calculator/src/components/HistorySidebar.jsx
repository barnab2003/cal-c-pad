import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BlockMath } from 'react-katex';
import './HistorySidebar.css';

const HistorySidebar = ({ isOpen, onClose }) => {
  const { token, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch history if the sidebar is open and the user is logged in
    if (isOpen && isAuthenticated) {
      fetchHistory();
    }
  }, [isOpen, isAuthenticated]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://ai-i-pad-style-calculator.onrender.com/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Background Dimmer */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      
      {/* The Sidebar */}
      <div className={`glass-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Your Saved Math</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="sidebar-content">
          {!isAuthenticated ? (
            <p className="empty-state">Please log in to see your history.</p>
          ) : isLoading ? (
            <p className="empty-state">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="empty-state">No calculations saved yet. Start drawing!</p>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-card">
                  <div className="history-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div className="history-math">
                    <BlockMath math={item.latexResult} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;