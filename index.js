const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const Joi = require('joi');

const app = express();

const port = 3000;

app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + 'public'));

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs_qlsv",
    charset: "utf8_unicode_ci"
});

conn.connect((err) => {
    if (err) {
        throw err.stack;
    }

    console.log("Connect success on port: " + conn.threadId);
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/list-class', (req, res) => {
    let sql = "SELECT * FROM classes";

    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.render('classes/index', { classes: result });
        }
    });
});

app.get('/create-class', (req, res) => {
    res.render('classes/create');
});

app.post('/create-class', (req, res) => {
    const Schema = Joi.object().keys({
        name: Joi.string().required().messages({
            'string.empty': "This Field Is Not Nullable",
        }),
        status: Joi.string().required().messages({
            'string.empty': "This Field Is Not Nullable",
        })
    });

    const { error } = Schema.validate(req.body);

    if (error) {
        res.render('classes/create', { err: error.details });
    } else {
        let sql = `INSERT INTO classes(name, status) VALUES ('${req.body.name}', '${req.body.status}')`;

        conn.query(sql, (err, result) => {
            if (err) {
                res.send(err)
            } else {
                res.redirect('/list-class');
            }
        });
    }
});

app.get('/update-class/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM classes WHERE id = '${id}'`;

    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.render('classes/update', { item: result[0] });
        }
    });
});

app.post('/update-class/:id', (req, res) => {
    let id = req.params.id;
    let sql = `UPDATE classes SET name = '${req.body.name}', status = '${req.body.status}' WHERE id = '${id}'`;

    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.redirect('/list-class');
        }
    });
});

app.get('/delete-class/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM classes WHERE id = '${id}'`;

    conn.query(sql, (err, result) => {
        if (err) {
            res.send(err)
        } else {
            res.redirect('/list-class');
        }
    });
});

app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
});