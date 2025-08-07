document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerBtn = document.getElementById('register-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const { success, data, error } = await response.json();

            if (success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                window.location.href = '/views/index.html';
            } else {
                alert(error.message);
                if (confirm('회원가입 하시겠습니까?')) {
                    window.location.href = '/views/register.html';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    registerBtn.addEventListener('click', () => {
        window.location.href = '/views/register.html';
    });
});
