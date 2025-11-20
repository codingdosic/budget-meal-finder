import { showDialog } from './dialog.js';
import { login } from './api.js';

// 돔트리 로딩 후 실행
document.addEventListener('DOMContentLoaded', () => {

    // 로그인 폼과 버튼 요소 가져오기
    const loginForm = document.getElementById('login-form');
    const registerBtn = document.getElementById('register-btn');

    // 로그인 폼 제출 이벤트 처리
    loginForm.addEventListener('submit', async (e) => {

        // 기본 동작 방지
        e.preventDefault();

        // 데이터 가져오기
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {

            const { success, data, error } = await login({ email, password });

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            window.location.href = '/views/index.html';

        } catch (error) {
            console.error('Error:', error);
            showDialog({message: error, title: '오류'});
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
