function handleLogin(e) {

    e.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const err  = document.getElementById('loginError');

    if (user === 'admin' && pass === 'admin123') {

        window.location.href = '/admin';

    } else {

        err.style.display = 'block';
    }
}
