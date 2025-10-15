import * as api from './api.js';
import { showDialog } from './dialog.js';

document.addEventListener('DOMContentLoaded', () => {
    const findCredentialsForm = document.getElementById('find-credentials-form');

    findCredentialsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            const { data } = await api.resetPassword(email);
            
            // As requested, show the temporary password in a dialog for the user to copy.
            // This is for development only and is insecure.
            showDialog({
                title: '임시 비밀번호 발급 완료',
                message: '이메일을 확인하세요. 아래의 임시 비밀번호로 로그인 후 즉시 비밀번호를 변경해주세요.',
                showInputField: true,
                inputType: 'text',
                inputValue: data.tempPassword,
                onConfirm: () => {
                    // Make the input field read-only after confirming
                    const inputField = document.getElementById('global-dialog-input');
                    if(inputField) inputField.readOnly = true;
                }
            });

        } catch (error) {
            showDialog({ message: error.message, title: '오류' });
        }
    });
});
