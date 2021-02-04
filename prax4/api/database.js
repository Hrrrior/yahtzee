var mysql = require('mysql2');

var con = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: ""
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("SELECT * FROM leaderboard", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});

function insertData(winner) {

        console.log("Connected!");
        let name = winner['name'];
        let score = winner['score'];
        let time = winner['timeSpent'];
        let rolls = winner['rolls'];
        var sql = "INSERT INTO leaderboard (name, score, time, rolls) VALUES (?, ?, ?, ?)";
        con.query(sql,[name, score, time, rolls], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
}

exports.insertData = insertData;
exports.con = con;
