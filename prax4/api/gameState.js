export const getGameState = () =>  {
    return {
            "playersAsObject": [],
            "currentPlayer": 0,
            "maxTurns": "0",
            "ready" : false,
            "allPlayersTurnCounter" : 1,
            "finished": false,
            "winner" : null,
            "timeSpent" : null,
            "reset" : false
    }

}
