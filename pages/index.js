import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const NonogramSolver = () => {
  // Puzzle state
  const [nRows, setNRows] = useState(5);
  const [nCols, setNCols] = useState(5);
  const [rowHints, setRowHints] = useState([[3], [1, 1], [5], [1, 1], [3]]);
  const [colHints, setColHints] = useState([[3], [1, 1], [5], [1, 1], [3]]);
  // For dynamic customization we keep the text values
  const [rowHintsText, setRowHintsText] = useState(rowHints.map(r => r.join(" ")).join("\n"));
  const [colHintsText, setColHintsText] = useState(colHints.map(c => c.join(" ")).join("\n"));
  // Board and solution state
  const [userBoard, setUserBoard] = useState(() => {
    const board = [];
    for (let i = 0; i < 5; i++) {
      board.push(new Array(5).fill(null));
    }
    return board;
  });
  const [solution, setSolution] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [rowValidPatterns, setRowValidPatterns] = useState([]);
  const [colValidPatterns, setColValidPatterns] = useState([]);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Refs for drag support
  const isDraggingRef = useRef(false);
  const toggledCellsRef = useRef(new Set());

  const cellSize = 40;
  const hintMargin = 100;

  // Initialize puzzle board
  const initBoard = () => {
    const board = [];
    for (let i = 0; i < nRows; i++) {
      board.push(new Array(nCols).fill(null));
    }
    setUserBoard(board);
    setSolution(null);
    setHintCell(null);
  };

  // Set canvas dimensions
  const updateCanvasSize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = hintMargin + nCols * cellSize;
      canvasRef.current.height = hintMargin + nRows * cellSize;
    }
  };

  // Generate all binary patterns for a line given hints
  const generateLinePatterns = (length, hints) => {
    if (hints.length === 0) return [Array(length).fill(0)];
    const patterns = [];
    const rec = (pos, hintIndex, current) => {
      if (hintIndex === hints.length) {
        const remainder = Array(length - pos).fill(0);
        patterns.push([...current, ...remainder]);
        return;
      }
      const block = hints[hintIndex];
      for (let start = pos; start <= length - block; start++) {
        const zeros = Array(start - pos).fill(0);
        const ones = Array(block).fill(1);
        const newCurrent = [...current, ...zeros, ...ones];
        const newPos = start + block;
        if (hintIndex < hints.length - 1) {
          if (newPos < length) {
            rec(newPos + 1, hintIndex + 1, [...newCurrent, 0]);
          }
        } else {
          rec(newPos, hintIndex + 1, newCurrent);
        }
      }
    };
    rec(0, 0, []);
    return patterns;
  };

  // Check if a partial pattern is a valid prefix for any complete pattern
  const prefixPossible = (partial, patterns) => {
    return patterns.some(pattern => {
      for (let i = 0; i < partial.length; i++) {
        if (pattern[i] !== partial[i]) return false;
      }
      return true;
    });
  };

  // Solve the nonogram via backtracking
  const solveNonogram = (rHints, cHints) => {
    const localRows = rHints.length;
    const localCols = cHints.length;
    const validRows = rHints.map(hints => generateLinePatterns(localCols, hints));
    const validCols = cHints.map(hints => generateLinePatterns(localRows, hints));
    const sol = new Array(localRows);
    const backtrack = (row) => {
      if (row === localRows) return true;
      for (const candidate of validRows[row]) {
        let valid = true;
        for (let col = 0; col < localCols; col++) {
          const partial = [];
          for (let r = 0; r < row; r++) {
            partial.push(sol[r][col]);
          }
          partial.push(candidate[col]);
          if (!prefixPossible(partial, validCols[col])) {
            valid = false;
            break;
          }
        }
        if (valid) {
          sol[row] = candidate;
          if (backtrack(row + 1)) return true;
        }
      }
      return false;
    };
    return backtrack(0) ? sol : null;
  };

  // Determine if there's a forced move in a line (row or column)
  const forcedMoveFromLine = (validPatterns, currentLine) => {
    const filtered = validPatterns.filter(pattern => {
      for (let i = 0; i < currentLine.length; i++) {
        if (currentLine[i] !== null && currentLine[i] !== pattern[i]) {
          return false;
        }
      }
      return true;
    });
    if (filtered.length === 0) return null;
    for (let i = 0; i < currentLine.length; i++) {
      if (currentLine[i] === null) {
        const vals = new Set(filtered.map(pattern => pattern[i]));
        if (vals.size === 1) {
          return { index: i, forcedValue: vals.values().next().value };
        }
      }
    }
    return null;
  };

  // Precompute valid patterns for rows and columns
  const updateValidPatterns = () => {
    const newRowValid = [];
    const newColValid = [];
    for (let i = 0; i < nRows; i++) {
      newRowValid.push(generateLinePatterns(nCols, rowHints[i] || []));
    }
    for (let j = 0; j < nCols; j++) {
      newColValid.push(generateLinePatterns(nRows, colHints[j] || []));
    }
    setRowValidPatterns(newRowValid);
    setColValidPatterns(newColValid);
  };

  // Draw the puzzle on the canvas
  const draw = () => {
    updateCanvasSize();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = '#f7f9fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '16px Roboto, sans-serif';
    ctx.fillStyle = '#2d3436';

    // Draw cells (safely check userBoard rows)
    for (let i = 0; i < nRows; i++) {
      // If the row doesn't exist yet, use a temporary empty row
      const row = userBoard[i] || new Array(nCols).fill(null);
      for (let j = 0; j < nCols; j++) {
        const x = hintMargin + j * cellSize;
        const y = hintMargin + i * cellSize;
        // Use solution if available; otherwise, use the cell from the row (or null)
        const val = solution !== null ? solution[i][j] : row[j];
        if (val === 1) {
          ctx.fillStyle = '#0984e3';
          ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#dfe6e9';
          ctx.fillRect(x, y, cellSize, cellSize);
          if (val === 0) {
            ctx.strokeStyle = '#e17055';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 5);
            ctx.lineTo(x + cellSize - 5, y + cellSize - 5);
            ctx.moveTo(x + cellSize - 5, y + 5);
            ctx.lineTo(x + 5, y + cellSize - 5);
            ctx.stroke();
          }
        }
        ctx.strokeStyle = '#b2bec3';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    // Highlight a cell if it's suggested as a hint
    if (hintCell !== null) {
      const { row, col } = hintCell;
      const x = hintMargin + col * cellSize;
      const y = hintMargin + row * cellSize;
      ctx.strokeStyle = '#fdcb6e';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }

    // Draw row hints
    for (let i = 0; i < nRows; i++) {
      const hintsText = (rowHints[i] || []).join(' ');
      const x = hintMargin - 10;
      const y = hintMargin + i * cellSize + cellSize / 2 + 6;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#636e72';
      ctx.fillText(hintsText, x, y);
    }

    // Draw column hints
    for (let j = 0; j < nCols; j++) {
      const x = hintMargin + j * cellSize + cellSize / 2;
      const y = hintMargin - 10;
      ctx.textAlign = 'center';
      const lines = (colHints[j] || []).map(String);
      for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k], x, y - (lines.length - 1) * 8 + k * 16);
      }
    }
  };

  // Re-draw whenever relevant state changes
  useEffect(() => {
    draw();
  }, [userBoard, solution, hintCell, nRows, nCols, rowHints, colHints]);

  useEffect(() => {
    initBoard();
    updateValidPatterns();
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [nRows, nCols, rowHints, colHints]);

  // --- Drag Event Handlers ---

  // Returns the cell coordinates {i, j} based on the mouse event.
  const getCellCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < hintMargin || y < hintMargin) return null;
    const j = Math.floor((x - hintMargin) / cellSize);
    const i = Math.floor((y - hintMargin) / cellSize);
    if (i < 0 || i >= nRows || j < 0 || j >= nCols) return null;
    return { i, j };
  };

  // Toggles the state of cell (i,j) using the same cycle as before.
  const toggleCell = (i, j) => {
    setUserBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.slice());
      const current = newBoard[i][j];
      const newState = current === null ? 1 : current === 1 ? 0 : null;
      newBoard[i][j] = newState;
      return newBoard;
    });
    setHintCell(null);
  };

  const handleMouseDown = (event) => {
    if (solution !== null) return;
    const coords = getCellCoordinates(event);
    if (!coords) return;
    const { i, j } = coords;
    toggleCell(i, j);
    toggledCellsRef.current.add(`${i},${j}`);
    isDraggingRef.current = true;
  };

  const handleMouseMove = (event) => {
    if (!isDraggingRef.current || solution !== null) return;
    const coords = getCellCoordinates(event);
    if (!coords) return;
    const { i, j } = coords;
    const key = `${i},${j}`;
    if (toggledCellsRef.current.has(key)) return;
    toggleCell(i, j);
    toggledCellsRef.current.add(key);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    toggledCellsRef.current.clear();
  };

  // --- Other Event Handlers ---

  const handleSolve = () => {
    const sol = solveNonogram(rowHints, colHints);
    if (sol !== null) {
      setSolution(sol);
      setUserBoard(sol.map(row => row.slice()));
      setHintCell(null);
    } else {
      alert('No valid solution found for the puzzle.');
    }
  };

  const handleClear = () => {
    initBoard();
    setSolution(null);
    setHintCell(null);
  };

  const handleHint = () => {
    for (let i = 0; i < nRows; i++) {
      const forced = forcedMoveFromLine(rowValidPatterns[i], userBoard[i]);
      if (forced !== null) {
        setHintCell({ row: i, col: forced.index });
        draw();
        const stateStr = forced.forcedValue === 1 ? 'FILLED' : 'EMPTY';
        alert(`Hint: Cell at row ${i + 1}, column ${forced.index + 1} must be ${stateStr}.`);
        return;
      }
    }
    for (let j = 0; j < nCols; j++) {
      const currentCol = [];
      for (let i = 0; i < nRows; i++) {
        currentCol.push(userBoard[i][j]);
      }
      const forced = forcedMoveFromLine(colValidPatterns[j], currentCol);
      if (forced !== null) {
        setHintCell({ row: forced.index, col: j });
        draw();
        const stateStr = forced.forcedValue === 1 ? 'FILLED' : 'EMPTY';
        alert(`Hint: Cell at row ${forced.index + 1}, column ${j + 1} must be ${stateStr}.`);
        return;
      }
    }
    alert('No immediate forced moves are available.');
  };

  const handleLoadPuzzle = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      parsePuzzleFile(e.target.result);
    };
    reader.readAsText(file);
  };

  const generatePuzzleFileText = () => {
    let text = '';
    text += 'ROWS:' + nRows + '\n';
    text += 'COLS:' + nCols + '\n';
    text += 'ROW_HINTS:\n';
    rowHints.forEach((row) => {
      text += row.join(' ') + '\n';
    });
    text += 'COL_HINTS:\n';
    colHints.forEach((col) => {
      text += col.join(' ') + '\n';
    });
    return text;
  };

  const handleSavePuzzle = () => {
    const text = generatePuzzleFileText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nonogram_puzzle.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parsePuzzleFile = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let rows, cols;
    let rowHintsStart = -1, colHintsStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('ROWS:')) {
        rows = parseInt(lines[i].split(':')[1]);
      } else if (lines[i].startsWith('COLS:')) {
        cols = parseInt(lines[i].split(':')[1]);
      } else if (lines[i] === 'ROW_HINTS:') {
        rowHintsStart = i + 1;
      } else if (lines[i] === 'COL_HINTS:') {
        colHintsStart = i + 1;
      }
    }
    if (!rows || !cols || rowHintsStart < 0 || colHintsStart < 0) {
      alert('Invalid puzzle file format.');
      return;
    }
    const newRowHints = [];
    for (let i = rowHintsStart; i < colHintsStart - 1; i++) {
      const parts = lines[i].split(/\s+/).map(Number);
      newRowHints.push(parts);
    }
    const newColHints = [];
    for (let i = colHintsStart; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/).map(Number);
      newColHints.push(parts);
    }
    setNRows(rows);
    setNCols(cols);
    setRowHints(newRowHints);
    setColHints(newColHints);
    setRowHintsText(newRowHints.map(r => r.join(" ")).join("\n"));
    setColHintsText(newColHints.map(c => c.join(" ")).join("\n"));
    updateCanvasSize();
    initBoard();
    updateValidPatterns();
    setSolution(null);
    setHintCell(null);
  };

  // --- Customization Control Handlers ---

  const handleRowsChange = (e) => {
    const newRows = parseInt(e.target.value);
    if (isNaN(newRows) || newRows < 1) return;
    setNRows(newRows);
    // Reset board and row hints to empty arrays
    const newRowHints = new Array(newRows).fill(null).map(() => []);
    setRowHints(newRowHints);
    setRowHintsText(new Array(newRows).fill("").join("\n"));
  };

  const handleColsChange = (e) => {
    const newCols = parseInt(e.target.value);
    if (isNaN(newCols) || newCols < 1) return;
    setNCols(newCols);
    // Reset column hints to empty arrays
    const newColHints = new Array(newCols).fill(null).map(() => []);
    setColHints(newColHints);
    setColHintsText(new Array(newCols).fill("").join("\n"));
  };

  const handleRowHintsTextChange = (e) => {
    const text = e.target.value;
    setRowHintsText(text);
    const lines = text.trim().split('\n');
    if (lines.length === nRows) {
      const newRowHints = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === "") return [];
        const parts = trimmed.split(/\s+/).map(Number);
        return parts.some(isNaN) ? [] : parts;
      });
      setRowHints(newRowHints);
    }
  };

  const handleColHintsTextChange = (e) => {
    const text = e.target.value;
    setColHintsText(text);
    const lines = text.trim().split('\n');
    if (lines.length === nCols) {
      const newColHints = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === "") return [];
        const parts = trimmed.split(/\s+/).map(Number);
        return parts.some(isNaN) ? [] : parts;
      });
      setColHints(newColHints);
    }
  };

  return (
    <>
      <Head>
        <title>Modern Nonogram Solver</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet" />
      </Head>
      <div className="app-container">
        <header className="header">
          <h1>Modern Nonogram Solver</h1>
        </header>
        <main className="main-content">
          {/* Customization controls on main page */}
          <div className="customize-controls">
            <div className="control-group">
              <label htmlFor="rowsInput">Rows:</label>
              <input
                type="number"
                id="rowsInput"
                value={nRows}
                onChange={handleRowsChange}
                min="1"
              />
            </div>
            <div className="control-group">
              <label htmlFor="colsInput">Columns:</label>
              <input
                type="number"
                id="colsInput"
                value={nCols}
                onChange={handleColsChange}
                min="1"
              />
            </div>
            <div className="control-group">
              <label htmlFor="rowHintsInput">
                Row hints (one row per line, space‑separated):
              </label>
              <textarea
                id="rowHintsInput"
                rows="5"
                value={rowHintsText}
                onChange={handleRowHintsTextChange}
              ></textarea>
            </div>
            <div className="control-group">
              <label htmlFor="colHintsInput">
                Column hints (one column per line, space‑separated):
              </label>
              <textarea
                id="colHintsInput"
                rows="5"
                value={colHintsText}
                onChange={handleColHintsTextChange}
              ></textarea>
            </div>
          </div>
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="nonogram-canvas"
            />
          </div>
          <div className="controls">
            <button onClick={handleSolve}>Solve</button>
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleHint}>Hint</button>
            <button onClick={handleLoadPuzzle}>Load Puzzle</button>
            <button onClick={handleSavePuzzle}>Save Puzzle</button>
          </div>
        </main>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".txt" onChange={handleFileChange} />
      </div>

      <style jsx>{`
        /* Reset & Base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f7f9fc;
          color: #2d3436;
          line-height: 1.6;
        }
        /* App Container */
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        /* Header */
        .header {
          background-color: #0984e3;
          color: #fff;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
          font-size: 1.8rem;
          font-weight: 500;
        }
        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .customize-controls {
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: space-between;
          padding: 10px;
          border: 1px solid #b2bec3;
          border-radius: 8px;
          background: #fff;
        }
        .control-group {
          flex: 1;
          min-width: 150px;
          display: flex;
          flex-direction: column;
        }
        .control-group label {
          margin-bottom: 5px;
          font-weight: 500;
        }
        .control-group input,
        .control-group textarea {
          padding: 8px;
          border: 1px solid #b2bec3;
          border-radius: 4px;
          font-size: 1rem;
        }
        .canvas-wrapper {
          width: 100%;
          max-width: 800px;
          margin: 20px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .nonogram-canvas {
          border: 1px solid #b2bec3;
          border-radius: 8px;
          background: #fff;
          transition: transform 0.3s ease;
        }
        .nonogram-canvas:hover {
          transform: scale(1.02);
        }
        /* Controls */
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }
        .controls button {
          background-color: #0984e3;
          border: none;
          color: #fff;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .controls button:hover {
          background-color: #74b9ff;
          transform: translateY(-2px);
        }
        .controls button:active {
          transform: translateY(0);
        }
        /* Responsive Adjustments */
        @media (max-width: 600px) {
          .header h1 {
            font-size: 1.5rem;
          }
          .controls button {
            padding: 10px 16px;
            font-size: 0.9rem;
          }
          .customize-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default NonogramSolver;
