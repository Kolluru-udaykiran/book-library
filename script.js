let books = JSON.parse(localStorage.getItem("books")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// Save Data
function saveData() {
    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("history", JSON.stringify(history));
}

// Add Book
function addBook() {
    let titleInput = document.getElementById("title");
    let authorInput = document.getElementById("author");
    let categoryInput = document.getElementById("category");

    let title = titleInput.value;
    let author = authorInput.value;
    let category = categoryInput.value;

    if (!title || !author || !category) {
        alert("Please fill all fields");
        return;
    }

    let book = {
        id: Date.now(),
        title,
        author,
        category,
        borrowed: false,
        borrowDate: null,
        returnDate: null
    };

    books.push(book);
    saveData();
    updateCategoryFilter();
    displayBooks();

    // Clear inputs
    titleInput.value = "";
    authorInput.value = "";
    categoryInput.value = "";
}

// Borrow / Return Book
function borrowBook(id) {
    let book = books.find(b => b.id === id);
    let today = new Date();

    if (!book.borrowed) {
        // Borrow
        book.borrowed = true;
        book.borrowDate = today.toISOString();
        book.returnDate = null;

        history.push(`Borrowed: ${book.title} on ${formatDate(today)}`);
    } else {
        // Return
        book.borrowed = false;
        book.returnDate = today.toISOString();

        let fee = calculateFee(book.borrowDate, book.returnDate);

        history.push(`Returned: ${book.title} on ${formatDate(today)} | Fee: ₹${fee}`);
    }

    saveData();
    displayBooks();
    displayHistory();
}

// Calculate Overdue Fee
function calculateFee(borrowDate, returnDate) {
    let borrow = new Date(borrowDate);
    let ret = new Date(returnDate);

    let days = Math.floor((ret - borrow) / (1000 * 60 * 60 * 24));

    let allowedDays = 7;
    let finePerDay = 5;

    if (days > allowedDays) {
        return (days - allowedDays) * finePerDay;
    }
    return 0;
}

// Format Date
function formatDate(date) {
    return date.toLocaleDateString();
}

// Display Books
function displayBooks(list = books) {
    let bookList = document.getElementById("bookList");
    bookList.innerHTML = "";

    list.forEach(book => {

        let fee = 0;
        if (book.borrowDate && book.returnDate) {
            fee = calculateFee(book.borrowDate, book.returnDate);
        }

        let div = document.createElement("div");
        div.classList.add("book-item");

        div.innerHTML = `
            <strong>${book.title}</strong><br>
            <small>by ${book.author}</small><br>
            <small>${book.category}</small><br><br>

            <small>Borrowed: ${book.borrowDate ? formatDate(new Date(book.borrowDate)) : "-"}</small><br>
            <small>Returned: ${book.returnDate ? formatDate(new Date(book.returnDate)) : "-"}</small><br>
            <small>Fee: ₹${fee}</small>

            <div class="book-actions">
                <button onclick="borrowBook(${book.id})">
                    ${book.borrowed ? "Return" : "Borrow"}
                </button>
                <button onclick="deleteBook(${book.id})">Delete</button>
            </div>
        `;

        bookList.appendChild(div);
    });
}
// Delete Book
function deleteBook(id) {
    books = books.filter(book => book.id !== id);
    saveData();
    displayBooks();
}

// Borrow History
function displayHistory() {
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";

    history.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        historyList.appendChild(li);
    });
}

// Search
function searchBooks() {
    let search = document.getElementById("search").value.toLowerCase();

    let filtered = books.filter(book =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
    );

    displayBooks(filtered);
}

// Filter
function filterBooks() {
    let category = document.getElementById("filter").value;

    if (category === "all") {
        displayBooks();
    } else {
        displayBooks(books.filter(book => book.category === category));
    }
}

// Update Categories
function updateCategoryFilter() {
    let filter = document.getElementById("filter");

    let categories = [...new Set(books.map(book => book.category))];

    filter.innerHTML = `<option value="all">All</option>`;

    categories.forEach(cat => {
        let option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        filter.appendChild(option);
    });
}

// Load on start
window.onload = function () {
    updateCategoryFilter();
    displayBooks();
    displayHistory();

    document.getElementById("filter").addEventListener("change", filterBooks);
    document.getElementById("search").addEventListener("keyup", searchBooks);
};