"use strict"

var guessCells = [];
var revealed = 0;
var startTime = {};
var refreshTimer = {};

window.onload = function init() {
    const constsObj = {
        length: 4,
        tableId: "game-board",
        timerId: "timer",
        displayNoneStyle: "none"
    }

    const imgNames = {
        0: "1.png",
        1: "2.png",
        2: "3.png",
        3: "4.png",
        4: "5.png",
        5: "6.png",
        6: "7.png",
        7: "8.png"
    };

    var cells = generateGameBoardMatrix(constsObj.length, imgNames);
    initBoardUI(constsObj, cells);
}

function initBoardUI(constsObj, cells) {
    var table = document.getElementById(constsObj.tableId);

    cells.forEach(function (row, rowIndex) {
        let rowDOM = table.insertRow(rowIndex);

        row.forEach(function (cell, colIndex) {
            let cellDOM = rowDOM.insertCell();
            initCell(cellDOM, cells[rowIndex][colIndex], constsObj, startTime);
        })
    });
}

function isEmpty(obj) {
    return JSON.stringify(obj) === "{}";
}

function initCell(cellDOM, cellObj, constsObj, startTime) {
    let styleValues = {
        display: "none",
        width: "90px",
        height: "90px",
        margin: "auto"
    };

    cellDOM.innerHTML =
        "<img src=" + cellObj.imgURL + " />";

    for (let property in styleValues) {
        cellDOM.firstChild.style[property] = styleValues[property];

        cellDOM.addEventListener("click", function () {
            setTimer(constsObj);
            triggerCellClick(cellObj, constsObj);
        });
    }
}

function setTimer(constsObj) {
    if (isEmpty(startTime)) {
        startTime = new Date();

        refreshTimer = setInterval(function () {
            updateTimer(constsObj.timerId, startTime);
        }, 1000);
    }

    if (revealed === constsObj.length * constsObj.length) {
        clearInterval(refreshTimer);
    }
}

function updateTimer(timerId, startTime) {
    document.getElementById(timerId).innerHTML =
        new Date(new Date() - startTime).toUTCString().split(' ')[4];
}

function generateGameBoardMatrix(length, imgNames) {
    let values = [];

    // Twice push() because memory game holds  each value twice.
    for (let index = 0; index < (length * 2); index++) {
        values.push(index);
        values.push(index);
    }

    let shuffledValues = shuffled(values);

    return matrixWithInsertedValues(shuffledValues, length, imgNames);
}

function shuffled(arr) {
    let arrCopy = arr.slice();
    let shuffled = [];

    for (let index = 0; index < arr.length; index++) {
        let randomPlace = Math.floor(Math.random() * arrCopy.length);
        shuffled.push(arrCopy.splice(randomPlace, 1)[0]);
    }

    return shuffled;
}

function matrixWithInsertedValues(values, length, imgNames) {
    let matrix = [];
    let imagesDirectory = "images";

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        matrix.push([]);

        for (let colIndex = 0; colIndex < length; colIndex++) {
            let value = values.pop();

            matrix[rowIndex][colIndex] = new Tile(
                value,
                imagesDirectory + "/" + imgNames[value],
                rowIndex,
                colIndex
            );
        }
    }

    return matrix;
}

function triggerCellClick(cell, constsObj) {
    cell.clicks++;

    if (isCellRevealed(cell)) {

        if (guessCells.length === 2) {

            if (!guessCells[0].pairFound) {
                triggerCellDisplay(guessCells[0], constsObj);
                triggerCellDisplay(guessCells[1], constsObj);
            }

            guessCells = [];
        }

        triggerCellDisplay(cell, constsObj);
        guessCells.push(cell);

        if (isPairFound(guessCells)) {
            guessCells[0].pairFound = true;
            guessCells[1].pairFound = true;
            revealed += 2;
        }
    }
}

function triggerCellDisplay(cell, constsObj) {
    var cellStyle = document.getElementById(constsObj.tableId).rows[cell.row].cells[cell.column].firstChild.style;

    if (cellStyle.display === constsObj.displayNoneStyle) {
        cellStyle.display = "";
    } else {
        cellStyle.display = constsObj.displayNoneStyle;
    }
}

function isCellRevealed(cell) {
    return guessCells.indexOf(cell) === -1 && !cell.pairFound;
}

function isPairFound(guessCells) {
    return guessCells.length === 2 && guessCells[0].imgURL === guessCells[1].imgURL;
}

function Tile(value, imgURL, row, column) {
    this.value = value;
    this.imgURL = imgURL;
    this.row = row;
    this.column = column;
    this.clicks = 0;
    this.pairFound = false;
}