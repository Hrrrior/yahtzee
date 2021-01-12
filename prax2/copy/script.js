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
	}
	diceRoll() {
		this.value = Math.floor(Math.random() * 6) + 1;
	}
}
let diceValues = {
	0: new Die(),
	1: new Die(),
	2: new Die(),
	3: new Die(),
	4: new Die()
};

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

function rollDice() {
	if (diceRollsCounter >= 3 || allPlayersTurnCounter > maxTurns) return;
	for (die in diceValues) {
		diceValues[die].diceRoll();
		getId(String(die))
			.className = "dice " + "d" + (diceValues[die].value);
	}
	diceRollsCounter++;
	playersAsObject[currentPlayer].rolls++;
	if (diceRollsCounter === 1) {
		getId("next-turn-button")
			.disabled = false;
	}
	if (diceRollsCounter >= 3) {
		getId("roll-dice")
			.className = "roll-dice-disabled"
	}
}

function addPlayer() {
	if (playersAsObject.length > 3) return;
	let newPlayer = new Player(getId("name")
		.value);
	getId("name")
		.value = "";
	playersAsObject.push(newPlayer);
	let item = document.createElement('li');
	item.appendChild(document.createTextNode(newPlayer.name));
	getId("current-players")
		.appendChild(item);
	if (playersAsObject.length === 1) {
		getId("start-game-button")
			.disabled = false;
	}
}

function updateScoreboard(score, index) {
	var table = document.getElementById("scoreboard-body")
		.rows[index].cells;
	table[1].innerHTML = parseInt(table[1].innerHTML) + score;
	playersAsObject[currentPlayer].score += result;
}

function setUp() {
	maxTurns = parseInt(localStorage.getItem("maxTurns"));
	setUpDice();
	createScoreboard();
	currentTurn();
	timeStart = Date.now();

}

function currentTurn() {
	getId("turn-counter")
		.innerHTML = "<p>Turn: " + allPlayersTurnCounter + "/" + maxTurns +  "<p>Current player: " + playersAsObject[currentPlayer].name;
}

function getScore() {
	const rbs1 = document.querySelectorAll('input[name="optradio"]');
	for (const rb of rbs1) {
		if (rb.checked) {
			playersAsObject[currentPlayer].combos.push(rb.parentElement.parentElement.parentElement.id);
			rb.checked = false;
			if (rb.value === "Joker") {
				for (val in diceValues) {
					result += diceValues[val].value;
				}
				break;
			} else if (rb.value === "3ofKind" || rb.value === "4ofKind" || rb.value === "yahtzee") {
				result += threeOfKind(rb.value === "3ofKind" ? 3 : rb.value === "4ofKind" ? 4 : 5);
				break;
			} else if (rb.value === "sstraight" || rb.value === "lstraight" ) {
				result += straight(rb.value === "sstraight" ? 4 : 5);
				break;
			} else if (rb.value === "fullHouse") {
				result += fullHouse();
				break;
			}
			xOfKind(parseInt(rb.value));
		}
	}
}

function xOfKind(kind) {
	for (die in diceValues) {
		if (diceValues[die].value === kind) {
			result += kind;
		}
	}
}

function threeOfKind(number) {
	let givenValues = [];
	for (die in diceValues) {
		givenValues.push(diceValues[die].value);
	}
	givenValues.sort((a, b) => a - b);
	let ofKind = 1;
	let resultCur = givenValues[0];
	for (let index = 1; index < givenValues.length; index++) {
		if (givenValues[index] === givenValues[index - 1]) {
			ofKind++;
		} else if (ofKind < number) {
			ofKind = 1;
		}
		resultCur += givenValues[index];
	}
	if (ofKind === number) {
		return resultCur;
	}
	return 0;
}

function straight(number) {
	let givenValues = [];
	let counter = {0 : 0, 1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0,}
	for (die in diceValues) {
		givenValues.push(diceValues[die].value);
	}
	givenValues = Array.from(new Set(givenValues)).sort((a, b) => a - b);
	let ofKind = 1;
	let resultCur = givenValues[0];
	console.log(givenValues);
	for (let index = 1; index < givenValues.length; index++) {
		if (givenValues[index] === givenValues[index - 1] + 1) {
			ofKind++;
			if (ofKind === number) {
				break;
			}
		} else if (ofKind < number) {
			ofKind = 1;
		}
		console.log(ofKind);
		resultCur += givenValues[index];

	}
	if (ofKind === number) {
		return (number - 1) * 10;
	}
	return 0;
}

function fullHouse() {
	let counter = {1 : 0, 2 : 0, 3 : 0, 4 : 0, 5 : 0, 6: 0 };
	let three;
	let two;
	for (die in diceValues) {
		counter[diceValues[die].value]++;
	}
	console.log(counter);
	for (let index = 1; index < Object.keys(counter).length + 1; index++) {
		if (counter[index] === 3) {
			three = true;
		} else if (counter[index] === 2) {
			two = true;
		}
	}
	if (three && two) {
		return 25;
	}
	return 0;
}

function nextPlayer() {
	if (diceRollsCounter > 0 && allPlayersTurnCounter <= maxTurns) {
		getScore();
		updateScoreboard(result, currentPlayer);
		turnCounter++;
		diceRollsCounter = 0;
		result = 0;
		resetDice();
		getId("next-turn-button")
			.disabled = true;
		if (currentPlayer + 1 < playersAsObject.length) {
			currentPlayer += 1;
			currentTurn();
			setUpComboTable(playersAsObject[currentPlayer]);
		} else {
			currentPlayer = 0;
			allPlayersTurnCounter++;
			currentTurn();
			setUpComboTable(playersAsObject[currentPlayer]);
			if (allPlayersTurnCounter === maxTurns + 1) {
				gameOver();
			}
		}
	}
}

function resetDice() {
	for (let index = 0; index < 5; index++) {
		getId(String(index))
			.className = "dice d1";
	}
	getId("roll-dice")
		.className = "roll-dice";
}

function setUpDice() {
	let element;
	let diceContainer = getId("dice-container");
	for (let index = 0; index < 5; index++) {
		element = document.createElement("div");
		element.id = index;
		element.className = "dice " + "d" + 1;
		diceContainer.insertBefore(element, getId("roll-dice"));
	}
}

function getId(id) {
	return document.getElementById(id);
}

function gameOver() {	
	getId("turn-counter")
		.innerHTML = "Turn: Game Over";
	let winner = playersAsObject.reduce(function(prev, current) {
		return (prev.score > current.score) ? prev : current
	})
	winner.timeSpent = Date.now() - timeStart;
	console.log(Date.now());
	console.log(timeStart);
	console.log(winner.timeSpent);
	getId("game-over")
		.innerHTML = "<p> Game over <p>" + winner.name + " wins, with " + winner.score + " points!" + "<p> <a href='leaderboard.html' target='_blank'>Leaderboard</a>";
	getId("game-over")
		.style.display = "block";
	let newWinners = JSON.parse(localStorage.getItem("leaderboard"));
	newWinners = newWinners === null ? [] : Object.values(newWinners);
	newWinners.push(winner);
	while (newWinners.length > 10) {
		newWinners.shift();
	}
	localStorage.setItem("leaderboard", JSON.stringify(newWinners));
}

function setUpComboTable(Player) {
	var table = getId("comboTable");
	for (var i = 0, row; row = table.rows[i]; i++) {
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
	let playerDeserialized;
	playersAsObject = JSON.parse(playersString);
	let item = document.createElement('th');
	let item2 = document.createElement('th');
	item.appendChild(document.createTextNode("Name"));
	item2.appendChild(document.createTextNode("Score"));
	table.appendChild(item);
	table.appendChild(item2);
	for (p in playersAsObject) {
		playerDeserialized = playersAsObject[p];
		setUpScoreboard(playerDeserialized, p);
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

function createLeaderBoard() {
	let winners = JSON.parse(localStorage.getItem("leaderboard"));
	for (let i in winners) {
		let item = document.createElement('li');
		item.appendChild(document.createTextNode("Name: " + winners[i].name + ",  Score: " + winners[i].score + ", Rolls: " + winners[i].rolls + ", Time Spent: " + millisToMinutesAndSeconds(winners[i].timeSpent)));
		getId("leaderboard")
			.appendChild(item);
	}
}

function sortLeaderboard() {
	let e = document.getElementById("sort");
	let sortValue = e.options[e.selectedIndex].value;
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
	getId("leaderboard")
		.innerHTML = "";
	for (let i in winners) {
		let item = document.createElement('li');
		item.appendChild(document.createTextNode("Name: " + winners[i].name + ",  Score: " + winners[i].score + ", Rolls: " + winners[i].rolls + ", Time Spent: " + millisToMinutesAndSeconds(winners[i].timeSpent)));
		getId("leaderboard")
			.appendChild(item);
	}
}

function millisToMinutesAndSeconds(millis) {
	var minutes = Math.floor(millis / 60000);
	var seconds = ((millis % 60000) / 1000).toFixed(0);
	return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

