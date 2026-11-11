/* Leaf & Ledger — no Firebase, no external database.
   The SEED collection is shared by every deployment. User changes are saved
   locally in this browser/device using localStorage. */
const $ = (id) => document.getElementById(id);
const BOOKS_KEY = "leafLedgerBooks";
const TRANSACTIONS_KEY = "leafLedgerTransactions";

const SEED = [
  ["BK001","The Alchemist","Paulo Coelho",1988,4,"Fiction"],
  ["BK002","The Hobbit","J. R. R. Tolkien",1937,3,"Fantasy"],
  ["BK003","Harry Potter and the Philosopher's Stone","J. K. Rowling",1997,4,"Fantasy"],
  ["BK004","The Little Prince","Antoine de Saint-Exupéry",1943,3,"Classic"],
  ["BK005","Pride and Prejudice","Jane Austen",1813,3,"Romance"],
  ["BK006","The Silent Patient","Alex Michaelides",2019,3,"Thriller"],
  ["BK007","The Girl on the Train","Paula Hawkins",2015,2,"Mystery"],
  ["BK008","Murder on the Orient Express","Agatha Christie",1934,3,"Mystery"],
  ["BK009","The Book Thief","Markus Zusak",2005,2,"Historical fiction"],
  ["BK010","The Kite Runner","Khaled Hosseini",2003,3,"Literary fiction"],
  ["BK011","A Thousand Splendid Suns","Khaled Hosseini",2007,2,"Literary fiction"],
  ["BK012","The Fault in Our Stars","John Green",2012,3,"Young adult"],
  ["BK013","The Hunger Games","Suzanne Collins",2008,3,"Dystopian"],
  ["BK014","The Midnight Library","Matt Haig",2020,3,"Fantasy"],
  ["BK015","The Seven Husbands of Evelyn Hugo","Taylor Jenkins Reid",2017,2,"Contemporary"],
  ["BK016","The Diary of a Young Girl","Anne Frank",1947,2,"Memoir"],
  ["BK017","Sapiens: A Brief History of Humankind","Yuval Noah Harari",2011,3,"Non-fiction"],
  ["BK018","Atomic Habits","James Clear",2018,3,"Self-help"],
  ["BK019","Ikigai","Héctor García and Francesc Miralles",2016,3,"Self-help"],
  ["BK020","The Power of Habit","Charles Duhigg",2012,2,"Psychology"],
  ["BK021","The Great Gatsby","F. Scott Fitzgerald",1925,2,"Classic"],
  ["BK022","To Kill a Mockingbird","Harper Lee",1960,2,"Classic"],
  ["BK023","Computer Networking: A Top-Down Approach","James Kurose and Keith Ross",2021,4,"Computer science"],
  ["BK024","Operating System Concepts","Abraham Silberschatz et al.",2018,4,"Computer science"],
  ["BK025","Database System Concepts","Abraham Silberschatz et al.",2019,3,"Computer science"],
  ["BK026","Artificial Intelligence: A Modern Approach","Stuart Russell and Peter Norvig",2021,3,"Computer science"],
  ["BK027","Introduction to Algorithms","Thomas H. Cormen et al.",2022,3,"Computer science"],
  ["BK028","Clean Code","Robert C. Martin",2008,3,"Programming"],
  ["BK029","Python Crash Course","Eric Matthes",2023,3,"Programming"],
  ["BK030","Head First Java","Kathy Sierra and Bert Bates",2005,2,"Programming"],
  ["BK031","The Pragmatic Programmer","David Thomas and Andrew Hunt",2019,3,"Programming"],
  ["BK032","Engineering Mathematics","B. S. Grewal",2017,4,"Mathematics"],
  ["BK033","Concepts of Physics, Volume 1","H. C. Verma",1992,4,"Physics"],
  ["BK034","A Textbook of Biology","Trueman",2020,3,"Biology"],
  ["BK035","Fundamentals of Database Systems","Ramez Elmasri and Shamkant Navathe",2016,3,"Computer science"],
  ["BK036","Discrete Mathematics and Its Applications","Kenneth H. Rosen",2018,3,"Mathematics"]
].map(([bookId,title,author,publicationYear,totalCopies,category]) => ({
  bookId,title,author,publicationYear,totalCopies,availableCopies:totalCopies,category,isSeed:true
}));

const INITIAL_ISSUED = [
  ["BK001","STU1001"],["BK002","STU1002"],["BK006","STU1003"],["BK008","STU1004"],
  ["BK012","STU1005"],["BK017","STU1006"],["BK023","STU1007"],["BK027","STU1008"],
  ["BK029","STU1009"],["BK033","STU1010"]
];
const INITIAL_RETURNED = [
  ["BK004","STU0991"],["BK018","STU0992"],["BK025","STU0993"]
];

let books = [];
let transactions = [];

function showMessage(id, message, type = "success") {
  const el = $(id);
  if (!el) return;
  el.textContent = message;
  el.className = `form-message ${type}`;
}
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3000);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function getBook(bookId) {
  return books.find(book => String(book.bookId).toLowerCase() === String(bookId).trim().toLowerCase());
}
function activeTransactions() {
  return transactions.filter(record => record.status === "Issued");
}
function saveData() {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  $("connectionText").textContent = "Saved on this device";
}
function initialiseData() {
  try {
    const savedBooks = JSON.parse(localStorage.getItem(BOOKS_KEY) || "null");
    const savedTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "null");
    if (Array.isArray(savedBooks) && Array.isArray(savedTransactions)) {
      books = savedBooks;
      transactions = savedTransactions;
      return;
    }
  } catch (error) {
    console.warn("Saved library data could not be read; loading the starter collection.", error);
  }

  books = SEED.map(book => ({...book}));
  transactions = [];
  const now = Date.now();
  INITIAL_ISSUED.forEach(([bookId,studentId],i) => {
    const book = getBook(bookId);
    if (book) book.availableCopies = Math.max(0, book.availableCopies - 1);
    transactions.push({
      bookId, bookTitle:book?.title || "", studentId,
      issueDate:new Date(now - (i+1)*86400000).toISOString(),
      returnDate:null,status:"Issued"
    });
  });
  INITIAL_RETURNED.forEach(([bookId,studentId],i) => {
    const book = getBook(bookId);
    transactions.push({
      bookId, bookTitle:book?.title || "", studentId,
      issueDate:new Date(now - (i+8)*86400000).toISOString(),
      returnDate:new Date(now - (i+3)*86400000).toISOString(),status:"Returned"
    });
  });
  saveData();
}
function renderDashboard() {
  $("totalBooks").textContent = books.length;
  $("availableBooks").textContent = books.reduce((sum,book) => sum + Number(book.availableCopies || 0),0);
  $("issuedBooks").textContent = activeTransactions().length;
  $("returnedBooks").textContent = transactions.filter(record => record.status === "Returned").length;
  $("inventoryCount").textContent = `${books.length} titles`;
  renderExploreBooks(); renderInventory(); renderIssuedBooks(); renderHistory();
}
function renderExploreBooks() {
  const container = $("exploreBooks");
  const term = $("searchInput").value.trim().toLowerCase();
  const filtered = [...books].sort((a,b)=>String(a.title).localeCompare(String(b.title))).filter(book =>
    [book.bookId,book.title,book.author,book.category].some(value=>String(value||"").toLowerCase().includes(term))
  );
  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state">No books match your search.</div>`;
    return;
  }
  container.innerHTML = filtered.map((book,index) => {
    const available = Number(book.availableCopies)>0;
    return `<article class="book-card">
      <div class="book-cover cover-${(index%6)+1}">${escapeHTML(String(book.title||"?").charAt(0).toUpperCase())}</div>
      <div class="book-info">
        <span class="status-badge ${available?"status-available":"status-unavailable"}">${available?"Available":"Out of stock"}</span>
        <h3>${escapeHTML(book.title)}</h3><p>by ${escapeHTML(book.author)}</p>
        <div class="book-meta">${escapeHTML(book.bookId)} · ${Number(book.availableCopies)||0} copies${book.category?" · "+escapeHTML(book.category):""}</div>
      </div></article>`;
  }).join("");
}
function renderInventory() {
  const tbody = $("inventoryTable");
  if (!books.length) { tbody.innerHTML='<tr><td colspan="6" class="table-empty">No books added yet.</td></tr>'; return; }
  tbody.innerHTML = [...books].sort((a,b)=>String(a.bookId).localeCompare(String(b.bookId))).map(book=>{
    const available=Number(book.availableCopies)>0;
    return `<tr><td><strong>${escapeHTML(book.bookId)}</strong></td><td>${escapeHTML(book.title)}</td><td>${escapeHTML(book.author)}</td><td>${escapeHTML(book.publicationYear)}</td><td>${Number(book.availableCopies)||0}</td><td><span class="status-badge ${available?"status-available":"status-unavailable"}">${available?"Available":"Unavailable"}</span></td></tr>`;
  }).join("");
}
function renderIssuedBooks() {
  const rows=activeTransactions();
  $("issuedTable").innerHTML=rows.length?rows.map(record=>`<tr><td><strong>${escapeHTML(record.bookId)}</strong></td><td>${escapeHTML(record.bookTitle)}</td><td>${escapeHTML(record.studentId)}</td><td>${formatDate(record.issueDate)}</td><td><span class="status-badge status-issued">Issued</span></td></tr>`).join(""):'<tr><td colspan="5" class="table-empty">No books are currently issued.</td></tr>';
}
function renderHistory() {
  const rows=[...transactions].sort((a,b)=>new Date(b.issueDate||0)-new Date(a.issueDate||0));
  $("historyTable").innerHTML=rows.length?rows.map(record=>`<tr><td><strong>${escapeHTML(record.bookId)}</strong></td><td>${escapeHTML(record.bookTitle)}</td><td>${escapeHTML(record.studentId)}</td><td>${formatDate(record.issueDate)}</td><td>${formatDate(record.returnDate)}</td><td><span class="status-badge ${record.status==="Issued"?"status-issued":"status-returned"}">${escapeHTML(record.status)}</span></td></tr>`).join(""):'<tr><td colspan="6" class="table-empty">No transaction history available.</td></tr>';
}
function addBook(event) {
  event.preventDefault();
  const book={bookId:$("bookId").value.trim(),title:$("bookTitle").value.trim(),author:$("bookAuthor").value.trim(),publicationYear:Number($("bookYear").value),availableCopies:Number($("bookCopies").value)};
  const year=new Date().getFullYear();
  if(!book.bookId||!book.title||!book.author) return showMessage("addBookMessage","Please fill in all required fields.","error");
  if(!Number.isInteger(book.publicationYear)||book.publicationYear<1||book.publicationYear>year) return showMessage("addBookMessage","Please enter a valid publication year.","error");
  if(!Number.isInteger(book.availableCopies)||book.availableCopies<0) return showMessage("addBookMessage","Available copies must be zero or greater.","error");
  if(getBook(book.bookId)) return showMessage("addBookMessage","A book with this ID already exists.","error");
  books.push({...book,totalCopies:book.availableCopies,isSeed:false});
  saveData(); renderDashboard(); event.target.reset();
  showMessage("addBookMessage","Book added successfully!"); toast("New book added to this device's library.");
}
function issueBook(event) {
  event.preventDefault();
  const bookId=$("issueBookId").value.trim(), studentId=$("issueStudentId").value.trim();
  const book=getBook(bookId);
  if(!book) return showMessage("issueMessage","Book not found. Please check the Book ID.","error");
  if(!studentId) return showMessage("issueMessage","Please enter a valid Student ID.","error");
  if(Number(book.availableCopies)<=0) return showMessage("issueMessage","No copies of this book are currently available.","error");
  book.availableCopies-=1;
  transactions.push({bookId:book.bookId,bookTitle:book.title,studentId,issueDate:new Date().toISOString(),returnDate:null,status:"Issued"});
  saveData(); renderDashboard(); event.target.reset();
  showMessage("issueMessage",`Successfully issued "${book.title}" to ${studentId}.`); toast("Book issued successfully.");
}
function returnBook(event) {
  event.preventDefault();
  const bookId=$("returnBookId").value.trim(), studentId=$("returnStudentId").value.trim();
  const book=getBook(bookId);
  if(!book) return showMessage("returnMessage","Book not found. Please check the Book ID.","error");
  const record=transactions.find(row=>String(row.bookId).toLowerCase()===book.bookId.toLowerCase()&&String(row.studentId).toLowerCase()===studentId.toLowerCase()&&row.status==="Issued");
  if(!record) return showMessage("returnMessage","No matching outstanding issue record exists for this student and book.","error");
  record.status="Returned"; record.returnDate=new Date().toISOString(); book.availableCopies=Number(book.availableCopies||0)+1;
  saveData(); renderDashboard(); event.target.reset();
  showMessage("returnMessage",`Successfully returned "${book.title}".`); toast("Book returned successfully.");
}
function exportBackup() {
  const payload={exportedAt:new Date().toISOString(),books,transactions};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url; anchor.download=`leaf-ledger-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  toast("Backup downloaded.");
}

initialiseData();
renderDashboard();
$("addBookForm").addEventListener("submit",addBook);
$("issueForm").addEventListener("submit",issueBook);
$("returnForm").addEventListener("submit",returnBook);
$("searchInput").addEventListener("input",renderExploreBooks);
$("clearSearch").addEventListener("click",()=>{$("searchInput").value="";renderExploreBooks();});
$("exportButton").addEventListener("click",exportBackup);
document.querySelectorAll(".nav-link").forEach(link=>link.addEventListener("click",()=>{
  document.querySelectorAll(".nav-link").forEach(item=>item.classList.remove("active"));
  link.classList.add("active");
}));
