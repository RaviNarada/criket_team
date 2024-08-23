const express = require('express')

const path = require('path')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Started')
    })
  } catch (e) {
    console.log(`Db  Error :${e.message}`)

    process.exit(1)
  }
}

initializeDBAndStartServer()

const snakeCaseToCamelcase = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
}
//API 1

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `

      SELECT *

      FROM cricket_team;`

  const dbArray = await db.all(getPlayerQuery)

  response.send(dbArray.map(eachPlayer => snakeCaseToCamelcase(eachPlayer)))
})

//API 2 add player
app.post('/players/', async (request, response) => {
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const addPlayerQuery = `
  INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES('${playerName}', ${jerseyNumber}, '${role}');`

  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API 3 get player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerIDQuery = `
          select *
          from cricket_team
          where player_id = ${playerId}`
  const playerdb = await db.get(playerIDQuery)
  response.send(snakeCaseToCamelcase(playerdb))
})

//API 4 update player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerBody = request.body
  const {playName, jerseyNumber, role} = playerBody

  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET 
      player_name='${playName}',
      jersey_number =${jerseyNumber},
      role='${role}'
    where player_id=${playerId};`
  const dbResponse = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 5 Delete player
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuery = `
  DELETE FROM 
  cricket_team
  WHERE player_id = ${playerId};`
  await db.run(deleteBookQuery)
  response.send('Player Removed')
})

module.exports = app
