import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PreviousActionsSection = ({ position, prevActions, setPrevActions, positionLabels }) => {
    // State for custom raise amounts
    const [customRaises, setCustomRaises] = useState(Array(position).fill(''));
    
    // Calculate the available actions for each position based on previous actions
    const getLastBetAmount = (index) => {
      // Find the most recent raise amount
      let lastRaiseAmount = 1; // Default is the big blind (1BB)
      
      for (let i = 0; i < index; i++) {
        if (prevActions[i] > 1) { // If it's a raise
          lastRaiseAmount = prevActions[i];
        }
      }
      
      return lastRaiseAmount;
    };
  
    const handleActionTypeChange = (index, actionType) => {
      const newPrevActions = [...prevActions];
      
      if (actionType === 'fold') {
        newPrevActions[index] = 0;
      } else if (actionType === 'call') {
        const callAmount = getLastBetAmount(index);
        newPrevActions[index] = callAmount;
      } else if (actionType === 'raise') {
        // When switching to raise, set a default raise value
        const minRaise = getLastBetAmount(index) * 2;
        newPrevActions[index] = minRaise;
        
        // Update custom raise input field
        const newCustomRaises = [...customRaises];
        newCustomRaises[index] = minRaise.toString();
        setCustomRaises(newCustomRaises);
      }
      
      // Reset actions of all subsequent positions
      if (index < position - 1) {
        for (let i = index + 1; i < position; i++) {
          newPrevActions[i] = 0; // Reset to fold as default
          
          // Also reset their custom raise amounts
          const newCustoms = [...customRaises];
          newCustoms[i] = '';
          setCustomRaises(newCustoms);
        }
      }
      
      setPrevActions(newPrevActions);
    };
  
    const handleCustomRaiseChange = (index, value) => {
      // Update the custom raise input
      const newCustomRaises = [...customRaises];
      newCustomRaises[index] = value;
      setCustomRaises(newCustomRaises);
      
      // Only update the actual action if the value is valid
      if (value.trim() !== '' && !isNaN(parseFloat(value))) {
        const raiseAmount = parseFloat(value);
        const minRaiseAmount = getLastBetAmount(index) * 2;
        
        // In poker, a raise must be at least double the previous bet
        if (raiseAmount >= minRaiseAmount) {
          const newPrevActions = [...prevActions];
          newPrevActions[index] = raiseAmount;
          setPrevActions(newPrevActions);
          
          // Reset actions of all subsequent positions
          if (index < position - 1) {
            for (let i = index + 1; i < position; i++) {
              newPrevActions[i] = 0; // Reset to fold
            }
            setPrevActions(newPrevActions);
          }
        }
      }
    };
  
    // This effect ensures prevActions is always the right length
    useEffect(() => {
      if (prevActions.length !== position) {
        setPrevActions(Array(position).fill(0));
        setCustomRaises(Array(position).fill(''));
      }
    }, [position, prevActions.length, setPrevActions]);
  
    // Determine action type from the prevActions value
    const getActionType = (value, index) => {
      if (value === 0) return 'fold';
      if (value === getLastBetAmount(index)) return 'call';
      return 'raise';
    };
  
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Previous Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: position }).map((_, index) => {
            const lastBetAmount = getLastBetAmount(index);
            const actionType = getActionType(prevActions[index], index);
            const minRaiseAmount = lastBetAmount * 2;
            
            return (
              <div key={index} className="border p-4 rounded shadow-sm">
                <div className="font-medium text-lg mb-2">
                  {positionLabels[index]} Action
                </div>
                
                {index > 0 && (
                  <div className="text-sm text-gray-600 mb-3">
                    {prevActions[index - 1] > 1 
                      ? `Previous player raised to ${prevActions[index - 1]}BB` 
                      : prevActions[index - 1] === 1 
                        ? "Previous player called the blind" 
                        : "Previous player folded"}
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex space-x-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleActionTypeChange(index, 'fold')}
                      className={`px-3 py-1 rounded ${
                        actionType === 'fold' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      Fold
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleActionTypeChange(index, 'call')}
                      className={`px-3 py-1 rounded ${
                        actionType === 'call' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      Call {lastBetAmount}BB
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleActionTypeChange(index, 'raise')}
                      className={`px-3 py-1 rounded ${
                        actionType === 'raise' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200'
                      }`}
                    >
                      Raise
                    </button>
                  </div>
                  
                  {actionType === 'raise' && (
                    <div className="flex items-center">
                      <div className="mr-2">Raise to</div>
                      <input
                        type="number"
                        min={minRaiseAmount}
                        step="0.25"
                        value={customRaises[index]}
                        onChange={(e) => handleCustomRaiseChange(index, e.target.value)}
                        className="w-20 p-1 border rounded"
                        placeholder={minRaiseAmount.toString()}
                      />
                      <div className="ml-2">BB</div>
                      
                      <div className="ml-4 text-xs text-gray-500">
                        (Min: {minRaiseAmount}BB)
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm font-semibold">
                  Current action: 
                  {actionType === 'fold' && ' Fold'}
                  {actionType === 'call' && ` Call ${lastBetAmount}BB`}
                  {actionType === 'raise' && ` Raise to ${prevActions[index]}BB`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

function CreateRange() {
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

  const createInitialChart = () => {
    const defaultCell = { call: 0, fold: 100, raise: 0 };
    return Array.from({ length: 13 }, () =>
      Array.from({ length: 13 }, () => ({ ...defaultCell }))
    );
  };
  const token = useSelector((state) => state.auth.token);
  const [name, setName] = useState('');
  const [stackSize, setStackSize] = useState(100);
  const [position, setPosition] = useState(0);
  const [prevActions, setPrevActions] = useState([]);
  const [actionChart, setActionChart] = useState(createInitialChart());
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellValues, setCellValues] = useState({ call: 0, fold: 100, raise: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update prevActions when position changes
  useEffect(() => {
    // Reset prevActions when position changes
    const defaultActions = Array(position).fill(0);
    setPrevActions(defaultActions);
  }, [position]);

  const handlePositionChange = (e) => {
    const positionValue = parseInt(e.target.value);
    setPosition(positionValue);
  };


  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    setCellValues({ ...actionChart[row][col] });
  };

  const handleCellValueChange = (action, value) => {
    const newValues = { ...cellValues };
    newValues[action] = parseInt(value);
    
    // Ensure the sum is 100%
    const total = Object.values(newValues).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      // Adjust fold to make total 100%
      newValues.fold = Math.max(0, 100 - newValues.call - newValues.raise);
    }
    
    setCellValues(newValues);
  };

  const applyChangesToCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newChart = [...actionChart];
    newChart[row][col] = { ...cellValues };
    setActionChart(newChart);
    setSelectedCell(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const rangeData = {
        name,
        position,
        stack_size: stackSize,
        prev_actions: prevActions,
        action_chart: actionChart
      };
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/range`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rangeData),
      });
      
      if (response.ok) {
        // Redirect to home page on success
        navigate('/');
      } else {
        alert('Failed to save range');
      }
    } catch (error) {
      console.error('Error saving range:', error);
      alert('Error saving range');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Poker Range</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Range Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Stack Size (BB)</label>
            <input
              type="number"
              value={stackSize}
              onChange={(e) => setStackSize(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Position</label>
            <select
              value={position}
              onChange={handlePositionChange}
              className="w-full p-2 border rounded"
            >
              {positionLabels.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {position > 0 && (
          <PreviousActionsSection 
            position={position}
            prevActions={prevActions}
            setPrevActions={setPrevActions}
            positionLabels={positionLabels}
          />
        )}
        
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
            
            {actionChart.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                <div className="w-10 h-10 flex items-center justify-center font-bold bg-gray-200">
                  {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'][rowIndex]}
                </div>
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    style={getCellStyle(cell)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    title={`${matrixIndexToHand(rowIndex, colIndex)}: Call ${cell.call}%, Fold ${cell.fold}%, Raise ${cell.raise}%`}
                  >
                    {matrixIndexToHand(rowIndex, colIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Range'}
        </button>
      </form>
      
      {selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">
              Edit {matrixIndexToHand(selectedCell.row, selectedCell.col)}
            </h3>
            
            <div className="mb-4">
              <label className="block mb-1">Call %</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cellValues.call}
                onChange={(e) => handleCellValueChange('call', e.target.value)}
                className="w-full"
              />
              <div className="text-center">{cellValues.call}%</div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Raise %</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cellValues.raise}
                onChange={(e) => handleCellValueChange('raise', e.target.value)}
                className="w-full"
              />
              <div className="text-center">{cellValues.raise}%</div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Fold %</label>
              <input
                type="range"
                min="0"
                max="100"
                value={cellValues.fold}
                onChange={(e) => handleCellValueChange('fold', e.target.value)}
                className="w-full"
              />
              <div className="text-center">{cellValues.fold}%</div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={applyChangesToCell}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRange;