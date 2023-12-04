const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
const port = 3000;


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kastamonu',
    database: 'library'
});

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

db.connect((err) => {
    if (err) throw err;
    console.log('Database is connected successfully !');
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('books');
});

app.get('/books', (req, res) => {
    let sql = 'SELECT * FROM books';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('books', { books: result, formatDate: formatDate });
    });
});


app.get('/books/add-book', (req, res) => {
    res.render('index');
});

app.post('/books/add-book', (req, res) => {
    const { title, author, location, isbn } = req.body;
    const book = { title, author, location, isbn};

    db.query('INSERT INTO books SET ?', book, (err, result) => {
        if (err) throw err;
        res.redirect('/books');
    });
});

app.post('/books/delete-book/:id', (req, res) => {
    const bookId = req.params.id;
    console.log('Book ID:', bookId);
    db.query('DELETE FROM books WHERE id = ?', bookId, (err, result) => {
        if (err) throw err;
        console.log('Database result:', result);
        res.redirect('/books');
    });
});

app.get('/books/edit-book/:id', (req, res) => {
    const bookId = req.params.id;
    console.log('Book ID:', bookId);
    db.query('SELECT * FROM books WHERE id = ?', bookId, (err, result) => {
        if (err) throw err;
        console.log('Database result:', result);
        res.render('edit', { book: result[0]});
    });
});

app.post('/books/edit-book/:id', (req, res) => {
    const bookId = req.params.id;
    const { title, author, location,is_available, isbn } = req.body;
    const updatedBook = { title, author, location, is_available, isbn };

    db.query('UPDATE books SET ? WHERE id = ?', [updatedBook, bookId], (err, result) => {
        if (err) throw err;
        res.redirect('/books');
    });
});





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

