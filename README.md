# Leaf & Ledger — No Firebase Edition

A responsive Library Management System using only HTML, CSS, JavaScript and browser `localStorage`.

## Run it
- Open `index.html` in a browser, or publish the folder to GitHub Pages.
- No Firebase project, login, database, API key or server setup is required.

## Preloaded collection
- `script.js` contains a `SEED` array with 36 books across fiction, fantasy, mystery, romance, non-fiction and study/computer-science subjects.
- The first launch automatically loads the seed collection on every device.
- The starter data includes 10 currently issued books and 3 returned transactions.
- Every user can add books, issue books and return books.

## Important storage behaviour
- The predefined `SEED` list is included in the deployed JavaScript, so it appears on every device.
- New books and issue/return changes are stored in that browser/device's `localStorage`. They do not sync to other phones.
- To change the predefined collection for everyone, edit the `SEED` array in `script.js` and push the updated files to GitHub.
- Use **Export backup** to download the current device's books and transactions as JSON.
- Clearing browser site data will clear locally added books and transactions on that device; the predefined seed collection will load again.

## Files
- `index.html` — application layout
- `style.css` — responsive styling
- `script.js` — seed data and all application functionality
