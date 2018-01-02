"use strict"

var guessCells = [];
var revealed = 0;
var refreshTimer = {};
var countDown = {};

window.onload = function init() {
    const METADATA = {
        length: 4,
        tableId: "game-board",
        timerId: "timer",
        displayNoneStyle: "none",
        startButtonId: "startGame",
        chooseBoardButtonId: "chooseBoard",
        optionsModalId: "sizeOptionsModal",
        twoMinsInMS: 120000
    }

    const imgNames = {
        0: "1.png",
        1: "2.png",
        2: "3.png",
        3: "4.png",
        4: "5.png",
        5: "6.png",
        6: "7.png",
        7: "8.png",
        8: "1.png",
        9: "2.png",
        10: "3.png",
        11: "4.png",
        12: "5.png",
        13: "6.png",
        14: "7.png",
        15: "8.png",
        16: "1.png",
        17: "2.png",
        18: "3.png",
        19: "4.png",
        20: "5.png",
        21: "6.png",
        22: "7.png",
        23: "8.png",
        24: "1.png",
        25: "2.png",
        26: "3.png",
        27: "4.png",
        28: "5.png",
        29: "6.png",
        30: "7.png",
        31: "8.png",
    };

    document.getElementById(METADATA.startButtonId).disabled = true;
    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
    initModalBody();
    setPageEventHandlers(METADATA, imgNames);
}

function initModalBody() {
    const lengths = [4, 6, 8];

    lengths.forEach(function (length) {
        let curTableInnerHTML = "<div><h3>" +
            length +
            " X " +
            length +
            "</h3><table data-length-value=\"" + length + "\" id=\"length" +
            length +
            "\">";

        for (let rowIndex = 0; rowIndex < length; rowIndex++) {
            curTableInnerHTML += "<tr>";

            for (let colIndex = 0; colIndex < length; colIndex++) {
                curTableInnerHTML += "<td></td>"
            }

            curTableInnerHTML += "</tr>";
        }

        curTableInnerHTML += "</table></div>";

        document.getElementsByClassName("modal-body")[0].innerHTML += curTableInnerHTML;
    });
}

function setPageEventHandlers(METADATA, imgNames) {
    document.getElementById(METADATA.startButtonId).onclick = startButtonEventHandler(METADATA, imgNames);

    document.getElementById(METADATA.chooseBoardButtonId).onclick = function () {
        document.getElementById(METADATA.optionsModalId).style.display = "block";
    };

    document.getElementsByClassName("close")[0].onclick = function () {
        document.getElementById(METADATA.optionsModalId).style.display = METADATA.displayNoneStyle;
    };

    Array.from(document.querySelectorAll(".modal-body table")).forEach(tableClickHandler(METADATA, imgNames))

    window.onclick = function (event) {
        let modal = document.getElementById(METADATA.optionsModalId);

        if (event.target === modal) {
            modal.style.display = METADATA.displayNoneStyle;
        }
    }
}

function tableClickHandler(METADATA, imgNames) {
    return function (element) {
        element.onclick = function chooseLength(event) {

            let elementClicked = event.target;

            // Find table element of cell clicked.
            while (!elementClicked.getAttribute("data-length-value")) {
                elementClicked = elementClicked.parentNode;
            }

            METADATA.length = elementClicked.getAttribute("data-length-value");
            document.getElementsByClassName("close")[0].dispatchEvent(new Event("click"));
            resetGame(METADATA);
        };
    }
}

function resetGame(METADATA) {
    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
    clearInterval(refreshTimer);
    countDown = {};
    document.getElementById(METADATA.startButtonId).disabled = false;
    document.getElementById(METADATA.tableId).innerHTML = "";
}

function startButtonEventHandler(METADATA, imgNames) {
    return function startButtonClick(eventHandler) {
        let cells = generateGameBoardMatrix(METADATA.length, imgNames);
        initBoardUI(METADATA, cells);
        displayAllCellsTemporarily(2000, METADATA);

        // Remove this handler.
        eventHandler.target.removeEventListener(eventHandler.type, startButtonClick);
        eventHandler.target.disabled = true;
    }
}

function displayAllCellsTemporarily(milliseconds, METADATA) {
    let showAllCells = triggerAllCellsDisplay(true, METADATA);
    let hideAllCells = triggerAllCellsDisplay(false, METADATA);

    showAllCells();
    setTimeout(hideAllCells, milliseconds);
}

function triggerAllCellsDisplay(toShow, METADATA) {
    return function () {
        const displayValue = toShow ? "" : "none";

        Array.from(document.getElementById(METADATA.tableId).rows).forEach(function (row) {
            Array.from(row.cells).forEach(function (cell) {
                cell.firstChild.style.display = displayValue;
            })
        });
    }
}

function initBoardUI(METADATA, cells) {
    let table = document.getElementById(METADATA.tableId);
    table.innerHTML = "";

    cells.forEach(function (row, rowIndex) {
        let rowDOM = table.insertRow(rowIndex);

        row.forEach(function (cell, colIndex) {
            let cellDOM = rowDOM.insertCell();
            initCell(cellDOM, cells[rowIndex][colIndex], METADATA);
        })
    });
}

function isEmpty(obj) {
    return JSON.stringify(obj) === "{}";
}

function initCell(cellDOM, cellObj, METADATA) {
    let styleValues = {
        display: "none",
        width: "90px",
        height: "90px",
        margin: "auto"
    };

    cellDOM.innerHTML =
        "<img src=\"" + cellObj.imgURL + "\" />";

    for (let property in styleValues) {
        cellDOM.firstChild.style[property] = styleValues[property];
    }

    cellDOM.onclick = function cellClickHandler() {
        setTimer(METADATA);
        triggerCellClick(cellObj, METADATA);
    };
}

function setTimer(METADATA) {
    if (isEmpty(countDown)) {
        countDown = new Date(METADATA.twoMinsInMS);
        refreshTimer = setInterval(function () {
            countDown = new Date(countDown.getTime() - 1000);
            document.getElementById(METADATA.timerId).innerHTML = countDown.toUTCString().split(' ')[4];

            if (countDown.getTime() === 0) {
                clearInterval(refreshTimer);
            }
        }, 1000);
    }
}

function generateGameBoardMatrix(length, imgNames) {
    let values = [];

    // Twice push() because memory game holds each value twice.
    for (let index = 0; index < (length * length / 2); index++) {
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
    const imagesDirectory = "images";

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        matrix.push([]);

        for (let colIndex = 0; colIndex < length; colIndex++) {
            let value = values.pop();

            matrix[rowIndex].push(new Tile(
                value,
                imagesDirectory + "/" + imgNames[value],
                rowIndex,
                colIndex
            ));
        }
    }

    return matrix;
}

function triggerCellClick(cell, METADATA) {
    cell.clicks++;

    if (isCellRevealed(cell)) {

        if (guessCells.length === 2) {

            if (!guessCells[0].pairFound) {
                triggerCellDisplay(guessCells[0], METADATA);
                triggerCellDisplay(guessCells[1], METADATA);
            }

            guessCells = [];
        }

        triggerCellDisplay(cell, METADATA);
        guessCells.push(cell);

        if (isPairFound(guessCells)) {
            guessCells[0].pairFound = true;
            guessCells[1].pairFound = true;
            revealed += 2;

            if (revealed === METADATA.length * METADATA.length) {
                clearInterval(refreshTimer);
            }
        }
    }
}

function triggerCellDisplay(cell, METADATA) {
    let cellStyle = document.getElementById(METADATA.tableId).rows[cell.row].cells[cell.column].firstChild.style;
    cellStyle.display = cellStyle.display === METADATA.displayNoneStyle ? "" : METADATA.displayNoneStyle;
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