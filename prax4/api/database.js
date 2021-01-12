var mysql = require('mysql2');

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "heheli"
// });

var con = mysql.createConnection({
    host: "localhost",
    user: "s_heheli",
    password: "7OiLT2ya",
    database: "heheli"
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

// function getLeaderboard() {
//     console.log("Connected! leader");
//     var sql = "SELECT * FROM leaderboard ORDER BY created_at DESC limit 10";
//     let rs = null;
//     con.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log("res" + JSON.stringify(result));
//         rs = result;
//     });
//     return rs
// }
exports.insertData = insertData;
exports.con = con;
