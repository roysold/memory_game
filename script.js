"use strict"

var guessCells = [];

window.onload = function init() {
    var length = 4;
    var tableId = "game-board";
    var timerId = "timer"

    var cells = generateGameBoardMatrix(length);
    initBoardUI(tableId, length, cells, timerId);
}

function initBoardUI(tableId, length, cells, timerId) {
    var table = document.getElementById(tableId);
    var startTime;

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        var row = table.insertRow();

        for (let colIndex = 0; colIndex < length; colIndex++) {
            row.insertCell();
            row.cells[colIndex].innerHTML =
                "<span>" + cells[rowIndex][colIndex].value + "</span>";
            row.cells[colIndex].firstChild.style.display = "none";
            row.cells[colIndex].addEventListener("click", function () {
                cells[rowIndex][colIndex].clicks++;

                if (!startTime) {
                    startTime = new Date();
                    updateTimer(timerId, startTime);

                    setInterval(function () {
                        updateTimer(timerId, startTime);
                    }, 1000);
                }

                triggerCellClick(cells[rowIndex][colIndex], tableId);
            });
        }
    }
}

function updateTimer(timerId, startTime) {
    document.getElementById(timerId).innerHTML =
        new Date(new Date() - startTime).toUTCString().split(' ')[4];
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
            matrix[rowIndex][colIndex] = new Tile(values.pop(), "#", rowIndex, colIndex);
        }
    }

    return matrix;
}

function triggerCellClick(cell, tableId) {
    if (isCellRevealed(cell)) {
        if (guessCells.length === 2) {
            if (!guessCells[0].pairFound) {
                triggerCellDisplay(guessCells[0], tableId);
                triggerCellDisplay(guessCells[1], tableId);
            }
            guessCells = [];
        }

        triggerCellDisplay(cell, tableId);
        guessCells.push(cell);

        if (guessCells.length === 2 && guessCells[0].value === guessCells[1].value) {
            guessCells[0].pairFound = true;
            guessCells[1].pairFound = true;
        }
    }
}

function isCellRevealed(cell) {
    return guessCells.indexOf(cell) === -1 && !cell.pairFound;
}

function triggerCellDisplay(cell, tableId) {
    var cellStyle = document.getElementById(tableId).rows[cell.row].cells[cell.column].firstChild.style;

    if (cellStyle.display === "none") {
        cellStyle.display = "";
    } else {
        cellStyle.display = "none";
    }
}

function Tile(value, imgURL, row, col) {
    this.value = value;
    this.imgURL = imgURL;
    this.clicks = 0;
    this.pairFound = false;
    this.row = row;
    this.column = col;
}