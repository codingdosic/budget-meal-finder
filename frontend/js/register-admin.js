import { showDialog } from './dialog.js';
import * as api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (password.length < 6) {
            showDialog({ message: '비밀번호는 6자 이상이어야 합니다.', title: '유효성 검사 오류' });
            return;
        }

        showDialog({
            title: '관리자 보안 코드 입력',
            message: '관리자 계정 생성을 위한 보안 코드를 입력하세요.',
            useInput: true,
            onConfirm: async (securityCode) => {
                if (!securityCode) {
                    showDialog({ message: '보안 코드를 입력해야 합니다.', title: '오류' });
                    return;
                }

                try {
                    await api.registerAdmin({ username, email, password, securityCode });
                    showDialog({
                        message: '관리자 계정 생성이 완료되었습니다. 로그인해주세요.',
                        title: '가입 성공',
                        onConfirm: () => {
                            window.location.href = '/views/login.html';
                        }
                    });
                } catch (error) {
                    showDialog({ message: error.message, title: '가입 실패' });
                }
            }
        });
    });
});
