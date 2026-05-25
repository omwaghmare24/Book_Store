async function loadOrders() {

    const tbody = document.getElementById("ordersTableBody");

    let orders = [];

    try {
        const res = await fetch('/api/orders');
        if (res.ok) orders = await res.json();
    } catch (e) {
        console.error('Failed to load orders:', e);
    }

    if (orders.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;
                           padding:30px;
                           color:#888;">
                    No orders yet.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = orders.map((o, i) => `

        <tr>

            <td>${o.id || ('#' + (1000 + i + 1))}</td>

            <td>
                <div class="book-info">
                    <span>${o.book}</span>
                </div>
            </td>

            <td>${o.name}</td>

            <td>${o.email}</td>

            <td>${o.price}</td>

            <td>${o.date || '-'}</td>

            <td>
                <span class="status available">
                    Confirmed
                </span>
            </td>

        </tr>

    `).join('');
}

loadOrders();
