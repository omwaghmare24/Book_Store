(async function () {

    // ── Fetch live data from the API ─────────────────────────────────────

    async function apiFetch(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            if (!res.ok) throw new Error('API error ' + res.status);
            return res.json();
        } catch (e) {
            console.error('apiFetch failed:', url, e);
            return options.fallback !== undefined ? options.fallback : [];
        }
    }

    const [orders, books, cats, contacts] = await Promise.all([
        apiFetch('/api/orders'),
        apiFetch('/api/books'),
        apiFetch('/api/categories'),
        apiFetch('/api/contacts'),
    ]);

    const customerEmails = new Set(orders.map(o => o.email));

    document.getElementById("totalBooks").textContent =
        books.length > 0 ? books.length : "0";

    document.getElementById("totalOrders").textContent =
        orders.length || "0";

    document.getElementById("totalCustomers").textContent =
        customerEmails.size || "0";

    document.getElementById("totalCategories").textContent =
        cats.length > 0 ? cats.length : "0";

    // ── Recent books table ───────────────────────────────────────────────

    const table = document.getElementById("recentBooksTable");

    if (books.length > 0) {

        table.innerHTML = books.slice(-5).reverse().map(book => `
            <tr>
                <td>${book.name}</td>
                <td>${book.category || '-'}</td>
                <td>${book.price}</td>
                <td>
                    <span class="status available">
                        Available
                    </span>
                </td>
            </tr>
        `).join('');

    } else {

        table.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:#94a3b8;padding:20px 0;">
                    No books added yet.
                </td>
            </tr>
        `;
    }

    // ── Contact Messages Popup ───────────────────────────────────────────

    const unread = contacts.filter(c => !c.read).length;

    // Inject the bell button
    const bellBtn = document.createElement('button');
    bellBtn.className = 'notif-bell-btn';
    bellBtn.title = 'Contact Messages';
    bellBtn.innerHTML = `
        <i class="fa-solid fa-envelope"></i>
        Messages
        ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}
    `;
    document.body.appendChild(bellBtn);

    // Inject the modal
    const modal = document.createElement('div');
    modal.id = 'contactModal';
    modal.innerHTML = `
        <div class="modal-box">
            <span class="modal-close" id="closeContactModal">&times;</span>
            <h2><i class="fa-solid fa-envelope" style="margin-right:8px;color:#3b82f6;"></i>Contact Messages</h2>
            <div id="contactMsgList"></div>
            ${contacts.length > 0 ? `<button class="clear-btn" id="clearMsgsBtn">Clear All Messages</button>` : ''}
        </div>
    `;
    document.body.appendChild(modal);

    function renderMessages(msgs) {

        const list = document.getElementById('contactMsgList');

        if (msgs.length === 0) {
            list.innerHTML = `<p class="empty-msg">No messages yet.</p>`;
            return;
        }

        list.innerHTML = msgs.map(c => `
            <div class="msg-card">
                <div class="msg-meta">
                    <strong>${c.name}</strong> &lt;${c.email}&gt;
                    &nbsp;·&nbsp; ${c.date || ''}
                    ${!c.read ? ' &nbsp;<span style="color:#3b82f6;font-weight:600;">● New</span>' : ''}
                </div>
                <div class="msg-subject">${c.subject || '(no subject)'}</div>
                <div class="msg-body">${c.message}</div>
            </div>
        `).join('');
    }

    renderMessages(contacts);

    // Open modal + mark all as read
    bellBtn.addEventListener('click', async () => {
        modal.classList.add('open');

        // Mark all unread as read
        const unreadMsgs = contacts.filter(c => !c.read);
        for (const c of unreadMsgs) {
            await apiFetch(`/api/contacts/${c.id}/mark-read`, { method: 'PUT' });
            c.read = true;
        }

        // Remove badge
        const badge = bellBtn.querySelector('.notif-badge');
        if (badge) badge.remove();
    });

    // Close modal
    document.getElementById('closeContactModal').addEventListener('click', () => {
        modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
    });

    // Clear all messages
    const clearBtn = document.getElementById('clearMsgsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (!confirm('Clear all contact messages?')) return;
            await apiFetch('/api/contacts/clear', { method: 'DELETE' });
            contacts.length = 0;
            renderMessages([]);
            clearBtn.remove();
            const badge = bellBtn.querySelector('.notif-badge');
            if (badge) badge.remove();
        });
    }

    // Auto-open if there are unread messages
    if (unread > 0) {
        modal.classList.add('open');
    }

})();
