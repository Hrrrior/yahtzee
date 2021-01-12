import {con, insertData} from "./database.js";

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());
import {getGameState} from './gameState'
let gameState = getGameState();
app.get('/gameState', (req, res) => {
    return res.json({ gameState: gameState});
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/addPlayer', (req, res) => {
    console.log(req.body);
    gameState.reset = false;
    if (gameState.playersAsObject.length > 1) {
        return res.status(201).send(gameState.playersAsObject.length.toString());
    } else {let updated = req.body['newPlayer'];
    gameState.playersAsObject.push(updated);
    gameState.maxTurns = req.body['maxTurns'];
    console.log(gameState.playersAsObject.length);
        if (gameState.playersAsObject.length > 1) {
            gameState.ready = true;
        }
    return res.status(201).send(gameState.playersAsObject.length.toString());}});

let allP = 0;
app.post('/setTurns', (req, res) => {
    gameState.maxTurns = req.body
    return res.status(201);
});

app.post('/reset', (req, res) => {
    gameState = getGameState();
    gameState.reset = true;
    return res.status(201);
});
app.get('/getLeaderboard', (req, res) => {
    var sql = "SELECT * FROM leaderboard ORDER BY created_at DESC limit 10";
    let rs = null;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("res" + JSON.stringify(result));
        rs = result;
        return res.json(rs);
    });

});
app.post('/nextPlayer', (req, res) => {
    if (!gameState.finished) {
        console.log("suc" + req.body);
        console.log(req.body["playersAsObject"]);
        gameState.playersAsObject = req.body["playersAsObject"]
        allP++;
        gameState.timeSpent = req.body["timeSpent"];
        if (allP === 2) {
            gameState.allPlayersTurnCounter++;
            allP = 0;
            if (gameState.allPlayersTurnCounter > gameState.maxTurns) {
                gameState.finished = true;
                gameState.winner = gameState.playersAsObject.reduce(function(prev, current) { return (prev.score > current.score) ? prev : current })
                gameState.winner.timeSpent = gameState.timeSpent;
                insertData(gameState.winner);
                console.log("finished")
                console.log(gameState.playersAsObject)
                console.log("finished")
            }
        }
        gameState.currentPlayer = gameState.currentPlayer === 0 ? 1 : 0;

        return res.status(201).end();
    } else {
        console.log("fail" + req.body);
        return res.status(201).end();
    }
});
app.listen(6042, () => {
    console.log('Example app listening on port 6042!')
});
// app.listen(8000, () => {
//     console.log('Example app listening on port 8000!')
// });
