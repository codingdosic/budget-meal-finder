import { showDialog } from './dialog.js';
import { register } from './api.js'; 

// 돔트리 생성 후 이벤트
document.addEventListener('DOMContentLoaded', () => {

    // 회원가입 폼  객체 
    const registerForm = document.getElementById('register-form');

    // 폼 제출 이벤트
    registerForm.addEventListener('submit', async (e) => {

        // 기본 form의 action이 비어있으므로 reload됨
        // 이를 방지하고 fetch로 비동기 요청을 보냄
        e.preventDefault();

        // 입력란 데이터 가져오기
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 회원가입 요청 보내기
        try {

            // api/auth/register 호출
            await register({ username, email, password });

            showDialog({ message: '회원가입이 성공적으로 완료되었습니다! 로그인해주세요.', title: '회원가입 성공' });
                
            // 로그인 페이지로 리디렉션
            window.location.href = '/views/login.html';

        } catch (error) { // register에서 던진 에러 처리

            console.error('Error:', error);

            showDialog({ message: error, title: '오류' });
        }
    });
});
