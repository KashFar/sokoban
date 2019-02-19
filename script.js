// map model (note: empty spaces changed to Z's)
const map = [
  "ZZWWWWWZ",
  "WWWZZZWZ",
  "WOSBZZWZ",
  "WWWZBOWZ",
  "WOWWBZWZ",
  "WZWZOZWW",
  "WBZXBBOW",
  "WZZZOZZW",
  "WWWWWWWW"
];

// movement model (row,colum)
const possibleMoves = {
  'ArrowRight': [0, 1],
  'ArrowDown': [1, 0],
  'ArrowUp': [-1, 0],
  'ArrowLeft': [0, -1]
}

// create player
let playerDiv = document.createElement('div')
playerDiv.id = 'player'

// init global variables
let absolutePlayerMovement = 60 // must equal css --element-width 
let boxCount = 0                // number of boxes on map
let storedBoxCount = 0          // number of stored boxes on map

function mapKeyObj(cellDiv, rowDiv, rowIndex, cellIndex) {
  this.cellDiv = cellDiv
  this.rowDiv = rowDiv
  this.rowIndex = rowIndex
  this.cellIndex = cellIndex
  this.W = function () {
    appendWallDiv(this.cellDiv, this.rowDiv)
  }
  this.S = function () {
    appendEmptyDiv(this.cellDiv, this.rowDiv)
    appendPlayerDiv(this.cellDiv, this.rowIndex, this.cellIndex)
  }
  this.Z = function () {
    appendEmptyDiv(this.cellDiv, this.rowDiv)
  }
  this.O = function () {
    appendStorageDiv(this.cellDiv, this.rowDiv)
  }
  this.B = function () {
    appendBoxDiv(this.cellDiv, this.rowDiv)
  }
  this.X = function () {
    appendFullDiv(this.cellDiv, this.rowDiv)
  }
}

// build board from map model w/ helper functions (end of file)
function buildBoard() {
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    let rowDiv = createRowDiv()
    for (let cellIndex = 0; cellIndex < map[rowIndex].length; cellIndex++) {
      let cellDiv = createCellDiv(rowIndex, cellIndex)
      const curMapCell = map[rowIndex][cellIndex]
      const mapKey = new mapKeyObj(cellDiv, rowDiv, rowIndex, cellIndex)
      mapKey[curMapCell]()
    }
    document.body.appendChild(rowDiv)
  }
}

//call build board function
buildBoard()

//get start element position from board
function getPlayerStart() {
  let playerStyle = window.getComputedStyle(playerDiv)
  let playerTop = parseInt(playerStyle.getPropertyValue('top'))
  let playerLeft = parseInt(playerStyle.getPropertyValue('left'))
  return [playerTop, playerLeft]
}

// initialize absolute player div position from board
let [absolutePlayerTop, absolutePlayerLeft] = getPlayerStart()

// update player div element location
function updatePlayerDiv(absolutePlayerTop, absolutePlayerLeft) {
  document.getElementById("player").style.top = absolutePlayerTop + "px";
  document.getElementById("player").style.left = absolutePlayerLeft + "px";
}

// check for a win
function winCheck() {
  if (boxCount == storedBoxCount) {
    let winDiv = document.createElement('div')
    winDiv.classList.add('win')
    let winText = document.createTextNode('winner')
    winDiv.appendChild(winText)
    document.body.appendChild(winDiv)
    document.removeEventListener('keydown', keyDown)
  }
}

// move the player
function movePlayer(keyName) {
  absolutePlayerTop += (possibleMoves[keyName][0] * absolutePlayerMovement)
  absolutePlayerLeft += (possibleMoves[keyName][1] * absolutePlayerMovement)
  playerDiv.dataset.row = parseInt(playerDiv.dataset.row) + possibleMoves[keyName][0]
  playerDiv.dataset.cell = parseInt(playerDiv.dataset.cell) + possibleMoves[keyName][1]
}

// main event handler/controller
function keyDown(event) {
  const keyName = event.key;
  if (!keyName.includes('Arrow')) return
  checkMove(keyName)
  winCheck()
  updatePlayerDiv(absolutePlayerTop, absolutePlayerLeft)
}

// add new div class and remove old div class
function updateDivClass(div, oldClass, newClass) {
  div.classList.remove(oldClass)
  div.classList.add(newClass)
}

// create array of check cell divs and their dataset cellTypes
function getCheckCells(keyName) {
  let checkCell1Coord = (parseInt(playerDiv.dataset.row) + possibleMoves[keyName][0]) + '-' +
    (parseInt(playerDiv.dataset.cell) + possibleMoves[keyName][1])
  let checkCell2Coord = (parseInt(playerDiv.dataset.row) + (possibleMoves[keyName][0]) * 2) + '-' +
    (parseInt(playerDiv.dataset.cell) + (possibleMoves[keyName][1]) * 2)
  let checkCell1Div = document.getElementById(checkCell1Coord)
  let checkCell2Div = document.getElementById(checkCell2Coord)
  let checkCell1Type = checkCell1Div && checkCell1Div.dataset.cellType
  let checkCell2Type = checkCell2Div && checkCell2Div.dataset.cellType
  return [checkCell1Div, checkCell2Div, checkCell1Type, checkCell2Type]
}

// main move logic
function checkMove(keyName) {
  let [element1MoveAway, element2MovesAway, element1CellType, element2CellType] = getCheckCells(keyName)
  if (element1CellType != 'wall') {
    if (element1CellType == 'box') {
      if (element2CellType == 'empty') {
        element2MovesAway.dataset.cellType = 'box'
        element1MoveAway.dataset.cellType = 'empty'
        updateDivClass(element2MovesAway, 'empty', 'box')
        updateDivClass(element1MoveAway, 'box', 'empty')
      } else if (element2CellType == 'storage') {
        element2MovesAway.dataset.cellType = 'storage-full'
        element1MoveAway.dataset.cellType = 'empty'
        updateDivClass(element2MovesAway, 'storage', 'storage-full')
        updateDivClass(element1MoveAway, 'box', 'empty')
        storedBoxCount++
      } else {
        return
      }
    } else if (element1CellType == 'storage-full') {
      if (element2CellType == 'empty') {
        element2MovesAway.dataset.cellType = 'box'
        element1MoveAway.dataset.cellType = 'storage'
        updateDivClass(element2MovesAway, 'empty', 'box')
        updateDivClass(element1MoveAway, 'storage-full', 'storage')
        storedBoxCount--
      } else if (element2CellType == 'storage') {
        element2MovesAway.dataset.cellType = 'storage-full'
        element1MoveAway.dataset.cellType = 'storage'
        updateDivClass(element2MovesAway, 'storage', 'storage-full')
        updateDivClass(element1MoveAway, 'storage-full', 'storage')
      } else {
        return
      }
    }
    movePlayer(keyName)
  }
}

// START build board helper functions 
function createRowDiv() {
  let rowDiv = document.createElement('div')
  rowDiv.classList.add('row')
  return rowDiv
}

// create cell from row and cell indices
function createCellDiv(rowIndex, cellIndex) {
  let cellDiv = document.createElement('div')
  cellDiv.classList.add('cell')
  cellDiv.id = rowIndex + '-' + cellIndex
  return cellDiv
}

// turn cell div into wall div and append to row
function appendWallDiv(cellDiv, rowDiv) {
  cellDiv.classList.add('wall')
  cellDiv.dataset.cellType = 'wall'
  rowDiv.appendChild(cellDiv)
}

// turn cell div into empty div and append to row
function appendEmptyDiv(cellDiv, rowDiv) {
  cellDiv.classList.add('empty')
  cellDiv.dataset.cellType = 'empty'
  rowDiv.appendChild(cellDiv)
}

// turn cell div into storage div and append to row
function appendStorageDiv(cellDiv, rowDiv) {
  cellDiv.classList.add('storage')
  cellDiv.dataset.cellType = 'storage'
  rowDiv.appendChild(cellDiv)
}

// turn cell div into box div and append to row 
function appendBoxDiv(cellDiv, rowDiv) {
  cellDiv.classList.add('box')
  cellDiv.dataset.cellType = 'box'
  rowDiv.appendChild(cellDiv)
  boxCount++
}

// turn cell div into full storage div and append to row
function appendFullDiv(cellDiv, rowDiv) {
  cellDiv.classList.add('storage-full')
  cellDiv.dataset.cellType = 'storage-full'
  rowDiv.appendChild(cellDiv)
  boxCount++
  storedBoxCount++
}

// init playerDiv dataset location and append player to start div
function appendPlayerDiv(cellDiv, rowIndex, cellIndex) {
  playerDiv.dataset.row = rowIndex
  playerDiv.dataset.cell = cellIndex
  cellDiv.appendChild(playerDiv)
}
// END build board helper functions 

// attach event listener to page
document.addEventListener('keydown', keyDown);