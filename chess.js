
document.addEventListener("DOMContentLoaded", () => {
    
    const board = document.getElementById("chess-board-actual");

    
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

    
    let selectedPiece = null;

    
    function getPossibleMoves(piece) {
        let moves = [];
        
        
        if (piece.type === 'knight') {
            for (let [dr, dc] of knightMoves) {
                let targetRow = piece.row + dr;
                let targetCol = piece.col + dc;
                if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                    moves.push([targetRow, targetCol]);
                }
            }
        }
        
        
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

    
    function renderBoard() {
        board.innerHTML = "";

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");
                
                
                if ((row + col) % 2 === 0) square.classList.add("light");
                else square.classList.add("dark");

                square.dataset.row = row;
                square.dataset.col = col;

                
                const pieceKey = boardState[row][col];
                
                if (pieceKey) {
                    
                    square.textContent = UNICODE_PIECES[pieceKey];
                    square.style.fontSize = "3.2rem";
                    square.style.display = "flex";
                    square.style.justifyContent = "center";
                    square.style.alignItems = "center";
                    square.style.cursor = "pointer";
                    
                    
                    square.style.color = pieceKey.startsWith('w_') ? "#ffffff" : "#000000";

                    
                    square.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearHighlights();
                        
                        
                        const [color, type] = pieceKey.split('_');
                        selectedPiece = { type, color, row, col };
                        
                        highlightValidMoves(selectedPiece);
                    });
                }

                
                square.addEventListener('click', () => {
                    if (square.classList.contains("highlight") && selectedPiece) {
                        const targetRow = parseInt(square.dataset.row);
                        const targetCol = parseInt(square.dataset.col);

                        
                        const pieceString = `${selectedPiece.color}_${selectedPiece.type}`;

                        
                        boardState[selectedPiece.row][selectedPiece.col] = null; 
                        boardState[targetRow][targetCol] = pieceString;          
                        
                        selectedPiece = null; 
                        renderBoard();        
                    } else {
                        clearHighlights();
                    }
                });

                board.appendChild(square);
            }
        }
    }
    
    renderBoard();
    
    
    document.addEventListener('click', clearHighlights);
});