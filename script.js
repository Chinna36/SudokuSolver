document
  .getElementById("sudoku-board")
  .addEventListener("keyup", function (event) {
    if (event.target && event.target.nodeName == "TD") {
      var validNum = /[1-9]/;
      var tdEl = event.target;
      if (tdEl.innerText.length > 0 && validNum.test(tdEl.innerText[0])) {
        tdEl.innerText = tdEl.innerText[0];

        tdEl.classList.add("input-cell");
        tdEl.classList.remove("output-cell");
      } else {
        tdEl.innerText = "";

        tdEl.classList.remove("input-cell",  "output-cell");
      }
      highlightErrors();
    }
  });

document
  .getElementById("solve-button")
  .addEventListener("click", function (event) {
    var boardString = boardToString();
    console.log("Board String for solving: ", boardString);
    
    if (boardString === "-".repeat(boardString.length))
    {
      alert("Please fill the input numbers in the sudoku board before solving!");
      return;
    }
    var solution = SudokuSolver.solve(boardString);
    if (solution) {
      stringToBoard(solution);
    } else {
      alert("Invalid Board! please check there shouldn't be same number in (same row/same col/in nonet)");
    }
    highlightErrors();
  });

  function highlightErrors() {
    var tds = document.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
        tds[i].classList.remove("error-cell");
        tds[i].removeAttribute("title");  // Remove previous error highlighting
    }

    var boardArray = boardToString().split("");
    
    // Check for duplicates in rows, columns, and nonets
    highlightDuplicates(boardArray);
}

function highlightDuplicates(boardArray) {
    // Validate rows, columns, and boxes
    var rows = [0, 9, 18, 27, 36, 45, 54, 63, 72];
    for (var i = 0; i < 9; i++) {
        var row = getRow(boardArray, i * 9);
        checkAndHighlightDuplicates(row, "row", i+1, rows[i]);
    }
    
    for (var i = 0; i < 9; i++) {
        var column = getColumn(boardArray, i);
        checkAndHighlightDuplicates(column, "column", i+1, i);
    }

    var boxes = [0, 3, 6, 27, 30, 33, 54, 57, 60];
    for (var i = 0; i < 9; i++) {
        var box = getBox(boardArray, boxes[i]);
        checkAndHighlightDuplicates(box, "box", i+1, boxes[i]);
    }
}

function checkAndHighlightDuplicates(collection, type, index, position) {
    var numCounts = {};
    for (var i = 0; i < collection.length; i++) {
        if (collection[i] !== "-") {

          if(numCounts[collection[i]] !== undefined){
            var firstDuplicateIndex = numCounts[collection[i]];
            var tds = document.getElementsByTagName("td");

            var row1 = Math.floor(i / 9) + 1;
            var col1 = (i % 9) + 1;
            var row2 = Math.floor(firstDuplicateIndex / 9) + 1;
            var col2 = (firstDuplicateIndex % 9) + 1;

            tds[i].classList.add("error-cell");
            tds[i].setAttribute("title", `Duplicate found in row ${row1}, column ${col1} and row ${row2}, column ${col2}`);

            tds[firstDuplicateIndex].classList.add("error-cell");
            tds[firstDuplicateIndex].setAttribute("title", `Duplicate found in row ${row1}, column ${col1} and row ${row2}, column ${col2}`);
             
        } else {
            numCounts[collection[i]] = i;
        }
    }
  }
}


  document.getElementById("clear-button").addEventListener("click", clearBoard);

function clearBoard() {
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    tds[i].innerText = "";
    tds[i].classList.remove("input-cell", "output-cell");
    tds[i].classList.remove("error-cell"); 
  }
}

function boardToString() {
  var string = "";
  var validNum = /[1-9]/;
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    if (validNum.test(tds[i].innerText[0])) {
      string += tds[i].innerText[0];
    } else {
      string += "-";
    }
  }
  console.log("Board String: ", string);
  return string;
}

function stringToBoard(string) {
  var currentCell;
  var validNum = /[1-9]/;
  var cells = string.split("");
  var tds = document.getElementsByTagName("td");
  for (var i = 0; i < tds.length; i++) {
    currentCell = cells.shift();
    if (validNum.test(currentCell)) {
      tds[i].innerText = currentCell;
    }
  }
  highlightErrors();
}



("use strict");

var EASY_PUZZLE =
  "1-58-2----9--764-52--4--819-19--73-6762-83-9-----61-5---76---3-43--2-5-16--3-89--";
var MEDIUM_PUZZLE =
  "-3-5--8-45-42---1---8--9---79-8-61-3-----54---5------78-----7-2---7-46--61-3--5--";
var HARD_PUZZLE =
  "8----------36------7--9-2---5---7-------457-----1---3---1----68--85---1--9----4--";

var TESTABLE = true;

var SudokuSolver = (function (testable) {
  var solver;

  function solve(boardString) {
    var boardArray = boardString.split("");

    console.log("Board Array before validation: ",boardArray);

    if (boardIsInvalid(boardArray)) {
      console.log("Board is Invalid.");
      return false;
    }
    return recursiveSolve(boardString);
  }

  function solveAndPrint(boardString) {
    var solvedBoard = solve(boardString);
    console.log(toString(solvedBoard.split("")));
    return solvedBoard;
  }

  function recursiveSolve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsSolved(boardArray)) {
      return boardArray.join("");
    }
    var cellPossibilities = getNextCellAndPossibilities(boardArray);
    var nextUnsolvedCellIndex = cellPossibilities.index;
    var possibilities = cellPossibilities.choices;
    for (var i = 0; i < possibilities.length; i++) {
      boardArray[nextUnsolvedCellIndex] = possibilities[i];
      var solvedBoard = recursiveSolve(boardArray.join(""));
      if (solvedBoard) {
        return solvedBoard;
      }
    }
    return false;
  }

  function boardIsInvalid(boardArray) {
    return !boardIsValid(boardArray);
  }

  function boardIsValid(boardArray) {
    console.log("Checking board validity...");
  
    var rowsValid = allRowsValid(boardArray);
    var columnsValid = allColumnsValid(boardArray);
    var boxesValid = allBoxesValid(boardArray);
  
    console.log("Rows valid: ", rowsValid);
    console.log("Columns valid: ", columnsValid);
    console.log("Boxes valid: ", boxesValid);
  
    return rowsValid && columnsValid && boxesValid;
  }
  

  function boardIsSolved(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        return false;
      }
    }
    return true;
  }

  function getNextCellAndPossibilities(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        var existingValues = getAllIntersections(boardArray, i);
        var choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(
          function (num) {
            return existingValues.indexOf(num) < 0;
          }
        );
        return { index: i, choices: choices };
      }
    }
  }

  function getAllIntersections(boardArray, i) {
    return getRow(boardArray, i)
      .concat(getColumn(boardArray, i))
      .concat(getBox(boardArray, i));
  }

  function allRowsValid(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72]
      .map(function (i) {
        return getRow(boardArray, i);
      })
      .reduce(function (validity, row) {
        return collectionIsValid(row) && validity;
      }, true);
  }

  

  function getRow(boardArray, i) {
    var startingEl = Math.floor(i / 9) * 9;
    return boardArray.slice(startingEl, startingEl + 9);
  }

  function allColumnsValid(boardArray) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8]
      .map(function (i) {
        return getColumn(boardArray, i);
      })
      .reduce(function (validity, row) {
        return collectionIsValid(row) && validity;
      }, true);
  }

  function getColumn(boardArray, i) {
    var startingEl = Math.floor(i % 9);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (num) {
      return boardArray[startingEl + num * 9];
    });
  }

  function allBoxesValid(boardArray) {
    return [0, 3, 6, 27, 30, 33, 54, 57, 60]
      .map(function (i) {
        return getBox(boardArray, i);
      })
      .reduce(function (validity, row) {
        return collectionIsValid(row) && validity;
      }, true);
  }

  function getBox(boardArray, i) {
    var boxCol = Math.floor(i / 3) % 3;
    var boxRow = Math.floor(i / 27);
    var startingIndex = boxCol * 3 + boxRow * 27;
    return [0, 1, 2, 9, 10, 11, 18, 19, 20].map(function (num) {
      return boardArray[startingIndex + num];
    });
  }

  function collectionIsValid(collection) {
    var numCounts = {};
    for (var i = 0; i < collection.length; i++) {
      if (collection[i] != "-") {
        if (numCounts[collection[i]] === undefined) {
          numCounts[collection[i]] = 1;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  function toString(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72]
      .map(function (i) {
        return getRow(boardArray, i).join(" ");
      })
      .join("\n");
  }

  if (testable) {
    solver = {
      solve: solve,
      solveAndPrint: solveAndPrint,
      recursiveSolve: recursiveSolve,
      boardIsInvalid: boardIsInvalid,
      boardIsValid: boardIsValid,
      boardIsSolved: boardIsSolved,
      getNextCellAndPossibilities: getNextCellAndPossibilities,
      getAllIntersections: getAllIntersections,
      allRowsValid: allRowsValid,
      getRow: getRow,
      allColumnsValid: allColumnsValid,
      getColumn: getColumn,
      allBoxesValid: allBoxesValid,
      getBox: getBox,
      collectionIsValid: collectionIsValid,
      toString: toString,
    };
  } else {
    solver = { solve: solve, solveAndPrint: solveAndPrint };
  }

  return solver;
})(TESTABLE);