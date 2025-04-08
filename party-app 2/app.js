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
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const checkQuery = 'SELECT * FROM party_list WHERE username = ?';
            db.query(checkQuery, [username], (err, results2) => {
                if (err) throw err;
                if (results2.length === 0) {
                    db.query('INSERT INTO party_list (username) VALUES (?)', [username]);
                }
                db.query('SELECT * FROM party_list', (err, partyResults) => {
                    if (err) throw err;
                    res.render('party', { partyList: partyResults });
                });
            });
        } else {
            res.send('Login failed. Try again.');
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
