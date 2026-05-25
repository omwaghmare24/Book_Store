// ── Helpers ──────────────────────────────────────────────

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
}

async function getBooks() {
    return apiFetch('/api/books');
}

async function getCategories() {
    try {
        return await apiFetch('/api/categories');
    } catch (e) {
        return [];
    }
}

// ── Category dropdown ─────────────────────────────────────

const DEFAULTS = ['Fiction','Technology','History','Education','Motivation','Finance','Self Help','Biography'];

async function populateCategoryDropdown(selected) {
    const stored = await getCategories();
    const storedNames = stored.map(c => c.name || c);
    const all = [...new Set([...DEFAULTS, ...storedNames])].sort();
    const sel = document.getElementById('bookCategory');
    sel.innerHTML = '<option value="">-- Select Category --</option>' +
        all.map(c => `<option value="${c}"${c === selected ? ' selected' : ''}>${c}</option>`).join('');
}

// ── Image preview ─────────────────────────────────────────

document.getElementById('bookImage').addEventListener('input', function () {
    const p = document.getElementById('imgPreview');
    if (this.value) {
        p.src = this.value;
        p.classList.add('show');
        p.onerror = () => p.classList.remove('show');
    } else {
        p.classList.remove('show');
    }
});

// ── Save / Update Book ────────────────────────────────────

async function saveBook(e) {
    e.preventDefault();

    const name     = document.getElementById('bookName').value.trim();
    const author   = document.getElementById('authorName').value.trim();
    const category = document.getElementById('bookCategory').value;
    const price    = document.getElementById('bookPrice').value.trim();
    const image    = document.getElementById('bookImage').value.trim();
    const desc     = document.getElementById('bookDesc').value.trim();
    const editId   = document.getElementById('editIndex').value;  // now stores book id

    const payload = { name, author, category, price: '₹' + price, image, desc };

    try {
        if (editId && editId !== '-1') {
            await apiFetch('/api/books/' + editId, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('✅ "' + name + '" updated!');
        } else {
            await apiFetch('/api/books', { method: 'POST', body: JSON.stringify(payload) });
            showToast('✅ "' + name + '" added to store!');
        }
        resetForm();
        await renderTable();
    } catch (err) {
        showToast('❌ Error saving book. Try again.');
    }
}

// ── Reset form ────────────────────────────────────────────

function resetForm() {
    ['bookName','authorName','bookPrice','bookImage','bookDesc'].forEach(id =>
        document.getElementById(id).value = ''
    );
    document.getElementById('bookCategory').value  = '';
    document.getElementById('editIndex').value     = '-1';
    document.getElementById('imgPreview').classList.remove('show');
    document.getElementById('formHeading').textContent    = 'Add New Book';
    document.getElementById('submitBtn').textContent      = 'Add Book';
    document.getElementById('submitBtn').style.background = '';
    document.getElementById('cancelBtn').style.display   = 'none';
}

function cancelEdit() { resetForm(); }

// ── Edit Book ─────────────────────────────────────────────

async function editBook(id) {
    const books = await getBooks();
    const b = books.find(x => x.id === id);
    if (!b) return;

    document.getElementById('bookName').value   = b.name;
    document.getElementById('authorName').value = b.author;
    document.getElementById('bookPrice').value  = b.price.replace(/[^0-9]/g, '');
    document.getElementById('bookImage').value  = b.image;
    document.getElementById('bookDesc').value   = b.desc || '';
    document.getElementById('editIndex').value  = b.id;   // store real DB id

    const p = document.getElementById('imgPreview');
    p.src = b.image;
    p.classList.add('show');

    await populateCategoryDropdown(b.category);

    document.getElementById('formHeading').textContent    = 'Edit Book';
    document.getElementById('submitBtn').textContent      = 'Update Book';
    document.getElementById('submitBtn').style.background = '#3b82f6';
    document.getElementById('cancelBtn').style.display   = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Delete Book ───────────────────────────────────────────

async function deleteBook(id) {
    const books = await getBooks();
    const b = books.find(x => x.id === id);
    if (!confirm('Delete "' + (b ? b.name : 'this book') + '"?')) return;

    try {
        await apiFetch('/api/books/' + id, { method: 'DELETE' });
        await renderTable();
        showToast('🗑️ "' + (b ? b.name : 'Book') + '" deleted.');
    } catch (err) {
        showToast('❌ Error deleting book.');
    }
}

// ── Render Table ──────────────────────────────────────────

async function renderTable() {
    const books  = await getBooks();
    const query  = document.getElementById('searchInput').value.toLowerCase();
    const tbody  = document.getElementById('booksTableBody');

    const filtered = books.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        (b.category || '').toLowerCase().includes(query)
    );

    document.getElementById('bookCount').textContent = books.length;
    document.getElementById('pageTitle').textContent = 'Books (' + books.length + ')';

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">${
            books.length === 0
                ? 'No books added yet. Use the form above to add your first book.'
                : 'No books match your search.'
        }</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((b, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><div class="book-name-cell">
                <img class="book-thumb" src="${b.image}" alt="${b.name}"
                     onerror="this.src='https://via.placeholder.com/40x52?text=?'">
                <span><strong>${b.name}</strong></span>
            </div></td>
            <td>${b.author}</td>
            <td><span class="cat-badge">${b.category || ''}</span></td>
            <td class="price-text">${b.price}</td>
            <td>
                <button class="tbl-edit-btn" onclick="editBook(${b.id})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="tbl-del-btn" onclick="deleteBook(${b.id})">
                    <i class="fa-solid fa-trash"></i> Del
                </button>
            </td>
        </tr>
    `).join('');
}

// ── Toast ─────────────────────────────────────────────────

function showToast(msg) {
    const t = document.getElementById('abToast');
    t.textContent   = msg;
    t.style.display = 'block';
    clearTimeout(t._t);
    t._t = setTimeout(() => t.style.display = 'none', 3000);
}

// ── Search live ───────────────────────────────────────────

document.getElementById('searchInput').addEventListener('input', renderTable);

// ── Init ──────────────────────────────────────────────────

populateCategoryDropdown();
renderTable();
