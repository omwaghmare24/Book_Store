// book.html
// Popup Open
function openPopup(bookTitle, bookPrice) {

    document.getElementById("popupForm").style.display = "flex";

    document.getElementById("bookName").value =
        "Book: " + bookTitle;

    document.getElementById("bookPrice").value =
        "Price: " + bookPrice;
}

// Popup Close
function closePopup() {

    document.getElementById("popupForm").style.display = "none";
}

// Confirm Order  –  saves to the API so the admin dashboard sees it
async function confirmOrder(event) {

    event.preventDefault();

    const bookName =
        document.getElementById("bookName")
        .value.replace("Book: ", "");

    const bookPrice =
        document.getElementById("bookPrice")
        .value.replace("Price: ", "");

    const custName =
        document.getElementById("customerName").value;

    const custEmail =
        document.getElementById("customerEmail").value;

    const orderData = {
        book:  bookName,
        price: bookPrice,
        name:  custName,
        email: custEmail,
        date:  new Date().toLocaleDateString("en-IN")
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!res.ok) throw new Error('API error ' + res.status);

    } catch (e) {
        console.error('Order save failed:', e);
        showToast("❌ Could not save order. Please try again.");
        return;
    }

    closePopup();

    document.getElementById("customerName").value = "";
    document.getElementById("customerEmail").value = "";

    showToast(
        "✅ Order Confirmed! " +
        bookName +
        " ordered successfully."
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// About Toggle
function toggleAbout(button) {

    const moreText =
        button.previousElementSibling;

    if (moreText.style.display === "block") {

        moreText.style.display = "none";
        button.innerText = "Explore More";

    } else {

        moreText.style.display = "block";
        button.innerText = "Show Less";
    }
}

// Hamburger Menu
const hamburger =
    document.getElementById("hamburger");

const navLinks =
    document.getElementById("navLinks");

hamburger.addEventListener("click", () => {

    navLinks.classList.toggle("open");

});

// Contact Form
async function handleContact(e) {

    e.preventDefault();

    const form = e.target;

    const contact = {

        name:
            form.querySelector('input[type="text"]').value,

        email:
            form.querySelector('input[type="email"]').value,

        subject:
            form.querySelectorAll('input[type="text"]')[1].value,

        message:
            form.querySelector("textarea").value,

        date:
            new Date().toLocaleDateString("en-IN")
    };

    try {
        await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact)
        });
    } catch (err) {
        console.error('Contact save failed:', err);
    }

    showToast("✅ Message Sent Successfully!");

    form.reset();
}

// Toast
function showToast(msg) {

    const toast =
        document.getElementById("toastMsg");

    toast.textContent = msg;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3500);
}
