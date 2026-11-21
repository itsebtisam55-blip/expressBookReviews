const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get all books using async/await
public_users.get('/', async (req, res) => {
  const getBooks = () => new Promise((resolve) => resolve(books));
  const allBooks = await getBooks();
  return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Task 11: Get book details based on ISBN using a Promise
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    books[isbn] ? resolve(books[isbn]) : reject("Book not found");
  })
    .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch(err => res.status(404).json({ message: err }));
});

// Task 12: Get book details based on author using a Promise
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    const result = Object.keys(books)
      .filter(key => books[key].author === author)
      .map(key => ({ isbn: key, title: books[key].title, reviews: books[key].reviews }));
    result.length > 0 ? resolve(result) : reject("No books found for this author");
  })
    .then(result => res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4)))
    .catch(err => res.status(404).json({ message: err }));
});

// Task 13: Get all books based on title using a Promise
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const result = Object.keys(books)
      .filter(key => books[key].title === title)
      .map(key => ({ isbn: key, author: books[key].author, reviews: books[key].reviews }));
    result.length > 0 ? resolve(result) : reject("No books found with this title");
  })
    .then(result => res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4)))
    .catch(err => res.status(404).json({ message: err }));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

// Axios client functions (Tasks 10-13)
const BASE_URL = 'http://localhost:5000';

const getAllBooksAxios = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

const getBookByISBNAxios = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`).then(response => response.data);
};

const getBooksByAuthorAxios = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitleAxios = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`).then(response => response.data);
};

module.exports.general = public_users;
module.exports.axiosClient = { getAllBooksAxios, getBookByISBNAxios, getBooksByAuthorAxios, getBooksByTitleAxios };
