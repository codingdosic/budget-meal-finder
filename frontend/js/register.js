import { showDialog } from './dialog.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                showDialog({ message: '회원가입이 성공적으로 완료되었습니다! 로그인해주세요.', title: '회원가입 성공' });
                window.location.href = '/views/login.html';
            } else {
                const data = await response.json();
                showDialog({ message: data.message, title: '회원가입 실패' });
            }
        } catch (error) {
            console.error('Error:', error);
            showDialog({ message: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.', title: '오류' });
        }
    });
});
