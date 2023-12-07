const express = require('express')
const router = express.Router()
const Book = require('../models/book')

// Get all
router.get('/', async (req, res) => {
    try {
        const books = await Book.find()
        res.render('books', { books: books })
    }
    catch (err) {
        res.status(500).json({ message: "err.message" })
    }
})

// get request for adding form page
router.get('/new', (req, res) => {
    res.render('add')
})

//get request for filling the form with old info
router.get('/edit/:id', async (req, res) => {
    let book = await Book.findById(req.params.id)
    res.render('edit', { book: book })
})

//put request for updating book
router.put("/edit/:id", async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.isbn = req.body.isbn
        await book.save()
        res.redirect('/books')
    } catch {
        if (book != null) {
            res.render('edit', { book: book })
        }
        else {
            redirect('/')
        }
    }
})

//delete request handling
router.delete('/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id)
    res.redirect("/books")
})

// get one book due to id  ( I didnt use it but WebSocket was annoying so try catch for that)
router.get('/:id', async (req, res) => {
    try {
        console.log(await Book.findById(req.params.id))
    } catch (error) {
        if (req.params.id == "ws")
            console.log("Don't worry it's WebSocket")
    }

})

// post request for creating new book
router.post('/add', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn
    })

    try {
        const newBook = await book.save()
        res.status(200).redirect('/books')
    } catch (err) {
        res.status(400).json({ message: err.message })
    }

})

module.exports = router