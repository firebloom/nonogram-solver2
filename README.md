Modern Nonogram Solver

Modern Nonogram Solver is an interactive puzzle solver built with React and Next.js. This application lets you dynamically customize, solve, and interact with nonogram puzzles using an HTML5 canvas. You can update puzzle dimensions and hints on the fly, draw solutions via drag actions, and even save or load puzzle configurations.

Features
	•	Dynamic Customization:
Update the number of rows, columns, and hints directly on the main page. The puzzle board is re-initialized and updated automatically when customization values change.
	•	Interactive Puzzle Board:
Click or drag on the board to change cell states (cycling through null (empty), 1 (filled), and 0 (empty with cross)). The drag feature ensures that each cell is toggled only once per drag session.
	•	Nonogram Solving:
A built-in backtracking solver finds solutions based on the provided row and column hints.
	•	Hint System:
Detect forced moves on rows or columns and provide a hint to guide your next move.
	•	File Operations:
Save your current puzzle configuration as a text file or load puzzles from a file. The file format supports saving and restoring the number of rows, columns, and hints.
	•	Responsive Design:
The application is optimized for various screen sizes, ensuring a smooth experience on both desktop and mobile devices.

Getting Started

Prerequisites
	•	Node.js (v12 or higher)
	•	npm or Yarn

Installation
	1.	Clone the repository:

git clone https://github.com/yourusername/modern-nonogram-solver.git
cd modern-nonogram-solver


	2.	Install dependencies:
Using npm:

npm install

Or using Yarn:

yarn install



Running the Application

Start the development server:

Using npm:

npm run dev

Or using Yarn:

yarn dev

Open your browser and navigate to http://localhost:3000 to view the application.

Usage
	1.	Customize Puzzle:
	•	Use the input fields at the top of the main page to set the number of rows and columns.
	•	Update the row and column hints by entering numbers (space‑separated for each row/column, with each line corresponding to a row or column).
	•	The board updates dynamically when these values change.
	2.	Interacting with the Board:
	•	Click on any cell to toggle its state.
	•	Drag over cells to change their state quickly. Each cell will only toggle once per drag session.
	3.	Solving the Puzzle:
	•	Click the Solve button to run the solver. If a valid solution is found, it will be displayed on the board.
	•	If no solution is found, an alert will inform you.
	4.	Hints:
	•	Click the Hint button to highlight a cell that must be either filled or empty based on forced moves.
	5.	File Operations:
	•	Load Puzzle: Click the Load Puzzle button to import a puzzle file.
	•	Save Puzzle: Click the Save Puzzle button to download your current puzzle configuration.
	6.	Clear Puzzle:
	•	Click the Clear button to reset the board and remove any solution or hints.

Project Structure
	•	pages/index.js
The main component that renders the puzzle board, customization controls, and file operation buttons. It also contains all the logic for drawing the board, handling drag events, and solving the puzzle.
	•	public/
Static assets such as fonts.
	•	styles/
(If applicable) Global styles and component-specific CSS modules.

Technologies Used
	•	React: For building the user interface.
	•	Next.js: For server-side rendering and routing.
	•	HTML5 Canvas: For rendering the nonogram puzzle board.
	•	JavaScript (ES6+): Core language for the project.

Contributing

Contributions are welcome! Please follow these steps:
	1.	Fork the repository.
	2.	Create a new branch (git checkout -b feature/YourFeature).
	3.	Make your changes and commit them (git commit -m 'Add some feature').
	4.	Push to the branch (git push origin feature/YourFeature).
	5.	Open a pull request.

License

This project is licensed under the MIT License.

Acknowledgments
	•	Thanks to the React and Next.js communities for their excellent documentation and resources.
	•	Inspired by modern puzzle solvers and interactive applications.
