// ── API helpers ──────────────────────────────────────────────────────────

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    return res.json();
}

async function getCategoriesFromAPI() {
    try {
        return await apiFetch('/api/categories');
    } catch (e) {
        return [];
    }
}

async function getBooksFromAPI() {
    try {
        return await apiFetch('/api/books');
    } catch (e) {
        return [];
    }
}

// ── Add category ─────────────────────────────────────────────────────────

async function addCategory(e) {

    e.preventDefault();

    const name = document.getElementById('catName').value.trim();
    const icon = document.getElementById('catIcon').value;

    if (!name) return;

    const cats = await getCategoriesFromAPI();

    if (cats.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Category already exists!');
        return;
    }

    try {
        await apiFetch('/api/categories', {
            method: 'POST',
            body: JSON.stringify({ name, icon, is_default: false })
        });

        document.getElementById('catName').value = '';
        await renderGrid();
        showToast('Category added successfully!');

    } catch (err) {
        showToast('❌ Error adding category. Try again.');
    }
}

// ── Delete category ───────────────────────────────────────────────────────

async function deleteCategory(id, name) {

    if (!confirm('Delete category "' + name + '" ?')) return;

    try {
        await apiFetch('/api/categories/' + id, { method: 'DELETE' });
        await renderGrid();
        showToast('Category deleted successfully!');
    } catch (err) {
        showToast('❌ Error deleting category.');
    }
}

// ── Render grid ───────────────────────────────────────────────────────────

async function renderGrid() {

    const [cats, books] = await Promise.all([
        getCategoriesFromAPI(),
        getBooksFromAPI()
    ]);

    const grid = document.getElementById('categoryGrid');

    if (cats.length === 0) {
        grid.innerHTML = `<p style="color:#94a3b8;padding:20px 0;">No categories yet. Add one above.</p>`;
        return;
    }

    grid.innerHTML = cats.map(c => {

        const count = books.filter(b => b.category === c.name).length;

        return `
            <div class="category-box">

                <i class="${c.icon || 'fa-solid fa-tag'}"></i>

                <h3>${c.name}</h3>

                <span class="book-count-badge">
                    ${count} book${count !== 1 ? 's' : ''}
                </span>

                ${!c.is_default ? `
                <button class="tbl-del-btn"
                        style="margin-top:8px;"
                        onclick="deleteCategory(${c.id}, '${c.name.replace(/'/g,"\\'")}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>` : ''}

            </div>
        `;

    }).join('');
}

// ── Toast ─────────────────────────────────────────────────────────────────

function showToast(msg) {
    const t = document.getElementById('catToast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._t);
    t._t = setTimeout(() => t.style.display = 'none', 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────

renderGrid();
