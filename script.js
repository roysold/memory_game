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
            var cell = row.insertCell();
            cell.innerHTML =
                "<img src=" + cells[rowIndex][colIndex].imgURL + " />";
            cell.firstChild.style.display = "none";
            cell.firstChild.style.width = "90px";
            cell.firstChild.style.height = "90px";
            cell.firstChild.style.margin = "auto";

            cell.addEventListener("click", function () {

                if (!startTime) {
                    startTime = new Date();

                    startTimer(timerId, startTime);
                }

                triggerCellClick(cells[rowIndex][colIndex], tableId);
            });
        }
    }
}

function startTimer(timerId, startTime) {
    updateTimer(timerId, startTime);

    setInterval(function () {
        updateTimer(timerId, startTime);
    }, 1000);
}

function updateTimer(timerId, startTime) {
    document.getElementById(timerId).innerHTML =
        new Date(new Date() - startTime).toUTCString().split(' ')[4];
}

function generateGameBoardMatrix(length) {
    var values = [];

    // for (let value = 0; value < (length * length) / 2; value++) {
    //     values.push(value);
    //     values.push(value);
    // }

    values.push(new Tile("images/a.png"));
    values.push(new Tile("images/a.png"));
    values.push(new Tile("images/b.png"));
    values.push(new Tile("images/b.png"));
    values.push(new Tile("images/c.png"));
    values.push(new Tile("images/c.png"));
    values.push(new Tile("images/d.png"));
    values.push(new Tile("images/d.png"));
    values.push(new Tile("images/e.png"));
    values.push(new Tile("images/e.png"));
    values.push(new Tile("images/f.png"));
    values.push(new Tile("images/f.png"));
    values.push(new Tile("images/g.png"));
    values.push(new Tile("images/g.png"));
    values.push(new Tile("images/h.png"));
    values.push(new Tile("images/h.png"));

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
            matrix[rowIndex][colIndex].row = rowIndex;
            matrix[rowIndex][colIndex].column = colIndex;
        }
    }

    return matrix;
}

function triggerCellClick(cell, tableId) {
    cell.clicks++;

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

        if (guessCells.length === 2 && guessCells[0].imgURL === guessCells[1].imgURL) {
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

function Tile(imgURL) {
    this.imgURL = imgURL;
    this.clicks = 0;
    this.pairFound = false;
}