async function loadCustomers() {

    const tbody = document.getElementById("customersTableBody");

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
                <td colspan="4"
                    style="text-align:center;
                           padding:30px;
                           color:#888;">
                    No customers yet.
                </td>
            </tr>
        `;

        return;
    }

    const customerMap = {};

    orders.forEach(o => {

        if (!customerMap[o.email]) {

            customerMap[o.email] = {
                name: o.name,
                email: o.email,
                books: [],
                totalSpent: 0
            };
        }

        customerMap[o.email].books.push(o.book);

        const amt =
            parseInt(
                (o.price || '').replace(/[^0-9]/g, '')
            ) || 0;

        customerMap[o.email].totalSpent += amt;
    });

    const customers = Object.values(customerMap);

    const avatarBase = "https://i.pravatar.cc/100?img=";

    tbody.innerHTML = customers.map((c, i) => `

        <tr>

            <td>

                <div class="customer-info">

                    <img src="${avatarBase}${(i % 10) + 1}"
                         alt="${c.name}">

                    <span>${c.name}</span>

                </div>

            </td>

            <td>${c.email}</td>

            <td>${c.books.join(", ")}</td>

            <td>₹${c.totalSpent}</td>

        </tr>

    `).join('');
}

loadCustomers();
