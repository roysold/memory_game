"use strict"


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
        modalBodyClass: "modal-body",
        guessCells: [],
        revealed: 0,
        refreshTimer: {},
        countDown: {}
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
    setCursorToNotAllowed(METADATA.startButtonId);
    setCursorToPointer(METADATA.chooseBoardButtonId);
    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
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

function initModalBody(METADATA) {

    METADATA.gameLengths.forEach(function (length) {
        let DOMElements = {
            modalBody: document.getElementsByClassName(METADATA.modalBodyClass)[0],
            div: document.createElement("div"),
            tableLengthTitle: document.createElement("h3"),
            table: document.createElement("table")
        };

        // modal > div > h3, table
        DOMElements.div.appendChild(DOMElements.tableLengthTitle);
        DOMElements.div.appendChild(DOMElements.table);
        DOMElements.modalBody.appendChild(DOMElements.div);

        DOMElements.table.setAttribute("id", "tableOption" + length);
        DOMElements.table.setAttribute("data-length-value", length);

        for (let rowIndex = 0; rowIndex < length; rowIndex++) {
            let curRow = DOMElements.table.insertRow();

            for (let colIndex = 0; colIndex < length; colIndex++) {
                curRow.insertCell();
            }
        }
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

    Array.from(document.querySelectorAll("." + METADATA.modalBodyClass + " table"))
        .forEach(tableOptionClickHandler(METADATA, imgNames));

    window.onclick = function (event) {
        let modal = document.getElementById(METADATA.optionsModalId);

        if (event.target === modal) {
            modal.style.display = METADATA.displayNoneStyle;
        }
    }
}

function tableOptionClickHandler(METADATA, imgNames) {
    return function (element) {
        element.onclick = function chooseLength(event) {

            let elementClicked = event.target;
            let tableLengthAttribute = "data-length-value";

            // Find table element of cell clicked.
            while (!elementClicked.getAttribute(tableLengthAttribute)) {
                elementClicked = elementClicked.parentNode;
            }

            METADATA.length = elementClicked.getAttribute(tableLengthAttribute);
            document.getElementsByClassName("close")[0].dispatchEvent(new Event("click"));
            resetGame(METADATA, imgNames);

        };
    }
}

function resetGame(METADATA, imgNames) {
    clearInterval(METADATA.refreshTimer);
    METADATA.countDown = {};
    METADATA.guessCells = [];
    METADATA.revealed = 0;

    document.getElementById(METADATA.timerId).innerHTML = new Date(METADATA.twoMinsInMS).toUTCString().split(" ")[4];
    document.getElementById(METADATA.startButtonId).disabled = false;
    setCursorToPointer(METADATA.startButtonId);
    document.getElementById(METADATA.resultId).innerHTML = "";
    document.getElementById(METADATA.tableId).innerHTML = "";
    setCursorToNotAllowed(METADATA.tableId);

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
                setCursorToPointer(METADATA.tableId);
            });
        });

        // Remove this handler.
        eventHandler.target.removeEventListener(eventHandler.type, startButtonClick);
        eventHandler.target.disabled = true;
        setCursorToNotAllowed(eventHandler.target.getAttribute("id"));
    }
}

function animateShuffle(METADATA, callback) {
    let tableDOMElement = document.getElementById(METADATA.tableId);
    tableDOMElement.classList.add("table-spin");

    Array.from(tableDOMElement.rows).forEach(function (row, rowIndex) {
        row.classList.add(rowIndex % 2 == 0 ? "even-row" : "odd-row");
        Array.from(row.cells).forEach(function (cell, cellIndex) {
            cell.classList.add(cellIndex % 2 == 0 ? "even-cell" : "odd-cell");
        });
    });

    document.getElementById(METADATA.tableId).addEventListener("animationend", callback, false);
}

function displayAllCellsTemporarily(milliseconds, METADATA, callback) {
    triggerAllCellsDisplay(true, METADATA);

    setTimeout(function () {
        triggerAllCellsDisplay(false, METADATA);
        callback();
    }, milliseconds);
}

function triggerAllCellsDisplay(toShow, METADATA) {
    const displayValue = toShow ? "" : METADATA.displayNoneStyle;

    Array.from(document.querySelectorAll("#" + METADATA.tableId + " td img")).forEach(function (img) {
        img.style.display = displayValue;
    });
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
    if (isEmpty(METADATA.countDown)) {
        METADATA.countDown = new Date(METADATA.twoMinsInMS);
        METADATA.refreshTimer = setInterval(function () {
            METADATA.countDown = new Date(METADATA.countDown.getTime() - 1000);
            document.getElementById(METADATA.timerId).innerHTML = METADATA.countDown.toUTCString().split(' ')[4];

            if (METADATA.countDown.getTime() === 0) {
                clearInterval(METADATA.refreshTimer);
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

    if (!cell.pairFound &&
        !(METADATA.guessCells.length === 1 && cell.row === METADATA.guessCells[0].row && cell.column === METADATA.guessCells[0].column)) {

        if (METADATA.guessCells.length === 2) {

            if (!METADATA.guessCells[0].pairFound) {
                toggleCellDisplay(false, METADATA.guessCells[0], METADATA);
                toggleCellDisplay(false, METADATA.guessCells[1], METADATA);
            }

            METADATA.guessCells = [];
        }

        toggleCellDisplay(true, cell, METADATA);

        METADATA.guessCells.push(cell);

        if (isPairFound(METADATA)) {
            METADATA.guessCells[0].pairFound = true;
            METADATA.guessCells[1].pairFound = true;
            METADATA.revealed += 2;

            if (METADATA.revealed === METADATA.length * METADATA.length - 2) {
                clearInterval(METADATA.refreshTimer);
                endGame(true, METADATA);
                triggerAllCellsDisplay(true, METADATA)
            }
        }
    }
}

function endGame(hasWon, METADATA) {
    Array.from(document.querySelectorAll("#" + METADATA.tableId + " td")).forEach(function (cell) {
        cell.onclick = undefined;
    });

    setCursorToNotAllowed(METADATA.tableId);
    displayResult(hasWon, METADATA);
}

function displayResult(hasWon, METADATA) {
    let textColor = "";
    let resultText = "";

    if (hasWon) {
        textColor = "green";

        let timeValues = new Date(new Date(METADATA.twoMinsInMS) - METADATA.countDown)
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

function toggleCellDisplay(toDisplay, cell, METADATA) {
    let cellStyle = document.getElementById(METADATA.tableId).rows[cell.row].cells[cell.column].firstChild.style;
    cellStyle.display = toDisplay ? "" : METADATA.displayNoneStyle;
}

function isPairFound(METADATA) {
    return METADATA.guessCells.length === 2 && METADATA.guessCells[0].imgURL === METADATA.guessCells[1].imgURL;
}

function Tile(value, imgURL, row, column) {
    this.value = value;
    this.imgURL = imgURL;
    this.row = row;
    this.column = column;
    this.clicks = 0;
    this.pairFound = false;
}