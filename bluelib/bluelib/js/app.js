/* AI Assistance Disclosure: Developed with the assistance of Claude AI. All code has been reviewed, adapted, and tested by the author. */

/* app.js - all functions for BlueLib Catalogue.
   Depends on booksData (Map) from data.js. */

// ---------- State ----------
const books = new Map(booksData);          // working copy of the Map
let nextId = Math.max(...books.keys()) + 1; // id for newly added books
let notifications = [];                     // activity messages
let unread = 0;                             // notification badge count

// ---------- DOM references ----------
const grid = document.getElementById("book-grid");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter-category");
const resultCount = document.getElementById("result-count");
const emptyMsg = document.getElementById("empty-msg");
const form = document.getElementById("add-form");
const formMsg = document.getElementById("form-msg");
const notifBtn = document.getElementById("notif-btn");
const notifPanel = document.getElementById("notif-panel");
const notifBadge = document.getElementById("notif-badge");
const notifList = document.getElementById("notif-list");

// ---------- Book cover images (drawn in code, no image files needed) ----------

/** Colours and decorative icon for each category. */
const COVER_STYLES = {
  IT:       { c1: "#1d4ed8", c2: "#60a5fa", icon: '<text x="330" y="118" font-size="70" font-family="monospace" font-weight="700" fill="#fff" fill-opacity=".45" text-anchor="middle">&lt;/&gt;</text>' },
  Business: { c1: "#c2410c", c2: "#fdba74", icon: '<g fill="#fff" fill-opacity=".45"><rect x="282" y="82" width="26" height="44" rx="3"/><rect x="318" y="56" width="26" height="70" rx="3"/><rect x="354" y="30" width="26" height="96" rx="3"/></g>' },
  Science:  { c1: "#047857", c2: "#6ee7b7", icon: '<g fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5"><ellipse cx="330" cy="80" rx="52" ry="19"/><ellipse cx="330" cy="80" rx="52" ry="19" transform="rotate(60 330 80)"/><ellipse cx="330" cy="80" rx="52" ry="19" transform="rotate(120 330 80)"/></g><circle cx="330" cy="80" r="9" fill="#fff"/>' },
  Arts:     { c1: "#be185d", c2: "#f9a8d4", icon: '<g fill="#fff" fill-opacity=".45"><circle cx="298" cy="76" r="24"/><circle cx="346" cy="52" r="17"/><circle cx="356" cy="102" r="28"/></g>' }
};

/** Escapes text so it is safe inside SVG. */
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Splits a title into lines of roughly 18 characters (max 3 lines). */
function wrapTitle(title) {
  const lines = [];
  let line = "";
  title.split(" ").forEach(function (word) {
    if ((line + " " + word).trim().length > 18 && line) { lines.push(line); line = word; }
    else { line = (line + " " + word).trim(); }
  });
  lines.push(line);
  return lines.slice(0, 3);
}

/** Builds a colourful SVG cover for a book and returns it as an image URL. */
function coverUrl(book) {
  const st = COVER_STYLES[book.category];
  const tspans = wrapTitle(book.title).map(function (l, i) {
    return '<tspan x="28" dy="' + (i === 0 ? 0 : 38) + '">' + escapeXml(l) + "</tspan>";
  }).join("");
  const pill = 22 + 10 * book.category.length;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + st.c1 + '"/><stop offset="1" stop-color="' + st.c2 + '"/></linearGradient></defs>' +
    '<rect width="400" height="300" fill="url(#g)"/>' +
    '<circle cx="380" cy="300" r="140" fill="#fff" fill-opacity=".1"/><circle cx="-10" cy="-10" r="90" fill="#fff" fill-opacity=".1"/>' +
    '<rect width="14" height="300" fill="#000" fill-opacity=".2"/>' + st.icon +
    '<rect x="28" y="24" width="' + pill + '" height="26" rx="13" fill="#fff" fill-opacity=".9"/>' +
    '<text x="' + (28 + pill / 2) + '" y="42" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="' + st.c1 + '" text-anchor="middle">' + book.category.toUpperCase() + "</text>" +
    '<text x="28" y="150" font-family="Georgia,serif" font-size="32" font-weight="700" fill="#fff">' + tspans + "</text>" +
    '<line x1="28" y1="250" x2="120" y2="250" stroke="#fff" stroke-width="3"/>' +
    '<text x="28" y="277" font-family="Arial,sans-serif" font-size="16" fill="#fff">' + escapeXml(book.author) + "</text></svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// ---------- Rendering ----------

/** Returns books (as an array) that match the search text and category. */
function getFilteredBooks() {
  const text = searchInput.value.trim().toLowerCase();
  const cat = filterSelect.value;
  return Array.from(books.values()).filter(function (b) {
    const matchTitle = b.title.toLowerCase().includes(text);
    const matchCat = cat === "All" || b.category === cat;
    return matchTitle && matchCat;
  });
}

/** Builds one book card element. */
function createCard(book) {
  const card = document.createElement("article");
  card.className = "card cat-" + book.category.toLowerCase();

  // Cover image generated by coverUrl()
  const img = document.createElement("img");
  img.className = "cover";
  img.src = coverUrl(book);
  img.alt = book.title + " book cover";
  img.width = 400;
  img.height = 300;
  img.loading = "lazy";

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.textContent = "Author: " + book.author;

  const cat = document.createElement("span");
  cat.className = "tag";
  cat.textContent = book.category;

  const copies = document.createElement("p");
  copies.className = "copies";
  copies.textContent = "Copies available: " + book.copies;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn";
  btn.dataset.id = book.id;
  btn.dataset.action = "borrow";
  if (book.copies === 0) {
    btn.textContent = "Out of stock";
    btn.disabled = true;
  } else {
    btn.textContent = "Borrow";
  }

  card.append(img, title, author, cat, copies, btn);
  return card;
}

/** Clears and redraws the grid using the current filters. */
function renderBooks() {
  const list = getFilteredBooks();
  grid.replaceChildren(...list.map(createCard));
  emptyMsg.hidden = list.length !== 0;
  updateStats();
  resultCount.textContent = "Showing " + list.length + " of " + books.size + " books";
}

/** Updates the hero statistics (titles, copies, out of stock). */
function updateStats() {
  const all = Array.from(books.values());
  document.getElementById("stat-titles").textContent = all.length;
  document.getElementById("stat-copies").textContent = all.reduce(function (sum, b) { return sum + b.copies; }, 0);
  document.getElementById("stat-out").textContent = all.filter(function (b) { return b.copies === 0; }).length;
}

// ---------- Borrow ----------

/** Reduces copies of a book by 1 and refreshes the page. */
function borrowBook(id) {
  const book = books.get(id);
  if (!book || book.copies === 0) return;
  book.copies -= 1;
  addNotification("Borrowed \"" + book.title + "\" (" + book.copies + " left)");
  renderBooks();
}

// ---------- Add book ----------

/** Validates form values; returns an error string or "" if valid. */
function validateBook(title, author, category, copies) {
  if (!title || !author || !category || copies === "") {
    return "Please fill in all fields.";
  }
  const n = Number(copies);
  if (!Number.isInteger(n) || n < 0) {
    return "Copies must be a whole number of 0 or more.";
  }
  return "";
}

/** Handles the Add Book form submission. */
function handleAddBook(event) {
  event.preventDefault();
  const title = form.title.value.trim();
  const author = form.author.value.trim();
  const category = form.category.value;
  const copies = form.copies.value.trim();

  const error = validateBook(title, author, category, copies);
  if (error) {
    formMsg.textContent = error;
    formMsg.className = "form-msg error";
    return;
  }

  books.set(nextId, { id: nextId, title: title, author: author, category: category, copies: Number(copies) });
  nextId += 1;
  addNotification("Added new book \"" + title + "\"");
  form.reset();
  formMsg.textContent = "Book added successfully!";
  formMsg.className = "form-msg success";
  renderBooks();
}

// ---------- Notifications ----------

/** Adds a message to the activity list and bumps the badge. */
function addNotification(message) {
  notifications.unshift(message);
  if (notifPanel.hidden) unread += 1;
  updateNotifications();
}

/** Redraws the notification list and badge. */
function updateNotifications() {
  notifList.replaceChildren();
  if (notifications.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "No activity yet.";
    notifList.append(li);
  } else {
    notifications.forEach(function (msg) {
      const li = document.createElement("li");
      li.textContent = msg;
      notifList.append(li);
    });
  }
  notifBadge.textContent = unread;
  notifBadge.hidden = unread === 0;
}

/** Opens or closes the notification panel; opening marks all as read. */
function toggleNotifPanel() {
  const open = notifPanel.hidden;
  notifPanel.hidden = !open;
  notifBtn.setAttribute("aria-expanded", String(open));
  if (open) unread = 0;
  updateNotifications();
}

/** Removes all notifications. */
function clearNotifications() {
  notifications = [];
  unread = 0;
  updateNotifications();
}

// ---------- Other buttons ----------

/** Clears search + category filter. */
function resetFilters() {
  searchInput.value = "";
  filterSelect.value = "All";
  renderBooks();
}

// ---------- Event listeners ----------
searchInput.addEventListener("input", renderBooks);
filterSelect.addEventListener("change", renderBooks);
document.getElementById("reset-filters").addEventListener("click", resetFilters);
form.addEventListener("submit", handleAddBook);
form.addEventListener("reset", function () { formMsg.textContent = ""; formMsg.className = "form-msg"; });
notifBtn.addEventListener("click", toggleNotifPanel);
document.getElementById("notif-clear").addEventListener("click", clearNotifications);
document.getElementById("back-top").addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// One listener for all Borrow buttons (event delegation)
grid.addEventListener("click", function (event) {
  const btn = event.target.closest("button[data-action='borrow']");
  if (btn) borrowBook(Number(btn.dataset.id));
});

// ---------- Init ----------
renderBooks();
updateNotifications();
