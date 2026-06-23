
document.addEventListener("DOMContentLoaded", () => {
    // 1. Grab the board (Make sure this matches your HTML ID!)
    const board = document.getElementById("chess-board-actual");

    // 2. Movement Vectors Datasets
    const rookMoves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const bishopMoves = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const queenMoves = [...rookMoves, ...bishopMoves];
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    const UNICODE_PIECES = {
    'w_rook': '♖', 'w_knight': '♘', 'w_bishop': '♗', 'w_queen': '♕', 'w_king': '♔', 'w_pawn': '♙',
    'b_rook': '♜', 'b_knight': '♞', 'b_bishop': '♝', 'b_queen': '♛', 'b_king': '♚', 'b_pawn': '♟'
    };

    let boardState = [
        ['b_rook', 'b_knight', 'b_bishop', 'b_queen', 'b_king', 'b_bishop', 'b_knight', 'b_rook'],
        ['b_pawn', 'b_pawn',   'b_pawn',   'b_pawn',  'b_pawn', 'b_pawn',   'b_pawn',   'b_pawn'],
        [null,     null,       null,       null,      null,     null,       null,       null],
        [null,     null,       null,       null,      null,     null,       null,       null],
        [null,     null,       null,       null,      null,     null,       null,       null],
        [null,     null,       null,       null,      null,     null,       null,       null],
        ['w_pawn', 'w_pawn',   'w_pawn',   'w_pawn',  'w_pawn', 'w_pawn',   'w_pawn',   'w_pawn'],
        ['w_rook', 'w_knight', 'w_bishop', 'w_queen', 'w_king', 'w_bishop', 'w_knight', 'w_rook']
    ];

    // Keep track of which piece is currently clicked/selected
    let selectedPiece = null;

    // 4. Universal Move Calculator Function
    function getPossibleMoves(piece) {
        let moves = [];
        
        // --- STEPPER LOGIC (Knight) ---
        if (piece.type === 'knight') {
            for (let [dr, dc] of knightMoves) {
                let targetRow = piece.row + dr;
                let targetCol = piece.col + dc;
                if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                    moves.push([targetRow, targetCol]);
                }
            }
        }
        
        // --- SLIDER LOGIC (Rook, Bishop, Queen) ---
        if (piece.type === 'rook' || piece.type === 'bishop' || piece.type === 'queen') {
            let directions = piece.type === 'rook' ? rookMoves : (piece.type === 'bishop' ? bishopMoves : queenMoves);
            
            for (let [dr, dc] of directions) {
                let targetRow = piece.row + dr;
                let targetCol = piece.col + dc;
                
                while (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                    moves.push([targetRow, targetCol]);
                    targetRow += dr;
                    targetCol += dc;
                }
            }
        }
        return moves;
    }

    // 5. Highlight Helper Functions
    function highlightValidMoves(piece) {
        const validCoords = getPossibleMoves(piece);
        
        validCoords.forEach(([r, c]) => {
            const targetSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (targetSquare) {
                targetSquare.classList.add("highlight");
            }
        });
    }

    function clearHighlights() {
        const highlightedSquares = document.querySelectorAll(".square.highlight");
        highlightedSquares.forEach(sq => sq.classList.remove("highlight"));
    }

    // 6. SINGLE Board Generation Loop (Enhanced to handle moving)
    function renderBoard() {
        board.innerHTML = "";

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");
                
                // Checkerboard tiling colors logic
                if ((row + col) % 2 === 0) square.classList.add("light");
                else square.classList.add("dark");

                square.dataset.row = row;
                square.dataset.col = col;

                // 1. Look up if a piece exists at these exact coordinates
                const pieceKey = boardState[row][col];
                
                if (pieceKey) {
                    // Draw the piece symbol from our text dictionary
                    square.textContent = UNICODE_PIECES[pieceKey];
                    square.style.fontSize = "3.2rem";
                    square.style.display = "flex";
                    square.style.justifyContent = "center";
                    square.style.alignItems = "center";
                    square.style.cursor = "pointer";
                    
                    // Color formatting distinction based on string prefix
                    square.style.color = pieceKey.startsWith('w_') ? "#ffffff" : "#000000";

                    // Click listener to select a piece
                    square.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearHighlights();
                        
                        // Parse type and color out of the string (e.g. 'w_rook' -> color: 'w', type: 'rook')
                        const [color, type] = pieceKey.split('_');
                        selectedPiece = { type, color, row, col };
                        
                        highlightValidMoves(selectedPiece);
                    });
                }

                // 2. Handle moving a selected piece to a highlighted target square
                square.addEventListener('click', () => {
                    if (square.classList.contains("highlight") && selectedPiece) {
                        const targetRow = parseInt(square.dataset.row);
                        const targetCol = parseInt(square.dataset.col);

                        // Reconstruct the key name (e.g., 'w' + '_' + 'rook' = 'w_rook')
                        const pieceString = `${selectedPiece.color}_${selectedPiece.type}`;

                        // Update our layout state matrix arrays
                        boardState[selectedPiece.row][selectedPiece.col] = null; // Empty the old square
                        boardState[targetRow][targetCol] = pieceString;          // Drop it in the new square
                        
                        selectedPiece = null; // Clear selection state
                        renderBoard();        // Redraw EVERYTHING
                    } else {
                        clearHighlights();
                    }
                });

                board.appendChild(square);
            }
        }
    }
    // Run the initial render block on page load
    renderBoard();
    
    // Clear movement tracks if user clicks completely outside the grid wrapper
    document.addEventListener('click', clearHighlights);
});