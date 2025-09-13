const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const OpenLibraryService = require('../services/openLibraryService');

// Helper function for error handling
const handleError = (res, error) => {
  console.error('Error:', error.message);
  return res.status(500).render('error', {
    error: 'An error occurred while processing your request.',
  });
};

// Input validation middleware
const validateBookInput = (req, res, next) => {
  const { title, author, isbn } = req.body;

  if (!title || !author || !isbn) {
    return res.status(400).render('error', {
      error: 'Title, author, and ISBN are required fields.',
    });
  }

  if (title.trim().length < 1 || author.trim().length < 1) {
    return res.status(400).render('error', {
      error: 'Title and author cannot be empty.',
    });
  }

  next();
};

// Get all books with availability status
router.get('/', async (req, res) => {
  try {
    const { search, genre, availability } = req.query;
    
    let filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (genre) {
      filter.genre = new RegExp(genre, 'i');
    }
    
    let books = await Book.find(filter)
      .populate('reservedCount')
      .sort({ registerDate: -1 });
    
    // Filter by availability if requested
    if (availability === 'available') {
      books = books.filter(book => book.isAvailable());
    } else if (availability === 'unavailable') {
      books = books.filter(book => !book.isAvailable());
    }
    
    res.render('books', { 
      books, 
      search: search || '',
      genre: genre || '',
      availability: availability || ''
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Get form for adding new book
router.get('/new', (req, res) => {
  res.render('add');
});

// Get form for editing book with proper error handling
router.get('/edit/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).render('error', {
        error: 'Book not found.',
      });
    }
    res.render('edit', { book });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).render('error', {
        error: 'Invalid book ID format.',
      });
    }
    handleError(res, error);
  }
});

// Update book with proper validation and error handling
router.put('/edit/:id', validateBookInput, async (req, res) => {
  try {
    const { title, author, isbn, quantity } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).render('error', {
        error: 'Book not found.',
      });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.isbn = isbn.trim();
    book.quantity = parseInt(quantity) || 0;

    await book.save();
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).render('error', {
        error: 'Invalid book ID format.',
      });
    }
    handleError(res, error);
  }
});

// Delete book with proper error handling
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).render('error', {
        error: 'Book not found.',
      });
    }
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).render('error', {
        error: 'Invalid book ID format.',
      });
    }
    handleError(res, error);
  }
});

// Get single book (for API purposes)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid book ID format' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new book with validation and Open Library integration
router.post('/add', validateBookInput, async (req, res) => {
  try {
    const { title, author, isbn, quantity, description, publishedYear, genre, publisher, pageCount } = req.body;

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn: isbn.trim() });
    if (existingBook) {
      return res.status(400).render('error', {
        error: 'A book with this ISBN already exists.',
      });
    }

    // Create basic book object
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      quantity: parseInt(quantity) || 1,
      description: description?.trim(),
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      genre: genre?.trim(),
      publisher: publisher?.trim(),
      pageCount: pageCount ? parseInt(pageCount) : undefined
    };

    // Try to enhance with Open Library data
    try {
      const openLibraryData = await OpenLibraryService.getBookByISBN(isbn.trim());
      if (openLibraryData) {
        // Merge Open Library data (don't override user input)
        bookData.openLibraryId = openLibraryData.key;
        bookData.coverUrl = openLibraryData.cover?.large || openLibraryData.cover?.medium;
        
        if (!bookData.description && openLibraryData.description) {
          bookData.description = openLibraryData.description;
        }
        if (!bookData.publishedYear && openLibraryData.publish_date) {
          const year = new Date(openLibraryData.publish_date).getFullYear();
          if (!isNaN(year)) bookData.publishedYear = year;
        }
        if (!bookData.publisher && openLibraryData.publishers?.[0]) {
          bookData.publisher = openLibraryData.publishers[0];
        }
        if (!bookData.pageCount && openLibraryData.number_of_pages) {
          bookData.pageCount = openLibraryData.number_of_pages;
        }
        if (openLibraryData.subjects?.length) {
          bookData.subjects = openLibraryData.subjects.slice(0, 10); // Limit subjects
        }
      }
    } catch (apiError) {
      console.warn('Failed to fetch Open Library data:', apiError.message);
      // Continue without Open Library data
    }

    const book = new Book(bookData);
    await book.save();
    res.redirect('/books');
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).render('error', {
        error: 'A book with this ISBN already exists.',
      });
    }
    handleError(res, error);
  }
});

// API endpoint to search Open Library
router.get('/api/search-openlibrary', async (req, res) => {
  try {
    const { query, type = 'title' } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await OpenLibraryService.searchBooks(query, type);
    res.json(results);
  } catch (error) {
    console.error('Open Library search error:', error);
    res.status(500).json({ error: 'Failed to search Open Library' });
  }
});

// API endpoint to get book details by ISBN
router.get('/api/isbn/:isbn', async (req, res) => {
  try {
    const bookData = await OpenLibraryService.getBookByISBN(req.params.isbn);
    if (!bookData) {
      return res.status(404).json({ error: 'Book not found in Open Library' });
    }
    res.json(bookData);
  } catch (error) {
    console.error('Open Library ISBN lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch book data' });
  }
});

module.exports = router;
