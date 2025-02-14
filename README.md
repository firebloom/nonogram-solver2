# Modern Nonogram Solver

Modern Nonogram Solver is an interactive puzzle solver built with React and Next.js. This application lets you dynamically customize, solve, and interact with nonogram puzzles using an HTML5 canvas. You can update puzzle dimensions and hints on the fly, draw solutions via drag actions, and even save or load puzzle configurations.

---

## Features

- **Dynamic Customization:**  
  Update the number of rows, columns, and hints directly on the main page. The puzzle board is re-initialized and updated automatically when customization values change.

- **Interactive Puzzle Board:**  
  Click or drag on the board to change cell states (cycling through **null** (empty), **1** (filled), and **0** (empty with cross)). The drag feature ensures that each cell is toggled only once per drag session.

- **Nonogram Solving:**  
  A built-in backtracking solver finds solutions based on the provided row and column hints.

- **Hint System:**  
  Detect forced moves on rows or columns and provide a hint to guide your next move.

- **File Operations:**  
  Save your current puzzle configuration as a text file or load puzzles from a file. The file format supports saving and restoring the number of rows, columns, and hints.

- **Responsive Design:**  
  The application is optimized for various screen sizes, ensuring a smooth experience on both desktop and mobile devices.
