const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise')
const app = express()
app.engine('hbs',handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000
const LIMIT = 50
const OFFSET = 0

const SQL_GET_FILM = 'select film_id, title from film limit ? offset ?'
const SQL_GET_FILMBYID = 'select * from film where film_id = ?'

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: 'sakila',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: 4    
})


app.get('/films', async (req,resp)=> {
    const conn = await pool.getConnection()
    try {
        await conn.ping()

        const results = await conn.query(SQL_GET_FILM, [LIMIT, OFFSET])
        console.info("results: ",results)
        //const resultArray = await results[0]
        //console.info("resultArray: ", resultArray)
        
        resp.status(200)
        resp.type('text/html')
        resp.render('films', {films: results[0]})

    } catch(e) {
        console.error("error: ", e)
    } finally {
        conn.release()
    }
})

app.get('/film/:film_id' , async (req,resp)=> {
    const film_id = req.params['film_id']
    console.info("film id: ", film_id)
    const conn = await pool.getConnection()
    try {
        await conn.ping()
        const results = await conn.query(SQL_GET_FILMBYID, [film_id])
        console.info("film result: ",results[0])
        console.info("data result: ",results[0][0])

        if(results[0].length <= 0) {
            resp.status(404)
            resp.type('text/html')
            resp.send(`Film not found: ${film_id}`)
            return
        }
        resp.status(200)
        resp.type('text/html')
        resp.render('filmdetail', {
            filmresult: results[0][0]
        })
    }
    catch(e) {
        console.error("error: ", e)
    }
    finally {
        conn.release()
    }
})

app.listen(PORT, ()=> {
    console.info(`app started on port ${PORT}`)
})
//start app
