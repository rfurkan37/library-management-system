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

router.get('/new', (req, res) => {
    res.render('add')
})

router.get('/edit/:id', async (req, res) => {
    let book = await Book.findById(req.params.id)
    res.render('edit', { book: book })
})

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

router.delete('/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id)
    res.redirect("/books")
})
// Get one
router.get('/:id', async (req, res) => {
    try {
        console.log(await Book.findById(req.params.id))
    } catch (error) {
        if (req.params.id == "ws")
            console.log("Don't worry it's WebSocket")
    }

})


// Create one
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
// Update one
router.patch('/:id', async (req, res) => {
    if (req.body.title != null) {
        res.book.title = req.body.title
    }
    if (req.body.author != null) {
        res.book.author = req.body.author
    }
    try {
        const updatedBook = await res.book.save()
        res.json(updatedBook)
    } catch (err) {
        res.status(400).json({ message: err.message })

    }

})
// Delete one






module.exports = router