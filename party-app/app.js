const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'xmkms@123',
    database: 'partydb'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.send('User already exists.');
            } else {
                throw err;
            }
        } else {
            res.redirect('/login');
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const checkQuery = 'SELECT * FROM party_list WHERE username = ?';
            db.query(checkQuery, [username], (err, checkResults) => {
                if (err) throw err;
                if (checkResults.length === 0) {
                    db.query('INSERT INTO party_list (username) VALUES (?)', [username]);
                }
                res.render('dashboard', { username });
            });
        } else {
            res.send('Login failed. Try again.');
        }
    });
});

app.get('/party', (req, res) => {
    db.query('SELECT * FROM party_list', (err, results) => {
        if (err) throw err;
        res.render('party', { partyList: results });
    });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
