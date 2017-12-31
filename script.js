"use strict"
window.onload = function init() {
    shuffleBoard("game-board", 4);
}

function shuffleBoard(tableId, length) {
    var values = [];

    for (let value = 0; value < length * 2; value++) {
        values.push(value);
        values.push(value);
    }

    var shuffled = shuffleArray(values);
    
    setGameBoard(tableId, shuffled);
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

function setGameBoard(tableId, values) {
    var tableLength = document.getElementById(tableId).rows.length;

    for (let rowIndex = 0; rowIndex < tableLength; rowIndex++) {
        for (let colIndex = 0; colIndex < tableLength; colIndex++) {
            document.getElementById(tableId).rows[rowIndex].cells[colIndex].innerHTML = values.pop();
        }
    }
}