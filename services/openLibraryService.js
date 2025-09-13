const axios = require('axios');

class OpenLibraryService {
  static async getBookDetails(isbn) {
    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      
      // API call to get book details
      const response = await axios.get(
        `http://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&jscmd=details&format=json`,
        { timeout: 5000 }
      );

      const bookKey = `ISBN:${cleanISBN}`;
      const bookData = response.data[bookKey];

      if (!bookData) {
        return null;
      }

      // Extract book information
      const details = bookData.details;
      const result = {
        isbn: cleanISBN,
        title: details.title || '',
        authors: [],
        publishYear: null,
        pageCount: details.number_of_pages || null,
        publisher: '',
        description: '',
        subjects: [],
        coverUrl: this.getCoverUrl(cleanISBN, 'M'), // Medium size cover
        largeCoverUrl: this.getCoverUrl(cleanISBN, 'L'), // Large size cover
        smallCoverUrl: this.getCoverUrl(cleanISBN, 'S'), // Small size cover
      };

      // Extract authors
      if (details.authors && Array.isArray(details.authors)) {
        result.authors = details.authors.map(author => 
          author.name || (typeof author === 'string' ? author : 'Unknown Author')
        );
      }

      // Extract publish year
      if (details.publish_date) {
        const yearMatch = details.publish_date.match(/\d{4}/);
        if (yearMatch) {
          result.publishYear = parseInt(yearMatch[0]);
        }
      }

      // Extract publisher
      if (details.publishers && Array.isArray(details.publishers)) {
        result.publisher = details.publishers[0] || '';
      }

      // Extract description
      if (details.description) {
        if (typeof details.description === 'object' && details.description.value) {
          result.description = details.description.value;
        } else if (typeof details.description === 'string') {
          result.description = details.description;
        }
      }

      // Extract subjects
      if (details.subjects && Array.isArray(details.subjects)) {
        result.subjects = details.subjects.slice(0, 5); // Limit to first 5 subjects
      }

      return result;
    } catch (error) {
      console.error('Error fetching book details from Open Library:', error.message);
      return null;
    }
  }

  static getCoverUrl(isbn, size = 'M') {
    // Size options: S (small), M (medium), L (large)
    return `http://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  }

  static async checkCoverExists(isbn, size = 'M') {
    try {
      const coverUrl = this.getCoverUrl(isbn, size);
      const response = await axios.head(coverUrl, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Search books by title or author
  static async searchBooks(query, limit = 10) {
    try {
      const response = await axios.get(
        `http://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`,
        { timeout: 5000 }
      );

      const books = response.data.docs || [];
      
      return books.map(book => ({
        title: book.title || 'Unknown Title',
        authors: book.author_name || ['Unknown Author'],
        publishYear: book.first_publish_year || null,
        isbn: book.isbn ? book.isbn[0] : null,
        coverUrl: book.cover_i ? `http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        publisher: book.publisher ? book.publisher[0] : null,
        pageCount: book.number_of_pages_median || null,
      }));
    } catch (error) {
      console.error('Error searching books from Open Library:', error.message);
      return [];
    }
  }

  // Alias for getBookDetails method
  static async getBookByISBN(isbn) {
    return this.getBookDetails(isbn);
  }
}

module.exports = OpenLibraryService;