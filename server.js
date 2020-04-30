//require
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//main variables
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL)

//uses
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

//lestining on port 
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listining on port ${PORT}`);

        })
    })

//=======================================(Routs)============================================\\

app.get('/', homePageHandler)
app.get('/addToFavourate', addToFavourateHandler)
app.get('/myFavourates', myFavouratesHandler)
app.get('/details/:digital_id', detailsHandler)
app.put('/update/:update_id', updateHandler)
app.delete('/delete/:delete_id', deleteHandler)
app.get('/search', searchHandler);
app.get('/result', resultHandler);
app.get('/searchForDigimonsName', searchForDigimonsNameHandler)
// app.get('/searchForDigimonslevel', searchForDigimonslevelHandler)
app.get('*', notFoundHandler)


//====================================(Routs handlers)========================================\\

//***********(homePageHandler)**********\\

function homePageHandler(req, res) {
    let url = `https://digimon-api.herokuapp.com/api/digimon`;
    superagent.get(url)
        .then(data => {
            let digitalsArray = data.body.map(val => {
                return new Digitals(val)
            })
            res.render('./index.ejs', { data: digitalsArray })
        })
}


function Digitals(val) {
    this.name = val.name;
    this.img_url = val.img;
    this.level = val.level
}

//***********(addToFavourateHandler)**********\\


function addToFavourateHandler(req, res) {
    //collect
    let { name, img_url, level } = req.query;
    //insert
    let sql = `INSERT INTO mydigitals (name,img_url,level) VALUES ($1,$2,$3);`;
    let safeValues = [name, img_url, level];
    //redirect
    client.query(sql, safeValues)
        .then(result => {
            res.redirect('/myFavourates')
        })
}

//***********(myFavouratesHandler)**********\\


function myFavouratesHandler(req, res) {
    let sql = `SELECT * FROM mydigitals;`;
    client.query(sql)
        .then(result => {
            res.render('./pages/myfavouratedigitals', { data: result.rows })
        })
}

//***********(detailsHandler)**********\\


function detailsHandler(req, res) {
    //get param value
    let param = req.params.digital_id;
    //select where id = param
    let sql = `SELECT * FROM mydigitals WHERE id=$1;`;
    let safeValues = [param];
    //render to details page
    client.query(sql, safeValues)
        .then(result => {
            res.render('./pages/details', { data: result.rows[0] })
        })

}

//***********(updateHandler)**********\\


function updateHandler(req, res) {
    //collect param value
    let param = req.params.update_id;
    //collect updated data
    let { name, img_url, level } = req.body;
    //update where id = param
    let sql = `UPDATE mydigitals set name=$1,img_url=$2,level=$3 WHERE id=$4;`;
    let safeValues = [name, img_url, level, param]
    //redirect to same page
    client.query(sql, safeValues)
        .then(result => {
            res.redirect(`/details/${param}`)
        })

}

//***********(deleteHandler)**********\\

function deleteHandler(req, res) {
    //collect param value
    let param = req.params.delete_id;
    //delete where id = param
    let sql = `DELETE FROM mydigitals WHERE id =$1;`;
    let safeValues = [param];
    //redirect to my favourate page
    client.query(sql, safeValues)
        .then(result => {
            res.redirect('/myFavourates')
        })

}

//***********(searchHandler)**********\\

function searchHandler(req, res) {
    res.render('./pages/search')

}

//***********(searchHandler)**********\\

function resultHandler(req, res) {
    res.render('./pages/result')
}

//***********(searchForDigimonsNameHandler)**********\\

function searchForDigimonsNameHandler(req, res) {
    //collect the query value
    let digimonsName = req.query.digimonsName;
    let radioVal = req.query.name;
    let url = `https://digimon-api.herokuapp.com/api/digimon/`
    if(radioVal == 'name'){
        url = `${url}name/${digimonsName}`;
    }else  if(radioVal == 'level'){
        url = `${url}level/${digimonsName}`;
    }

    //pass it to the url 
    // let url = `https://digimon-api.herokuapp.com/api/digimon/name/${digimonsName}`;
    superagent.get(url)
        .then(data => {
            let digitalsNameArray = data.body.map(val => {
                return new Digitals(val)
            })
            res.render('./pages/result', { data: digitalsNameArray })
        }).catch(()=>{
            res.render('./pages/error')
        })

}
//***********(searchForDigimonslevelHandler)**********\\

// function searchForDigimonslevelHandler(req, res) {
//     //collect the query value
//     let digimonsLevel = req.query.digimonslevel;
//     //pass it to the url 
//     let url = `https://digimon-api.herokuapp.com/api/digimon/level/${digimonsLevel}`;
//     superagent.get(url)
//         .then(data => {
//             let digitalsLevelArray = data.body.map(val => {
//                 return new Digitals(val)
//             })
//             res.render('./pages/result', { data: digitalsLevelArray })
//         })
// }
//====================================(error handlers)========================================\\

function notFoundHandler(req, res) {
    res.status(404).send('page not found')
}
function errorHandler(error, req, res) {
    res.status(500).send(error)
}
