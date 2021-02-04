let playersAsObject = [];
let diceRollsCounter = 0;
let result = 0;
let currentPlayer = 0;
let maxTurns;
let allPlayersTurnCounter = 1;
let timeStart;
let localPlayer;
let winner;
let playerAdded = false;

let API_PORT = '';
function updateLobby() {
	console.log("here");
	let dataLoc;
	fetch(API_PORT + "gameState", {
		method: "GET",
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"}
	}).then(response => response.json())
		.then(data => dataLoc = data).then(function (dataLoc) {
			playersAsObject = dataLoc["gameState"]["playersAsObject"];
			console.log(dataLoc["gameState"]);
			console.log(dataLoc["gameState"]["ready"]);
			if (dataLoc["gameState"]["ready"]) {
				gameBegin()
			} else if (dataLoc["gameState"]["reset"]) {
				reset();
			}
			else {
				setTimeout(updateLobby, 1000)
			}
		});
}


function addPlayer() {
	if (playerAdded || !getId("name").value.trim()) return;

	let newPlayer = new Player(getId("name").value);
	localPlayer = newPlayer;

	getMaxTurns();
	let body = {newPlayer: newPlayer, maxTurns: maxTurns};
	fetch(API_PORT + "addPlayer", {
		method: "POST",
		body: JSON.stringify(body),
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"}
	});
	playerAdded = true;
	getId("add-player-button").disabled = true;
	updateLobby();
}

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
function gameOver() {
	getId("turn-counter").innerHTML = "Turn: Game Over";
	// let winner = playersAsObject.reduce(function(prev, current) { return (prev.score > current.score) ? prev : current })
	// winner.timeSpent = Date.now() - timeStart;
	getId("game-over").innerHTML = `<p>Game over<p> ${winner.name} wins with ${winner.score} points! <p> <a href='leaderboard.html' target='_blank'>Leaderboard</a> <p><a onclick="reset()" href="index.html">Back To Index</a></p>`;
	getId("game-over").style.display = "block";
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

function setUp() {
	setUpDice();
	createScoreboard();
	currentTurn();
	timeStart = Date.now();
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

let timOut;
function updateGameState() {
	console.log("here");
	fetch(API_PORT + "gameState", {
		method: "GET",
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"}
	}).then(response => response.json()).then(function (data) {
		console.log(data);
		console.log(data["gameState"]["finished"])
		if (data["gameState"]["finished"]) {
			clearTimeout(timOut);
			playersAsObject = data["gameState"]["playersAsObject"];
			winner = data["gameState"]["winner"];
			getId("scoreboard-body").innerHTML = "";
			for (p in playersAsObject) {
				setUpScoreboard(playersAsObject[p], p);
			}
			console.log("over");
			gameOver()
		} else if (localPlayer["name"] ===
			playersAsObject[parseInt(data["gameState"]["currentPlayer"])]["name"] && diceRollsCounter < 3) {
			clearTimeout(timOut);
			getId("loader").style.visibility = "hidden";

			currentPlayer = parseInt(data["gameState"]["currentPlayer"]);
			playersAsObject = data["gameState"]["playersAsObject"];
			getId("roll-dice").className = "roll-dice";
			allPlayersTurnCounter = data["gameState"]["allPlayersTurnCounter"];
			// setTimeout(updateGameState, 1000);
			currentTurn();
			setUpComboTable(playersAsObject[currentPlayer]);
			getId("scoreboard-body").innerHTML = "";
			for (p in playersAsObject) {
				setUpScoreboard(playersAsObject[p], p);
			}
			console.log("my turn0");
		} else {
			currentPlayer = parseInt(data["gameState"]["currentPlayer"]);
			currentTurn();
			getId("loader").style.visibility = "";

			getId("roll-dice").className = "roll-dice-disabled";
			console.log("not turn0");
			timOut = setTimeout(updateGameState, 1000);
		}
		});
}
function reset() {
	fetch(API_PORT + "reset", {
		method: "POST",
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"},
	})
	document.location = "index.html";
}

function getMaxTurns() {
	const rbs = document.querySelectorAll('input[name="choice"]');
	for (const rb of rbs) {
		if (rb.checked) {
			maxTurns = rb.value;
			break;
		}
	}
}
function gameBegin() {
	if (playersAsObject.length === 0) return;
	fetch(API_PORT + "gameState", {
		method: "GET",
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"}
	}).then(response => response.json())
		.then(function (data) {
			console.log("in setup")
			playersAsObject = data["gameState"]["playersAsObject"];
			maxTurns = parseInt(data["gameState"]["maxTurns"]);
		})
	setUp();
	getId("body_1").hidden = true;
	getId("body_2").hidden = false;
	updateGameState();
}



function rollDice() {
	if (diceRollsCounter >= 3) return;
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



function createScoreboard() {
	let table = getId("scoreboard-head");
	let item = document.createElement('th');
	let item2 = document.createElement('th');
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
	diceValues[id].hold = getId("checkbox" + id).checked;
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
	if (diceRollsCounter > 0) {
		getScore();
		updateScoreboard(result, currentPlayer);
		resetDice();
		getId("next-turn-button").disabled = true;
		getId("roll-dice").className = "roll-dice-disabled";
		let timeSpent = Date.now() - timeStart;
		const body = {
			playersAsObject: playersAsObject,
			timeSpent: timeSpent
		};
		fetch(API_PORT + "nextPlayer", {
			method: "POST",
			headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"},
			body: JSON.stringify(body)
		}).then(function () {
			console.log("posted")
			if (currentPlayer === 1) {
				allPlayersTurnCounter++;
			}
			getId("loader").style.visibility = "";
			setTimeout(updateGameState, 1500);
		}).catch(err => console.log(err));
		// console.log("posted")
		// if (currentPlayer === 1) {
		// 	allPlayersTurnCounter++;
		// }
		// updateGameState();
		// }
	}
}


// function nextPlayer() {
// 	if (diceRollsCounter > 0) {
// 		getScore();
// 		updateScoreboard(result, currentPlayer);
// 		resetDice();
// 		getId("next-turn-button").disabled = true;
// 		getId("roll-dice").className = "roll-dice-disabled";
// 		let timeSpent = Date.now() - timeStart;
// 		const body = {
// 			playersAsObject: playersAsObject,
// 			timeSpent : timeSpent
// 		};
// 		fetch(API_PORT + "nextPlayer", {
// 			method: "POST",
// 			headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"},
// 			body: JSON.stringify(body)
// 		}).catch(err => console.log(err));
// 		console.log("posted")
// 		if (currentPlayer === 1) {
// 			allPlayersTurnCounter++;
// 		}
// 		updateGameState();
// 	}
// }

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

function updateScoreboard(score, index) {
	let table = document.getElementById("scoreboard-body").rows[index].cells;
	table[1].innerHTML = parseInt(table[1].innerHTML) + score;
	playersAsObject[currentPlayer].score += result;
}

function sortLeaderboard() {
	let sortOpts = document.getElementById("sort");
	let sortValue = sortOpts.options[sortOpts.selectedIndex].value;
	let winners;
	fetch(API_PORT + "getLeaderboard", {
		method: "GET",
		headers: {"Content-type": "application/json; charset=UTF-8", "Access-Control-Allow-Origin": "*"}
	}).then(response => response.json())
		.then(data => winners = data).then(function () {
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
			item.appendChild(document.createTextNode(`Name: ${winners[i].name},  Score: ${winners[i].score}, Rolls: ${winners[i].rolls}, Time Spent: ${millisToMinutesAndSeconds(winners[i].time)}`));
			getId("leaderboard").appendChild(item);
		}
	})
}

function millisToMinutesAndSeconds(millis) {
	let minutes = Math.floor(millis / 60000);
	let seconds = ((millis % 60000) / 1000).toFixed(0);
	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
