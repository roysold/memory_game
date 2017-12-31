"use strict"

var guessCells = [];
var revealedCells = [];

window.onload = function init() {
    var length = 4;
    var tableId = "game-board";

    var cells = generateGameBoardMatrix(length);
    initBoardUI(tableId, length, cells);
}

function initBoardUI(tableId, length, cells) {
    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        document.getElementById(tableId).insertRow();

        for (let colIndex = 0; colIndex < length; colIndex++) {
            document.getElementById(tableId).rows[rowIndex].insertCell();
            document.getElementById(tableId).rows[rowIndex].cells[colIndex].innerHTML =
                "<span>" + cells[rowIndex][colIndex] + "</span>";
            document.getElementById(tableId).rows[rowIndex].cells[colIndex].firstChild.style.display = "none";
            document.getElementById(tableId).rows[rowIndex].cells[colIndex]
                .addEventListener("click", function () {
                    triggerCellClick(document.getElementById(tableId).rows[rowIndex].cells[colIndex]);
                });
        }
    }
}

function generateGameBoardMatrix(length) {
    var values = [];
    var cells = [];

    for (let value = 0; value < length * 2; value++) {
        values.push(value);
        values.push(value);
    }

    var shuffled = shuffleArray(values);

    return matrixWithInsertedValues(shuffled, length);
}

function shuffleArray(arr) {
    var arrCopy = arr.slice();
    var shuffled = [];

    for (let index = 0; index < arr.length; index++) {
        var randomPlace = Math.floor(Math.random() * arrCopy.length);
        shuffled.push(arrCopy.splice(randomPlace, 1)[0]);
    }

    return shuffled;
}

function matrixWithInsertedValues(values, length) {
    var matrix = [];

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        matrix.push([]);

        for (let colIndex = 0; colIndex < length; colIndex++) {
            matrix[rowIndex][colIndex] = values.pop();
        }
    }

    return matrix;
}

function triggerCellClick(cell) {
    if (guessCells.indexOf(cell) === -1 && revealedCells.indexOf(cell) === -1) {
        if (cell.firstChild.style.display === "none" && guessCells.length < 2) {
        } else if (guessCells.length === 2 &&
            guessCells[0].firstChild.innerHTML === guessCells[1].firstChild.innerHTML) {
                revealedCells.push(guessCells[0]);
                revealedCells.push(guessCells[1]);
            guessCells = [];
        } else if (guessCells.length === 2) {
            guessCells[0].firstChild.style.display = "none";
            guessCells[1].firstChild.style.display = "none";
            guessCells = [];
        }

        cell.firstChild.style.display = "";
        guessCells.push(cell);
    }
}