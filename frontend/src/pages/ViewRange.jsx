import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

function ViewRange() {
  const { rangeId } = useParams();
  const [range, setRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const positionMap = {
    'UTG': 0,
    'MP': 1,
    'CO': 2,
    'BTN': 3,
    'SB': 4,
    'BB': 5,
  };

  const positionLabels = Object.keys(positionMap);
  
  const matrixIndexToHand = (row, col) => {
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const r1 = ranks[row];
    const r2 = ranks[col];
    if (row === col) return `${r1}${r2}`;
    return row < col ? `${r1}${r2}s` : `${r2}${r1}o`; // suited or offsuit
  };
  const getCellStyle = (cell) => {
    const { call, fold, raise } = cell;
    
    return {
      background: `linear-gradient(to right, 
        blue 0%, 
        blue ${call}%, 
        red ${call}%, 
        red ${call + fold}%, 
        green ${call + fold}%, 
        green 100%)`,
      height: '40px',
      width: '40px',
      cursor: 'pointer',
      border: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      fontWeight: 'bold',
      textShadow: '1px 1px 1px rgba(0,0,0,0.7)'
    };
  };


  useEffect(() => {
    const fetchRangeData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/range/${rangeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRange(res.data);
      } catch (err) {
        console.error('Error fetching range data:', err);
        setError('Failed to load range data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (rangeId) {
      fetchRangeData();
    }
  }, [rangeId, token]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Back to Ranges
        </button>
      </div>
    );
  }

  if (!range) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Range not found
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Back to Ranges
        </button>
      </div>
    );
  }
  return (
    <div className="mt-6">
    <h2 className="text-xl font-semibold mb-3">Action Chart</h2>
    <div className="overflow-x-auto">
      <div className="flex mb-1">
        <div className="w-10 h-10"></div>
        {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].map((rank, index) => (
          <div 
            key={index} 
            className="w-10 h-10 flex items-center justify-center font-bold bg-gray-200"
          >
            {rank}
          </div>
        ))}
      </div>
      
      {range.action_chart.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          <div className="w-10 h-10 flex items-center justify-center font-bold bg-gray-200">
            {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'][rowIndex]}
          </div>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              style={getCellStyle(cell)}
              title={`${matrixIndexToHand(rowIndex, colIndex)}: Call ${cell.call}%, Fold ${cell.fold}%, Raise ${cell.raise}%`}
            >
              {matrixIndexToHand(rowIndex, colIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
  )

 
}

export default ViewRange;