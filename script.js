"use strict"

window.onload = function () {
    const METADATA = {
        length: 4,
        tableId: "game-board",
        timerId: "timer",
        displayNoneStyle: "none",
        startButtonId: "startGame",
        chooseBoardButtonId: "chooseBoard",
        optionsModalId: "sizeOptionsModal",
        timePerGameInMS: 120000,
        resultId: "result",
        gameLengths: [4, 6, 8],
        modalBodyClass: "modal-body",
        numberOfCellsInSet: 2,
        timerIntervalInMS: 1000
    };

    let gameSessionData = {
        guessedCells: [],
        revealed: 0,
        refreshTimer: undefined,
        countDown: undefined
    };

    return function init() {
        initElements()
        initModalBody();
        setPageEventHandlers();
    }

    function initElements() {
        document.getElementById(METADATA.startButtonId).disabled = true;
        setCursorToNotAllowed(METADATA.startButtonId);
        setCursorToPointer(METADATA.chooseBoardButtonId);
        document.getElementById(METADATA.timerId).innerHTML =
            dateFormatString(new Date(METADATA.timePerGameInMS));
    }

    function dateFormatString(date) {
        let mins = date.getMinutes();
        let secs = date.getSeconds();

        return (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
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

    function initModalBody() {
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

    function setPageEventHandlers() {
        document.getElementById(METADATA.chooseBoardButtonId).onclick = function () {
            document.getElementById(METADATA.optionsModalId).style.display = "block";
            document.getElementById(METADATA.chooseBoardButtonId).innerHTML = "Reset";
        };

        document.getElementsByClassName("close")[0].onclick = function () {
            document.getElementById(METADATA.optionsModalId).style.display = METADATA.displayNoneStyle;
        };

        Array.from(document.querySelectorAll("." + METADATA.modalBodyClass + " table"))
            .forEach(function (element) {
                element.onclick = chooseLength;
            });

        window.onclick = function (event) {
            let modal = document.getElementById(METADATA.optionsModalId);

            if (event.target === modal) {
                modal.style.display = METADATA.displayNoneStyle;
            }
        }
    }

    function chooseLength(event) {
        let elementClicked = event.target;
        let tableLengthAttribute = "data-length";

        // Find table element of cell clicked.
        while (!elementClicked.getAttribute(tableLengthAttribute)) {
            elementClicked = elementClicked.parentNode;
        }

        METADATA.length = elementClicked.getAttribute(tableLengthAttribute);
        document.getElementsByClassName("close")[0].dispatchEvent(new Event("click"));
        resetGame();
    }

    function resetGame() {
        clearInterval(gameSessionData.refreshTimer);
        gameSessionData.countDown = undefined;
        gameSessionData.guessedCells = [];
        gameSessionData.revealed = 0;

        document.getElementById(METADATA.timerId).style.display = "";
        document.getElementById(METADATA.timerId).innerHTML = dateFormatString(
            new Date(METADATA.timePerGameInMS)
        );
        document.getElementById(METADATA.startButtonId).disabled = false;
        setCursorToPointer(METADATA.startButtonId);
        document.getElementById(METADATA.resultId).innerHTML = "";
        document.getElementById(METADATA.tableId).innerHTML = "";
        setCursorToNotAllowed(METADATA.tableId);

        let values = gameValues(METADATA.length);
        let cells = insertValuesIntoMatrix(values);
        document.getElementById(METADATA.startButtonId).onclick =
            startButtonEventHandler(values);

        initBoardUI(cells);
    }

    function startButtonEventHandler(values) {
        return function startButtonClick(eventHandler) {
            displayAllCellsTemporarily(2000, function () {
                triggerAllCellsDisplay(true);

                animateShuffle(function () {
                    let shuffledCells = insertValuesIntoMatrix(shuffle(values));
                    initBoardUI(shuffledCells);
                    addCellClickEventHandlers(shuffledCells);
                    setCursorToPointer(METADATA.tableId);
                });
            });

            // Remove this handler.
            eventHandler.target.removeEventListener(eventHandler.type, startButtonClick);
            eventHandler.target.disabled = true;
            setCursorToNotAllowed(eventHandler.target.getAttribute("id"));
        }
    }

    function animateShuffle(callback) {
        let tableDOMElement = document.getElementById(METADATA.tableId);
        tableDOMElement.classList.add("table-spin");

        Array.from(tableDOMElement.rows).forEach(function (row, rowIndex) {
            row.classList.add(rowIndex % 2 == 0 ? "even-row" : "odd-row");

            Array.from(row.cells).forEach(function (cell, cellIndex) {
                cell.classList.add(cellIndex % 2 == 0 ? "even-cell" : "odd-cell");
                cell.firstChild.classList.add("fade");
            });
        });

        document.getElementById(METADATA.tableId).addEventListener(
            "animationend",
            callback,
            false
        );
    }

    function displayAllCellsTemporarily(milliseconds, callback) {
        triggerAllCellsDisplay(true);
        setTimeout(callback, milliseconds);
    }

    function triggerAllCellsDisplay(toShow) {
        const displayValue = toShow ? "" : METADATA.displayNoneStyle;

        Array.from(document.querySelectorAll("#" + METADATA.tableId + " td img"))
            .forEach(function (img) {
                img.style.display = displayValue;
            });
    }

    function initBoardUI(cells) {
        let table = document.getElementById(METADATA.tableId);
        table.innerHTML = "";

        cells.forEach(function (row, rowIndex) {
            let rowDOM = table.insertRow(rowIndex);

            row.forEach(function (cell, cellIndex) {
                let cellDOM = rowDOM.insertCell();
                initCellImg(cellDOM, cells[rowIndex][cellIndex]);
            })
        });
    }

    function initCellImg(cellDOM, cellObj) {
        let imgElement = document.createElement("img");
        imgElement.style.display = METADATA.displayNoneStyle;
        imgElement.setAttribute("src", cellObj.imgURL);

        cellDOM.appendChild(imgElement);
    }

    function addCellClickEventHandlers(cells) {
        Array.from(document.getElementById(METADATA.tableId).rows).forEach(
            function (row, rowIndex) {
                Array.from(row.cells).forEach(
                    function (cell, cellIndex) {
                        cell.onclick = function cellClickHandler() {
                            if (gameSessionData.countDown === undefined) {
                                setTimer();
                            }

                            triggerCellClick(cells[rowIndex][cellIndex]);
                        };
                    }
                );
            }
        );
    }

    function setTimer() {
        gameSessionData.countDown = new Date(METADATA.timePerGameInMS);
        gameSessionData.refreshTimer = setInterval(function () {
            gameSessionData.countDown = new Date(
                gameSessionData.countDown.getTime() - METADATA.timerIntervalInMS);
            document.getElementById(METADATA.timerId).innerHTML =
                dateFormatString(gameSessionData.countDown);

            if (gameSessionData.countDown.getTime() === 0) {
                clearInterval(gameSessionData.refreshTimer);
                endGame(false);
            }
        }, METADATA.timerIntervalInMS);
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

    function triggerCellClick(cell) {
        cell.clicks++;

        if (isCellClickable(cell, gameSessionData.guessedCells)) {
            if (gameSessionData.guessedCells.length === 2) {
                if (!gameSessionData.guessedCells[0].setFound) {
                    gameSessionData.guessedCells.forEach(function (cell) {
                        toggleCellDisplay(false, cell);
                    });
                }

                gameSessionData.guessedCells = [];
            }

            toggleCellDisplay(true, cell);

            gameSessionData.guessedCells.push(cell);

            if (isSetFound()) {

                gameSessionData.guessedCells.forEach(function (cell) {
                    cell.setFound = true;
                })

                gameSessionData.revealed += gameSessionData.guessedCells.length;

                if (playerHasWon()) {
                    clearInterval(gameSessionData.refreshTimer);
                    endGame(true);
                    triggerAllCellsDisplay(true)
                }
            }
        }
    }

    function playerHasWon() {
        // True if number of revealed cells equals number of cells
        // on board minus the last pair.
        return gameSessionData.revealed ===
            METADATA.length * METADATA.length - gameSessionData.guessedCells.length
    }

    function isCellClickable(cell) {
        let cellAlreadyInCurrentGuess =
            gameSessionData.guessedCells.length < METADATA.numberOfCellsInSet &&
            gameSessionData.guessedCells.indexOf(cell) != -1;

        // True if cell's pair hasn't been found and if cell isn't
        // already guessed in the current guess.
        return !cell.setFound && !cellAlreadyInCurrentGuess;
    }

    function endGame(hasWon) {
        Array.from(document.querySelectorAll("#" + METADATA.tableId + " td"))
            .forEach(function (cell) {
                cell.onclick = undefined;
            });

        setCursorToNotAllowed(METADATA.tableId);
        document.getElementById(METADATA.timerId).style.display = METADATA.displayNoneStyle;
        displayResult(hasWon);
    }

    function displayResult(hasWon) {
        let textColor = "";
        let resultText = "";

        if (!hasWon) {
            textColor = "red";
            resultText = "You suck.";
        } else {
            textColor = "green";

            let timeTakenToFinish = new Date(
                new Date(METADATA.timePerGameInMS) - gameSessionData.countDown
            );
            let mins = timeTakenToFinish.getMinutes();
            let secs = timeTakenToFinish.getSeconds();

            resultText = "Good job! It took you " +
                (mins === 0 ? "" : mins + " min ") +
                (secs === 0 ? "" : secs + " sec") +
                ".";
        }

        let resultDOMElement = document.getElementById(METADATA.resultId);
        resultDOMElement.style.color = textColor;
        resultDOMElement.innerHTML = resultText;
    }

    function toggleCellDisplay(toDisplay, cell) {
        let imgStyle = document.getElementById(METADATA.tableId)
            .rows[cell.row]
            .cells[cell.column]
            .firstChild.style;

        imgStyle.display = toDisplay ? "" : METADATA.displayNoneStyle;
    }

    function isSetFound() {
        let setFound = true;

        if (gameSessionData.guessedCells.length === METADATA.numberOfCellsInSet) {
            for (let index = 1; index < gameSessionData.guessedCells.length; index++) {
                if (gameSessionData.guessedCells[index - 1].imgURL !==
                    gameSessionData.guessedCells[index].imgURL) {
                    setFound = false;
                }
            }
        } else {
            setFound = false;
        }

        return setFound;
    }

    function Tile(value, imgURL, row, column) {
        this.value = value;
        this.imgURL = imgURL;
        this.row = row;
        this.column = column;
        this.clicks = 0;
        this.setFound = false;
    }
}();