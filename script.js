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
        twoMinsInMS: 120000,
        resultId: "result",
        gameLengths: [4, 6, 8],
        modalBodyClass: "modal-body"
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

    initElements(METADATA)
    initModalBody(METADATA);
    setPageEventHandlers(METADATA, imgNames);
}

function initElements(METADATA) {
    document.getElementById(METADATA.startButtonId).disabled = true;
    document.getElementById(METADATA.startButtonId).style.cursor = "not-allowed";
    document.getElementById(METADATA.chooseBoardButtonId).cursor = "pointer";
    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
}

function initModalBody(METADATA) {

    METADATA.gameLengths.forEach(function (length) {
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

        document.getElementsByClassName(METADATA.modalBodyClass)[0].innerHTML += curTableInnerHTML;
    });
}

function setPageEventHandlers(METADATA, imgNames) {

    document.getElementById(METADATA.chooseBoardButtonId).onclick = function () {
        document.getElementById(METADATA.optionsModalId).style.display = "block";
        document.getElementById(METADATA.chooseBoardButtonId).innerHTML = "Reset";
    };

    document.getElementsByClassName("close")[0].onclick = function () {
        document.getElementById(METADATA.optionsModalId).style.display = METADATA.displayNoneStyle;
    };

    Array.from(document.querySelectorAll("." + METADATA.modalBodyClass, "table"))
        .forEach(tableClickHandler(METADATA, imgNames));

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
            resetGame(METADATA, imgNames);

        };
    }
}

function resetGame(METADATA, imgNames) {
    clearInterval(refreshTimer);
    countDown = {};
    guessCells = [];
    revealed = 0;

    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
    document.getElementById(METADATA.startButtonId).disabled = false;
    document.getElementById(METADATA.startButtonId).style.cursor = "pointer";
    document.getElementById(METADATA.resultId).innerHTML = "";
    document.getElementById(METADATA.tableId).innerHTML = "";
    document.getElementById(METADATA.tableId).style.cursor = "not-allowed";

    let values = gameValues(METADATA.length);
    let cells = matrixWithInsertedValues(values, imgNames);
    document.getElementById(METADATA.startButtonId).onclick = startButtonEventHandler(METADATA, imgNames, values);

    initBoardUI(METADATA, cells);
}

function startButtonEventHandler(METADATA, imgNames, values) {
    return function startButtonClick(eventHandler) {
        displayAllCellsTemporarily(2000, METADATA, function () {
            let shuffledCells = matrixWithInsertedValues(shuffled(values), imgNames);
            initBoardUI(METADATA, shuffledCells);
            animateShuffle(METADATA, function () {
                addCellClickEventHandlers(METADATA, shuffledCells);
                document.getElementById(METADATA.tableId).style.cursor = "pointer";
            });
        });

        // Remove this handler.
        eventHandler.target.removeEventListener(eventHandler.type, startButtonClick);
        eventHandler.target.disabled = true;
        eventHandler.target.style.cursor = "not-allowed";
    }
}

function animateShuffle(METADATA, callback) {
    document.getElementById(METADATA.tableId).classList.add("table-spin");

    Array.from(document.getElementById(METADATA.tableId).rows).forEach(function (row, rowIndex) {
        row.classList.add(rowIndex % 2 == 0 ? "even-row" : "odd-row");
        Array.from(row.cells).forEach(function (cell, cellIndex) {
            cell.classList.add(cellIndex % 2 == 0 ? "even-cell" : "odd-cell");
        });
    });

    document.getElementById(METADATA.tableId).addEventListener("animationend", callback, false);
}

function displayAllCellsTemporarily(milliseconds, METADATA, callback) {
    let showAllCells = triggerAllCellsDisplay(true, METADATA);
    let hideAllCells = triggerAllCellsDisplay(false, METADATA);

    showAllCells();

    setTimeout(function () {
        hideAllCells();
        callback();
    }, milliseconds);
}

function triggerAllCellsDisplay(toShow, METADATA) {
    return function () {
        const displayValue = toShow ? "" : METADATA.displayNoneStyle;

        Array.from(document.querySelectorAll("#" + METADATA.tableId + " td img")).forEach(function (img) {
            img.style.display = displayValue;
        })
    }
}

function initBoardUI(METADATA, cells) {
    let table = document.getElementById(METADATA.tableId);
    table.innerHTML = "";

    cells.forEach(function (row, rowIndex) {
        let rowDOM = table.insertRow(rowIndex);

        row.forEach(function (cell, cellIndex) {
            let cellDOM = rowDOM.insertCell();
            initCellImg(cellDOM, cells[rowIndex][cellIndex], METADATA);
        })
    });
}

function isEmpty(obj) {
    return JSON.stringify(obj) === "{}";
}

function initCellImg(cellDOM, cellObj, METADATA) {
    let imgElement = document.createElement("img");
    imgElement.setAttribute("src", cellObj.imgURL);
    imgElement.style.display = METADATA.displayNoneStyle;

    cellDOM.appendChild(imgElement);
}

function addCellClickEventHandlers(METADATA, cells) {
    Array.from(document.getElementById(METADATA.tableId).rows).forEach(function (row, rowIndex) {
        Array.from(row.cells).forEach(function (cell, cellIndex) {

            cell.onclick = function cellClickHandler() {
                setTimer(METADATA);
                triggerCellClick(cells[rowIndex][cellIndex], METADATA);
            };
        });
    });
}

function setTimer(METADATA) {
    if (isEmpty(countDown)) {
        countDown = new Date(METADATA.twoMinsInMS);
        refreshTimer = setInterval(function () {
            countDown = new Date(countDown.getTime() - 1000);
            document.getElementById(METADATA.timerId).innerHTML = countDown.toUTCString().split(' ')[4];

            if (countDown.getTime() === 0) {
                clearInterval(refreshTimer);
                endGame(false, METADATA);
            }
        }, 1000);
    }
}

function gameValues(length) {
    let values = [];

    // Twice push() because memory game holds each value twice.
    for (let index = 0; index < (length * length / 2); index++) {
        values.push(index);
        values.push(index);
    }

    return values;
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

function matrixWithInsertedValues(values, imgNames) {
    let matrix = [];
    let valuesCopy = values.slice();
    const imagesDirectory = "images";
    const length = Math.sqrt(values.length);

    for (let rowIndex = 0; rowIndex < length; rowIndex++) {
        matrix.push([]);

        for (let colIndex = 0; colIndex < length; colIndex++) {
            let value = valuesCopy.pop();

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

            if (revealed === METADATA.length * METADATA.length - 2) {
                clearInterval(refreshTimer);
                endGame(true, METADATA);
                triggerAllCellsDisplay(true, METADATA)();
            }
        }
    }
}

function endGame(hasWon, METADATA) {
    document.getElementById(METADATA.tableId).style.cursor = "not-allowed";
    displayResult(hasWon, METADATA);
}

function displayResult(hasWon, METADATA) {
    let textColor = "";
    let resultText = "";

    if (hasWon) {
        textColor = "green";

        let timeValues = new Date(new Date(METADATA.twoMinsInMS) - countDown)
            .toUTCString()
            .split(" ")[4]
            .split(":");
        let mins = parseInt(timeValues[1]);
        let secs = parseInt(timeValues[2]);

        resultText = "Good job! It took you " +
            (mins === 0 ? "" : mins + " min ") +
            (secs === 0 ? "" : secs + " sec") +
            ".";

    } else {
        textColor = "red";
        resultText = "You lost because you suck.";
    }

    document.getElementById(METADATA.resultId).style.color = textColor;
    document.getElementById(METADATA.resultId).innerHTML = resultText;
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