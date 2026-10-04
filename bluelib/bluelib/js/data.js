/* AI Assistance Disclosure: Developed with the assistance of Claude AI. All code has been reviewed, adapted, and tested by the author. */

/* data.js - data feeding.
   Books are stored in a Map (key = book id, value = book object).
   app.js reads this Map and converts it to an array with Array.from(). */
const booksData = new Map([
  [1, { id: 1, title: "Clean Code", author: "Robert C. Martin", category: "IT", copies: 4 }],
  [2, { id: 2, title: "JavaScript: The Good Parts", author: "Douglas Crockford", category: "IT", copies: 3 }],
  [3, { id: 3, title: "The Lean Startup", author: "Eric Ries", category: "Business", copies: 5 }],
  [4, { id: 4, title: "Good to Great", author: "Jim Collins", category: "Business", copies: 2 }],
  [5, { id: 5, title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", copies: 3 }],
  [6, { id: 6, title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", copies: 1 }],
  [7, { id: 7, title: "The Story of Art", author: "E. H. Gombrich", category: "Arts", copies: 2 }],
  [8, { id: 8, title: "Ways of Seeing", author: "John Berger", category: "Arts", copies: 0 }]
]);
