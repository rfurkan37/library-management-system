# 📚 Library Management System API Documentation

This document provides comprehensive documentation for all API endpoints available in the Library Management System.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API does not require authentication. This is suitable for local deployment or internal library systems.

---

## 📖 Books API

### Get All Books
**GET** `/books`

Returns a list of all books with optional filtering and search capabilities.

**Query Parameters:**
- `search` (string, optional): Search term for title, author, or ISBN
- `genre` (string, optional): Filter by book genre
- `availability` (string, optional): Filter by availability status
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 20)

**Response:**
```json
{
  "books": [
    {
      "_id": "607f1f77bcf86cd799439011",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "9780743273565",
      "quantity": 3,
      "availableQuantity": 2,
      "description": "A classic American novel...",
      "publishedYear": 1925,
      "genre": "Fiction",
      "publisher": "Scribner",
      "pageCount": 180,
      "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
      "createdAt": "2021-04-20T10:15:39.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Book by ID
**GET** `/books/:id`

Returns detailed information about a specific book.

**Parameters:**
- `id` (string): MongoDB ObjectId of the book

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 3,
  "availableQuantity": 2,
  "description": "A classic American novel set in the Jazz Age...",
  "publishedYear": 1925,
  "genre": "Fiction",
  "publisher": "Scribner",
  "pageCount": 180,
  "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
  "createdAt": "2021-04-20T10:15:39.000Z"
}
```

### Create New Book
**POST** `/books`

Creates a new book in the library system.

**Request Body:**
```json
{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "isbn": "9780061120084",
  "quantity": 2,
  "description": "A novel about racial injustice...",
  "publishedYear": 1960,
  "genre": "Fiction",
  "publisher": "J.B. Lippincott & Co.",
  "pageCount": 376
}
```

**Response:**
```json
{
  "message": "Book created successfully",
  "book": {
    "_id": "607f1f77bcf86cd799439012",
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "isbn": "9780061120084",
    "quantity": 2,
    "availableQuantity": 2,
    "description": "A novel about racial injustice...",
    "publishedYear": 1960,
    "genre": "Fiction",
    "publisher": "J.B. Lippincott & Co.",
    "pageCount": 376,
    "coverUrl": "http://covers.openlibrary.org/b/isbn/9780061120084-M.jpg",
    "createdAt": "2021-04-20T10:20:15.000Z"
  }
}
```

### Update Book
**PUT** `/books/:id`

Updates an existing book's information.

**Parameters:**
- `id` (string): MongoDB ObjectId of the book

**Request Body:** (partial updates supported)
```json
{
  "quantity": 4,
  "description": "Updated description..."
}
```

**Response:**
```json
{
  "message": "Book updated successfully",
  "book": {
    "_id": "607f1f77bcf86cd799439011",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "quantity": 4,
    "availableQuantity": 3,
    "description": "Updated description...",
    "publishedYear": 1925,
    "genre": "Fiction",
    "publisher": "Scribner",
    "pageCount": 180,
    "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
    "createdAt": "2021-04-20T10:15:39.000Z"
  }
}
```

### Delete Book
**DELETE** `/books/:id`

Removes a book from the library system.

**Parameters:**
- `id` (string): MongoDB ObjectId of the book

**Response:**
```json
{
  "message": "Book deleted successfully"
}
```

### Get Book by ISBN (External API)
**GET** `/books/api/isbn/:isbn`

Fetches book information from Open Library API using ISBN.

**Parameters:**
- `isbn` (string): ISBN-10 or ISBN-13

**Response:**
```json
{
  "title": "The Catcher in the Rye",
  "author": "J.D. Salinger",
  "isbn": "9780316769174",
  "description": "A controversial novel...",
  "publishedYear": 1951,
  "pageCount": 234,
  "publisher": "Little, Brown and Company",
  "coverUrl": "http://covers.openlibrary.org/b/isbn/9780316769174-M.jpg",
  "largeCoverUrl": "http://covers.openlibrary.org/b/isbn/9780316769174-L.jpg",
  "smallCoverUrl": "http://covers.openlibrary.org/b/isbn/9780316769174-S.jpg"
}
```

---

## 🎫 Reservations API

### Get All Reservations
**GET** `/reservations`

Returns a list of all reservations with filtering options.

**Query Parameters:**
- `status` (string, optional): Filter by status (active, returned, overdue, cancelled)
- `customer` (string, optional): Filter by customer ID
- `book` (string, optional): Filter by book ID
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Number of items per page

**Response:**
```json
{
  "reservations": [
    {
      "_id": "607f1f77bcf86cd799439021",
      "book": {
        "_id": "607f1f77bcf86cd799439011",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
      },
      "customer": {
        "_id": "607f1f77bcf86cd799439031",
        "name": "John Doe",
        "email": "john.doe@email.com",
        "phone": "+1234567890"
      },
      "reservationDate": "2021-04-20T10:00:00.000Z",
      "dueDate": "2021-05-04T10:00:00.000Z",
      "status": "active",
      "fine": 0,
      "notes": ""
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Reservation by ID
**GET** `/reservations/:id`

Returns detailed information about a specific reservation.

**Parameters:**
- `id` (string): MongoDB ObjectId of the reservation

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439021",
  "book": {
    "_id": "607f1f77bcf86cd799439011",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
  },
  "customer": {
    "_id": "607f1f77bcf86cd799439031",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  },
  "reservationDate": "2021-04-20T10:00:00.000Z",
  "dueDate": "2021-05-04T10:00:00.000Z",
  "status": "active",
  "fine": 0,
  "notes": "Customer requested extended loan period"
}
```

### Create New Reservation
**POST** `/reservations`

Creates a new book reservation.

**Request Body:**
```json
{
  "customerId": "607f1f77bcf86cd799439031",
  "bookId": "607f1f77bcf86cd799439011",
  "dueDate": "2021-05-04T10:00:00.000Z",
  "notes": "Regular loan period"
}
```

**Response:**
```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "_id": "607f1f77bcf86cd799439021",
    "book": "607f1f77bcf86cd799439011",
    "customer": "607f1f77bcf86cd799439031",
    "reservationDate": "2021-04-20T10:00:00.000Z",
    "dueDate": "2021-05-04T10:00:00.000Z",
    "status": "active",
    "fine": 0,
    "notes": "Regular loan period"
  }
}
```

### Return Book
**PUT** `/reservations/:id/return`

Marks a reservation as returned and updates book availability.

**Parameters:**
- `id` (string): MongoDB ObjectId of the reservation

**Request Body:** (optional)
```json
{
  "notes": "Book returned in good condition"
}
```

**Response:**
```json
{
  "message": "Book returned successfully",
  "reservation": {
    "_id": "607f1f77bcf86cd799439021",
    "status": "returned",
    "returnDate": "2021-04-25T14:30:00.000Z",
    "fine": 0,
    "notes": "Book returned in good condition"
  }
}
```

### Renew Reservation
**PUT** `/reservations/:id/renew`

Extends the due date of an active reservation.

**Parameters:**
- `id` (string): MongoDB ObjectId of the reservation

**Request Body:**
```json
{
  "newDueDate": "2021-05-18T10:00:00.000Z",
  "notes": "Renewal requested by customer"
}
```

**Response:**
```json
{
  "message": "Reservation renewed successfully",
  "reservation": {
    "_id": "607f1f77bcf86cd799439021",
    "dueDate": "2021-05-18T10:00:00.000Z",
    "notes": "Renewal requested by customer"
  }
}
```

### Cancel Reservation
**DELETE** `/reservations/:id`

Cancels an active reservation and updates book availability.

**Parameters:**
- `id` (string): MongoDB ObjectId of the reservation

**Response:**
```json
{
  "message": "Reservation cancelled successfully"
}
```

### Get Overdue Reservations
**GET** `/reservations/status/overdue`

Returns all overdue reservations and automatically updates their status.

**Response:**
```json
{
  "count": 2,
  "reservations": [
    {
      "_id": "607f1f77bcf86cd799439022",
      "book": {
        "title": "1984",
        "author": "George Orwell",
        "isbn": "9780451524935"
      },
      "customer": {
        "name": "Jane Smith",
        "email": "jane.smith@email.com",
        "phone": "+1234567891"
      },
      "reservationDate": "2021-04-01T10:00:00.000Z",
      "dueDate": "2021-04-15T10:00:00.000Z",
      "status": "overdue",
      "fine": 5.00
    }
  ]
}
```

---

## 👥 Customers API

### Get All Customers
**GET** `/reservations/customers`

Returns a list of all customers with search and pagination.

**Query Parameters:**
- `search` (string, optional): Search by name, email, or phone
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Number of items per page

**Response:**
```json
{
  "customers": [
    {
      "_id": "607f1f77bcf86cd799439031",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1234567890",
      "address": "123 Main St, City, State",
      "createdAt": "2021-04-20T09:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Customer by ID
**GET** `/reservations/customers/:id`

Returns detailed customer information including reservation history.

**Parameters:**
- `id` (string): MongoDB ObjectId of the customer

**Response:**
```json
{
  "customer": {
    "_id": "607f1f77bcf86cd799439031",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "createdAt": "2021-04-20T09:00:00.000Z"
  },
  "reservations": [
    {
      "_id": "607f1f77bcf86cd799439021",
      "book": {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "coverUrl": "http://covers.openlibrary.org/b/isbn/9780743273565-M.jpg"
      },
      "reservationDate": "2021-04-20T10:00:00.000Z",
      "dueDate": "2021-05-04T10:00:00.000Z",
      "status": "active"
    }
  ],
  "stats": {
    "totalReservations": 3,
    "activeReservations": 1,
    "overdueReservations": 0,
    "totalFines": 0
  }
}
```

### Create New Customer
**POST** `/reservations/customers`

Creates a new customer profile.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@email.com",
  "phone": "+1234567892",
  "address": "456 Oak Ave, City, State"
}
```

**Response:**
```json
{
  "message": "Customer created successfully",
  "customer": {
    "_id": "607f1f77bcf86cd799439032",
    "name": "Alice Johnson",
    "email": "alice.johnson@email.com",
    "phone": "+1234567892",
    "address": "456 Oak Ave, City, State",
    "createdAt": "2021-04-20T11:00:00.000Z"
  }
}
```

---

## 🚨 Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Book not found"
}
```

### 409 Conflict
```json
{
  "error": "A book with this ISBN already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch books"
}
```

---

## 📝 Notes

1. **Date Format**: All dates are in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **MongoDB ObjectIds**: All `_id` fields are MongoDB ObjectIds (24-character hex strings)
3. **Pagination**: Default page size is 20 items
4. **Search**: Search operations are case-insensitive
5. **External API**: Open Library API integration provides book metadata and cover images
6. **Validation**: All inputs are validated both client-side and server-side

---

## 🔧 Development

To test these endpoints during development:

1. **Start the server**: `npm run dev`
2. **Use a REST client**: Postman, Insomnia, or curl
3. **Base URL**: `http://localhost:3000`
4. **Content-Type**: `application/json` for POST/PUT requests

### Example curl commands:

```bash
# Get all books
curl -X GET http://localhost:3000/books

# Create a new book
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Example Book", "author": "John Author", "isbn": "9781234567890"}'

# Get book by ISBN from Open Library
curl -X GET http://localhost:3000/books/api/isbn/9780743273565
```