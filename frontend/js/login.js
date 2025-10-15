import { showDialog } from './dialog.js';

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
                showDialog({
                    message: error.message,
                    title: '로그인 실패',
                    showCancelButton: true,
                    onConfirm: () => {
                        window.location.href = '/views/register.html';
                    },
                    onCancel: () => {
                        // Do nothing
                    }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            showDialog({
                message: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
                title: '오류'
            });
        }
    });

    registerBtn.addEventListener('click', () => {
        window.location.href = '/views/register.html';
    });

    const findCredentialsBtn = document.getElementById('find-credentials-btn');
    findCredentialsBtn.addEventListener('click', () => {
        window.location.href = '/find-credentials';
    });
});
