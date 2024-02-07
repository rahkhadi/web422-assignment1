const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const CompaniesDB = require('./modules/companiesDB.js')
const db = new CompaniesDB();
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
var corsMiddleware = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000/', 'http://127.0.0.1:5500/'); //replace localhost with actual host
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

    next();
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(corsMiddleware);



// Deliver a json message
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"))
});

// C - Add new company
app.post('/api/companies', (req, res) => {
    db.addNewCompany(req.body)
      .then((data) => {
          res.json(data);
          res.status(201).end()
      })
      .catch(function (err) {
        res.status(500).json({ "message":"Server internal error: " + err})
      })
    });

// R - Get All companies
app.get('/api/companies', (req, res) => {
    let page = req.query["page"];
    let perPage = req.query["perPage"];
    let name = req.query["name"];
    db.getAllCompanies(page, perPage, name)
      .then((data) => {
        res.json(data);
        res.status(200).end()
      })
      .catch(function (err) {
        res.status(500).json({ "message":"Server internal error: " + err})
      })
    });

// R - Get one company
app.get('/api/company/:id', (req, res) => {
    db.getCompanyById(req.params.id)
      .then((data) => {
        res.json(data);
        res.status(200).end()
      })
      .catch(function (err) {
        res.status(500).json({ "message":"Server internal error: " + err})
      })
    });

// U - Edit existing company
app.put('/api/company/:id', (req, res) => {
    db.updateCompanyById(req.body, req.params.id)
      .then((data) => {
        res.json(data);
        res.status(201).end()
      })
      .catch(function (err) {
        res.status(500).json({ "message":"Server internal error: " + err})
      })
    });

// D - Delete user
app.delete('/api/company/:id', async (req, res) => {
    try {
        await db.deleteCompanyById(req.params.id);
        res.status(204).end()
    }
    catch (e) {
        res.status(500).json({ "message":"Server internal error: " + e})
    }
    });

// Resource not found (this shouldn't really be possible)
app.use((req, res) => {
  res.status(404).send('Resource not found');
});

db.initialize(process.env.MONGODB_CONN_STRING)
    .then(() => {
        app.listen(HTTP_PORT, ()=>{
            console.log(`server listening on: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });