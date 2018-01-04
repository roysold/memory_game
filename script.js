"use strict"

window.onload = function init() {
    const tableId = "game-board";
    const timerId = "timer";
    const startButtonId = "startGame";
    const chooseBoardButtonId = "chooseBoard";
    const optionsModalId = "sizeOptionsModal";
    const modalBodyClass = "modal-body";
    const resultId = "result";
    const displayNoneStyle = "none";
    const length = 4;
    const timePerGame = 120000;
    const gameLengths = [4, 6, 8];

    let gameSessionData = {
        guessCells: [],
        revealed: 0,
        refreshTimer: {},
        countDown: {}
    }


    initElements(startButtonId, chooseBoardButtonId, timerId, timePerGame)
    initModalBody(gameLengths, modalBodyClass);
    setPageEventHandlers(chooseBoardButtonId, optionsModalId, displayNoneStyle, modalBodyClass);
}

function initElements(startButtonId, chooseBoardButtonId, timerId, timePerGame) {
    document.getElementById(startButtonId).disabled = true;
    setCursorToNotAllowed(startButtonId);
    setCursorToPointer(chooseBoardButtonId);
    document.getElementById(timerId).innerHTML =
        dateFormatString(new Date(timePerGame));
}

function dateFormatString(date) {
    return date.toUTCString().split(" ")[4].substring(3);
}

function changeCursorStyle(elementId, cursorStyle) {
    document.getElementById(elementId).style.cursor = cursorStyle;
}

function setCursorToPointer(elementId) {
    changeCursorStyle(elementId, "pointer");
}

function setCursorToNotAllowed(elementId) {
    changeCursorStyle(elementId, "not-allowed");
}

function initModalBody(gameLengths, modalBodyClass) {

    gameLengths.forEach(function (length) {
        let DOMElements = {
            modalBody: document.getElementsByClassName(modalBodyClass)[0],
            div: document.createElement("div"),
            tableLengthTitle: document.createElement("h3"),
            table: document.createElement("table")
        };

        // modal > div > h3, table
        DOMElements.div.appendChild(DOMElements.tableLengthTitle);
        DOMElements.div.appendChild(DOMElements.table);
        DOMElements.modalBody.appendChild(DOMElements.div);

        DOMElements.tableLengthTitle.innerHTML = length + " X " + length;
        DOMElements.table.setAttribute("data-length", length);

        for (let rowIndex = 0; rowIndex < length; rowIndex++) {
            let curRow = DOMElements.table.insertRow();

            for (let colIndex = 0; colIndex < length; colIndex++) {
                curRow.insertCell();
            }
        }
    });
}

function setPageEventHandlers(chooseBoardButtonId, optionsModalId, displayNoneStyle, modalBodyClass) {
    document.getElementById(chooseBoardButtonId).onclick = function () {
        document.getElementById(optionsModalId).style.display = "block";
        document.getElementById(chooseBoardButtonId).innerHTML = "Reset";
    };

    document.getElementsByClassName("close")[0].onclick = function () {
        document.getElementById(optionsModalId).style.display = displayNoneStyle;
    };

    Array.from(document.querySelectorAll("." + modalBodyClass + " table"))
        .forEach(tableOptionClickHandler());

    window.onclick = function (event) {
        let modal = document.getElementById(optionsModalId);

        if (event.target === modal) {
            modal.style.display = displayNoneStyle;
        }
    }
}

function tableOptionClickHandler() {
    return function (element) {
        element.onclick = function chooseLength(event) {

            let elementClicked = event.target;
            let tableLengthAttribute = "data-length";

            // Find table element of cell clicked.
            while (!elementClicked.getAttribute(tableLengthAttribute)) {
                elementClicked = elementClicked.parentNode;
            }

            length = elementClicked.getAttribute(tableLengthAttribute);
            document.getElementsByClassName("close")[0].dispatchEvent(new Event("click"));
            resetGame();
        };
    }
}

function resetGame(countDown, guessCells, revealed, timerId, startButtonId, resultId, tableId, length) {
    clearInterval(METADATA.refreshTimer);
    countDown = {};
    guessCells = [];
    revealed = 0;

    document.getElementById(timerId).style.display = "";
    document.getElementById(timerId).innerHTML = dateFormatString(new Date(timePerGame));
    document.getElementById(startButtonId).disabled = false;
    setCursorToPointer(startButtonId);
    document.getElementById(resultId).innerHTML = "";
    document.getElementById(tableId).innerHTML = "";
    setCursorToNotAllowed(tableId);

    let values = gameValues(length);
    let cells = insertValuesIntoMatrix(values, imgNames);
    document.getElementById(startButtonId).onclick = startButtonEventHandler(values);

    initBoardUI(METADATA, cells);
}

function startButtonEventHandler(tableId, values) {
    return function startButtonClick(eventHandler) {
        displayAllCellsTemporarily(2000, METADATA, function () {
            triggerAllCellsDisplay(true, METADATA);

            animateShuffle(METADATA, function () {
                let shuffledCells = insertValuesIntoMatrix(shuffle(values));
                initBoardUI(METADATA, shuffledCells);
                addCellClickEventHandlers(METADATA, shuffledCells);
                setCursorToPointer(tableId);
            });
        });

        // Remove this handler.
        eventHandler.target.removeEventListener(eventHandler.type, startButtonClick);
        eventHandler.target.disabled = true;
        setCursorToNotAllowed(eventHandler.target.getAttribute("id"));
    }
}

function animateShuffle(tableId, callback) {
    let tableDOMElement = document.getElementById(tableId);
    tableDOMElement.classList.add("table-spin");

    Array.from(tableDOMElement.rows).forEach(function (row, rowIndex) {
        row.classList.add(rowIndex % 2 == 0 ? "even-row" : "odd-row");
        Array.from(row.cells).forEach(function (cell, cellIndex) {
            cell.classList.add(cellIndex % 2 == 0 ? "even-cell" : "odd-cell");
            cell.firstChild.classList.add("fade");
        });
    });

    document.getElementById(tableId).addEventListener("animationend", callback, false);
}

function displayAllCellsTemporarily(milliseconds, callback) {
    triggerAllCellsDisplay(true, METADATA);

    setTimeout(function () {
        callback();
    }, milliseconds);
}

function triggerAllCellsDisplay(toShow, displayNoneStyle, tableId) {
    const displayValue = toShow ? "" : displayNoneStyle;

    Array.from(document.querySelectorAll("#" + tableId + " td img")).forEach(function (img) {
        img.style.display = displayValue;
    });
}

function initBoardUI(tableId, cells) {
    let table = document.getElementById(tableId);
    table.innerHTML = "";

    cells.forEach(function (row, rowIndex) {
        let rowDOM = table.insertRow(rowIndex);

        row.forEach(function (cell, cellIndex) {
            let cellDOM = rowDOM.insertCell();
            initCellImg(cellDOM, cells[rowIndex][cellIndex], METADATA);
        })
    });
}

function initCellImg(cellDOM, cellObj, METADATA) {
    let imgElement = document.createElement("img");
    imgElement.style.display = displayNoneStyle;
    imgElement.setAttribute("src", cellObj.imgURL);

    cellDOM.appendChild(imgElement);
}

function addCellClickEventHandlers(tableId, cells) {
    Array.from(document.getElementById(tableId).rows).forEach(function (row, rowIndex) {
        Array.from(row.cells).forEach(function (cell, cellIndex) {
            cell.onclick = function cellClickHandler() {
                if (!countDown) {
                    setTimer(METADATA);
                }
                triggerCellClick(cells[rowIndex][cellIndex], METADATA);
            };
        });
    });
}

function setTimer(timerId, countDown, refreshTimer) {
    countDown = new Date(timePerGame);
    refreshTimer = setInterval(function () {
        countDown = new Date(countDown.getTime() - 1000);
        document.getElementById(timerId).innerHTML = dateFormatString(countDown);

        if (countDown.getTime() === 0) {
            clearInterval(refreshTimer);
            endGame(false, METADATA);
        }
    }, 1000);
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

function shuffle(arr) {
    let arrCopy = arr.slice();
    let shuffled = [];

    for (let index = 0; index < arr.length; index++) {
        let randomPlace = Math.floor(Math.random() * arrCopy.length);
        shuffled.push(arrCopy.splice(randomPlace, 1)[0]);
    }

    return shuffled;
}

function insertValuesIntoMatrix(values) {
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

function triggerCellClick(cell, gameSessionData) {
    cell.clicks++;

    if (isCellClickable(cell, guessCells)) {
        if (gameSessionData.guessCells.length === 2) {
            if (!gameSessionData.guessCells[0].pairFound) {
                toggleCellDisplay(false, gameSessionData.guessCells[0]);
                toggleCellDisplay(false, gameSessionData.guessCells[1]);
            }

            guessCells = [];
        }

        toggleCellDisplay(true, cell);

        guessCells.push(cell);

        if (isPairFound(gameSessionData.guessCells)) {
            gameSessionData.guessCells[0].pairFound = true;
            gameSessionData.guessCells[1].pairFound = true;
            gameSessionData.revealed += 2;

            if (gameSessionData.revealed === length * length - 2) {
                clearInterval(gameSessionData.refreshTimer);
                endGame(true, METADATA);
                triggerAllCellsDisplay(true, METADATA)
            }
        }
    }
}

function isCellClickable(cell, guessCells) {
    // True if cell's pair hasn't been found and if cell isn't already guessed in the current guess.
    return !cell.pairFound && !(guessCells.length === 1 && guessCells.indexOf(cell) >= 0);
}

function endGame(hasWon, tableId, timerId, displayNoneStyle) {
    Array.from(document.querySelectorAll("#" + tableId + " td")).forEach(function (cell) {
        cell.onclick = undefined;
    });

    setCursorToNotAllowed(tableId);
    document.getElementById(timerId).style.display = displayNoneStyle;
    displayResult(hasWon, METADATA);
}

function displayResult(hasWon, timePerGame, countDown, resultId) {
    let textColor = "";
    let resultText = "";

    if (!hasWon) {
        textColor = "red";
        resultText = "You suck.";
    } else {
        textColor = "green";

        let timeValues = dateFormatString(new Date(new Date(timePerGame) - countDown)).split(":");
        let mins = parseInt(timeValues[0]);
        let secs = parseInt(timeValues[1]);

        resultText = "Good job! It took you " +
            (mins === 0 ? "" : mins + " min ") +
            (secs === 0 ? "" : secs + " sec") +
            ".";
    }

    let resultDOMElement = document.getElementById(resultId);
    resultDOMElement.style.color = textColor;
    resultDOMElement.innerHTML = resultText;
}

function toggleCellDisplay(toDisplay, cell, tableId, displayNoneStyle) {
    let imgStyle = document.getElementById(tableId)
        .rows[cell.row]
        .cells[cell.column]
        .firstChild
        .style;

    imgStyle.display = toDisplay ? "" : displayNoneStyle;
}

function isPairFound(guessCells) {
    return guessCells.length === 2 &&
        guessCells[0].imgURL === guessCells[1].imgURL;
}

function Tile(value, imgURL, row, column) {
    this.value = value;
    this.imgURL = imgURL;
    this.row = row;
    this.column = column;
    this.clicks = 0;
    this.pairFound = false;
}