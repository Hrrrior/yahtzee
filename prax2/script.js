let playersAsObject = [];
let turnCounter = 0;
let diceRollsCounter = 0;
let result = 0;
let currentPlayer = 0;
let maxTurns;
let allPlayersTurnCounter = 1;
let timeStart;

class Player {
	constructor(name) {
		this.name = name;
		this.score = 0;
		this.combos = [];
		this.rolls = 0;
		this.timeSpent = 0;
	}
}

class Die {
	constructor() {
		this.value = 0;
		this.hold = false;
	}
	diceRoll() {
		if (!this.hold) {
			this.value = Math.floor(Math.random() * 6) + 1;
		}
	}
}

const diceValues = {
	0: new Die(),
	1: new Die(),
	2: new Die(),
	3: new Die(),
	4: new Die()
};

function getId(id) {
	return document.getElementById(id);
}

function gameBegin() {
	if (playersAsObject.length === 0) return;
	const rbs = document.querySelectorAll('input[name="choice"]');
	for (const rb of rbs) {
		if (rb.checked) {
			localStorage.setItem("maxTurns", rb.value);
			break;
		}
	}
	localStorage.setItem("players", JSON.stringify(playersAsObject));
	location.href = 'game.html';
}

function addPlayer() {
	if (playersAsObject.length > 3 || !getId("name").value.trim()) return;
	let newPlayer = new Player(getId("name").value);
	let item = document.createElement('li');
	playersAsObject.push(newPlayer);
	getId("name").value = "";
	item.appendChild(document.createTextNode(newPlayer.name));
	getId("current-players").appendChild(item);
	if (playersAsObject.length === 1) getId("start-game-button").disabled = false;
}

function rollDice() {
	if (diceRollsCounter >= 3 || allPlayersTurnCounter > maxTurns) return;
	for (die in diceValues) {
		diceValues[die].diceRoll();
		getId(String(die)).className = "dice " + "d" + (diceValues[die].value);
		getId("checkbox" + die).disabled = false;
	}
	diceRollsCounter++;
	playersAsObject[currentPlayer].rolls++;
	if (diceRollsCounter === 1) getId("next-turn-button").disabled = false;
	if (diceRollsCounter >= 3) getId("roll-dice").className = "roll-dice-disabled";
}


function setUp() {
	maxTurns = parseInt(localStorage.getItem("maxTurns"));
	setUpDice();
	createScoreboard();
	currentTurn();
	timeStart = Date.now();
}

function setUpDice() {
	let element;
	let checkbox;
	let diceBox;
	let diceContainer = getId("dice-container");
	for (let index = 0; index < 5; index++) {
		diceBox = document.createElement("div");
		diceBox.innerHTML = "Hold?";
		diceBox.className = "diceBox";
		
		element = document.createElement("div");
		element.id = index;
		element.className = "dice " + "d" + 1;
		
		checkbox = document.createElement("input");
		checkbox.id = "checkbox" + index;
		checkbox.type = "checkbox"; 
		checkbox.disabled = true;
		checkbox.onclick = function() {holdDice(index)};
		
		diceBox.appendChild(checkbox);
		diceBox.appendChild(element);
		diceContainer.insertBefore(diceBox, getId("roll-dice"));
	}
}

function holdDice(id) {
	if (getId("checkbox" + id).checked) {
		diceValues[id].hold = true;
	} else {
		diceValues[id].hold = false;
	}
}		

function currentTurn() {
	getId("turn-counter").innerHTML = `<p>Turn: ${allPlayersTurnCounter}/${maxTurns}<p>Current player: ${playersAsObject[currentPlayer].name}`;
}

function getScore() {
	const rbs1 = document.querySelectorAll('input[name="optradio"]');
	for (const rb of rbs1) {
		if (rb.checked) {
			playersAsObject[currentPlayer].combos.push(rb.parentElement.parentElement.id);
			rb.checked = false;
			switch (rb.value) {
				case "Joker":
					Object.values(diceValues).forEach(element => { result += element.value; });
					break;
				case "3ofKind": case "4ofKind": case "yahtzee":
					threeFourOfKind(rb.value === "3ofKind" ? 3 : rb.value === "4ofKind" ? 4 : 5);
					break;
				case "sstraight": case "lstraight":
					result += straight(rb.value === "sstraight" ? 4 : 5);
					break;
				case "fullHouse":
					result += fullHouse();
					break;
					default:
					xOfKind(parseInt(rb.value));
				}
			}
	}
}
					
function xOfKind(kind) {
	Object.values(diceValues).forEach(element => { if (element.value === kind) result += kind; });
}

function threeFourOfKind(number) {
	let givenValues = [];
	let ofKind = 1;
	Object.values(diceValues).forEach(element => { givenValues.push(element.value); });
	givenValues.sort((a, b) => a - b);
	for (let index = 1; index < givenValues.length; index++) {
		if (givenValues[index] === givenValues[index - 1]) {
			ofKind++;
			if (ofKind === number) {
				break;
			}
		} else if (ofKind < number) {
			ofKind = 1;
		}
	}
	if (ofKind === number) Object.values(diceValues).forEach(element => { result += element.value; });; 
}
					
function straight(expectedNumber) {
	let givenValues = [];
	let numsStraight = 1;
	Object.values(diceValues).forEach(element => { givenValues.push(element.value); });
	givenValues = Array.from(new Set(givenValues)).sort((a, b) => a - b);
	for (let index = 1; index < givenValues.length; index++) {
		if (givenValues[index] === givenValues[index - 1] + 1) {
			numsStraight++;
			if (numsStraight === expectedNumber) {
				break;
			}
			continue;
		} else if (numsStraight < expectedNumber) {
			numsStraight = 1;
		}
	}
	if (numsStraight === expectedNumber) return (expectedNumber - 1) * 10;
	return 0;
}
					
function fullHouse() {
	let counter = {1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0, 6: 0 };
	let three;
	let two;
	Object.values(diceValues).forEach(element => { counter[element.value]++; });
	for (let index = 1; index < 7; index++) {
		if (counter[index] === 3) {
			three = true;
		} else if (counter[index] === 2) {
			two = true;
		}
	}
	if (three && two) return 25;
	return 0;
}

function nextPlayer() {
	if (diceRollsCounter > 0 && allPlayersTurnCounter <= maxTurns) {
		getScore();
		updateScoreboard(result, currentPlayer);
		resetDice();
		getId("next-turn-button").disabled = true;
		currentPlayer = currentPlayer + 1 < playersAsObject.length ? currentPlayer + 1 : 0;
		allPlayersTurnCounter += currentPlayer === 0 ? 1 : 0;
		currentTurn();
		setUpComboTable(playersAsObject[currentPlayer]);
		if (allPlayersTurnCounter === maxTurns + 1) gameOver();	
	}
}

function resetDice() {
	diceRollsCounter = 0;
	result = 0;
	for (let index = 0; index < 5; index++) {
		getId(String(index)).className = "dice d1";
		getId("checkbox" + index).checked = false;
		getId("checkbox" + index).disabled = true;
		diceValues[index].hold = false;
	}
	getId("roll-dice").className = "roll-dice";
}


function gameOver() {	
	getId("turn-counter").innerHTML = "Turn: Game Over";
	let winner = playersAsObject.reduce(function(prev, current) { return (prev.score > current.score) ? prev : current })
	winner.timeSpent = Date.now() - timeStart;
	getId("game-over").innerHTML = `<p>Game over<p> ${winner.name} wins with ${winner.score} points! <p> <a href='leaderboard.html' target='_blank'>Leaderboard</a>`;
	getId("game-over").style.display = "block";
	let newWinners = JSON.parse(localStorage.getItem("leaderboard"));
	newWinners = newWinners === null ? [] : Object.values(newWinners);
	newWinners.push(winner);
	while (newWinners.length > 10) {
		newWinners.shift();
	}
	localStorage.setItem("leaderboard", JSON.stringify(newWinners));
}

function setUpComboTable(Player) {
	let table = getId("comboTable");
	for (let i = 0, row; row = table.rows[i]; i++) {
		if (playersAsObject[currentPlayer].combos.includes(row.id)) {
			row.style.display = "none";
		} else {
			row.style.display = "";
		}
	}
}

function createScoreboard() {
	let table = getId("scoreboard-head");
	let playersString = localStorage.getItem("players");
	let item = document.createElement('th');
	let item2 = document.createElement('th');
	playersAsObject = JSON.parse(playersString);
	item.appendChild(document.createTextNode("Name"));
	item2.appendChild(document.createTextNode("Score"));
	table.appendChild(item);
	table.appendChild(item2);
	for (p in playersAsObject) {
		setUpScoreboard(playersAsObject[p], p);
	}
}

function setUpScoreboard(player, index) {
	let table = getId("scoreboard-body");
	let row = table.insertRow(index);
	let cell1 = row.insertCell(0);
	let cell2 = row.insertCell(1);
	cell1.innerHTML = player.name;
	cell2.innerHTML = player.score;
}

function updateScoreboard(score, index) {
	let table = document.getElementById("scoreboard-body").rows[index].cells;
	table[1].innerHTML = parseInt(table[1].innerHTML) + score;
	playersAsObject[currentPlayer].score += result;
}

function sortLeaderboard() {
	let sortOpts = document.getElementById("sort");
	let sortValue = sortOpts.options[sortOpts.selectedIndex].value;
	let winners = JSON.parse(localStorage.getItem("leaderboard"));
	switch (sortValue) {
		case "name-desc":
			winners.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case "score":
			winners.sort((a, b) => a.score - b.score);
			break;
		case "score-desc":
			winners.sort((a, b) => b.score - a.score);
			break;
		default:
			winners.sort((a, b) => a.name.localeCompare(b.name));
	}
	getId("leaderboard").innerHTML = "";
	for (i in winners) {
		let item = document.createElement('li');
		item.appendChild(document.createTextNode(`Name: ${winners[i].name},  Score: ${winners[i].score}, Rolls: ${winners[i].rolls}, Time Spent: ${millisToMinutesAndSeconds(winners[i].timeSpent)}`));
		getId("leaderboard").appendChild(item);
	}
}

function millisToMinutesAndSeconds(millis) {
	let minutes = Math.floor(millis / 60000);
	let seconds = ((millis % 60000) / 1000).toFixed(0);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
