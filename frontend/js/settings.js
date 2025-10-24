// frontend/js/settings.js
import * as api from './api.js';
import { showDialog } from './dialog.js';

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const editEmailBtn = document.getElementById('edit-email-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const backToMapBtn = document.getElementById('back-to-map-btn');
    const myMenusList = document.getElementById('my-menus-list');
    const adminPanel = document.getElementById('admin-panel');
    const userSearchInput = document.getElementById('user-search-input');
    const userSearchBtn = document.getElementById('user-search-btn');
    const userList = document.getElementById('user-list');
    const menuDisplayTitle = document.getElementById('menu-display-title');
    const selectedUserContent = document.getElementById('selected-user-content');
    const selectedUserMenuTitle = document.getElementById('selected-user-menu-title');
    const selectedUserMenusList = document.getElementById('selected-user-menus-list');

    let currentUser = null;
    let selectedUserId = null; // 현재 선택된 사용자 ID 저장

    async function initialize() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/views/login.html';
            return;
        }

        try {
            // 1. Fetch user data
            const { data: user } = await api.fetchUser(token);
            currentUser = user;
            displayUserData(currentUser);

            // 관리자 패널 표시 여부 결정
            if (currentUser.role === 'admin') {
                adminPanel.style.display = 'block';
                initializeAdminPanel(token);
            }

            // 2. Fetch user's menus
            const { data: menus } = await api.fetchMyMenus(token);
            displayMyMenus(menus);

        } catch (error) {
            console.error('Error initializing settings page:', error);
            localStorage.removeItem('token');
            window.location.href = '/views/login.html';
        }
    }

    function displayUserData(user) {
        usernameInput.value = user.username;
        emailInput.value = user.email;
    }

    function displayMyMenus(menus) {
        myMenusList.innerHTML = '';
        if (!menus || menus.length === 0) {
            myMenusList.innerHTML = '<p>아직 등록한 메뉴가 없습니다.</p>';
            return;
        }

        menus.forEach(menu => {
            const item = document.createElement('div');
            item.className = 'marker-item'; // Reuse styles from main page

            const imageHtml = menu.imageUrl 
                ? `<img class="marker-item-image" src="${menu.imageUrl}" alt="${menu.name}">` 
                : '<div class="marker-item-image"></div>';

            const date = new Date(menu.createdAt).toLocaleDateString();

            item.innerHTML = `
                ${imageHtml}
                <div class="marker-info">
                    <h4>${menu.name}</h4>
                    <p class="price">${menu.price.toLocaleString()}원</p>
                    <p class="marker-item-description">${menu.description || '설명 없음'}</p>
                    <div class="recommend-actions">
                        <div class="recommend-buttons">
                            <button class="recommend-btn" disabled>👍</button>
                            <span class="recommend-count">${menu.recommendations}</span>
                            <button class="disrecommend-btn" disabled>👎</button>
                            <span class="disrecommend-count">${menu.disrecommendations}</span>
                        </div>
                        <p class="marker-item-date">${date}</p>
                    </div>
                </div>
                <div class="marker-actions">
                    <button class="edit-btn" data-id="${menu._id}">수정</button>
                    <button class="delete-btn" data-id="${menu._id}">삭제</button>
                </div>
            `;
            myMenusList.appendChild(item);
        });
    }

    function displaySelectedUserMenus(menus) {
        selectedUserMenusList.innerHTML = '';
        if (!menus || menus.length === 0) {
            selectedUserMenusList.innerHTML = '<p>이 사용자는 등록한 메뉴가 없습니다.</p>';
            return;
        }

        menus.forEach(menu => {
            const item = document.createElement('div');
            item.className = 'marker-item';

            const imageHtml = menu.imageUrl 
                ? `<img class="marker-item-image" src="${menu.imageUrl}" alt="${menu.name}">` 
                : '<div class="marker-item-image"></div>';

            const date = new Date(menu.createdAt).toLocaleDateString();

            item.innerHTML = `
                ${imageHtml}
                <div class="marker-info">
                    <h4>${menu.name}</h4>
                    <p class="price">${menu.price.toLocaleString()}원</p>
                    <p class="marker-item-description">${menu.description || '설명 없음'}</p>
                    <div class="recommend-actions">
                        <div class="recommend-buttons">
                            <button class="recommend-btn" disabled>👍</button>
                            <span class="recommend-count">${menu.recommendations}</span>
                            <button class="disrecommend-btn" disabled>👎</button>
                            <span class="disrecommend-count">${menu.disrecommendations}</span>
                        </div>
                        <p class="marker-item-date">${date}</p>
                    </div>
                </div>
                <div class="marker-actions">
                    <button class="edit-btn" data-id="${menu._id}">수정</button>
                    <button class="delete-btn" data-id="${menu._id}">삭제</button>
                </div>
            `;
            selectedUserMenusList.appendChild(item);
        });
    }

    function initializeAdminPanel(token) {
        // 초기 사용자 목록 로드
        loadAllUsers(token);

        // 사용자 검색 버튼 이벤트 리스너
        userSearchBtn.addEventListener('click', () => {
            loadAllUsers(token, userSearchInput.value);
        });

        // 사용자 목록 클릭 이벤트 리스너 (이벤트 위임)
        userList.addEventListener('click', async (e) => {
            const userItem = e.target.closest('.user-item');
            if (userItem) {
                selectedUserId = userItem.dataset.userId; // 선택된 사용자 ID 저장
                const username = userItem.dataset.username;
                try {
                    const { data: menus } = await api.getUserMenusAdmin(selectedUserId, token);
                    selectedUserContent.style.display = 'block';
                    selectedUserMenuTitle.textContent = `${username}님의 메뉴`;
                    displaySelectedUserMenus(menus);
                } catch (error) {
                    showDialog({ message: `메뉴를 불러오는 데 실패했습니다: ${error.message}`, title: '오류' });
                }
            }
        });
    }

    async function loadAllUsers(token, searchQuery = '') {
        try {
            const { data: users } = await api.getAllUsersAdmin(token, searchQuery);
            displayUsers(users);
        } catch (error) {
            showDialog({ message: `사용자 목록을 불러오는 데 실패했습니다: ${error.message}`, title: '오류' });
        }
    }

    function displayUsers(users) {
        userList.innerHTML = '';
        if (!users || users.length === 0) {
            userList.innerHTML = '<p>사용자가 없습니다.</p>';
            return;
        }

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.dataset.userId = user._id;
            item.dataset.username = user.username;
            item.innerHTML = `
                <p><strong>${user.username}</strong> (${user.email})</p>
                <small>Role: ${user.role}</small>
            `;
            userList.appendChild(item);
        });
    }

    // Event Listeners
    backToMapBtn.addEventListener('click', () => {
        window.location.href = '/';
    });

    changePasswordBtn.addEventListener('click', async () => {
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const token = localStorage.getItem('token');

        if (!currentPassword || !newPassword || !confirmPassword) {
            showDialog({ message: '모든 비밀번호 필드를 채워주세요.', title: '입력 오류' });
            return;
        }
        if (newPassword !== confirmPassword) {
            showDialog({ message: '새 비밀번호가 일치하지 않습니다.', title: '입력 오류' });
            return;
        }
        if (newPassword.length < 6) { // Basic password strength check
            showDialog({ message: '새 비밀번호는 최소 6자 이상이어야 합니다.', title: '입력 오류' });
            return;
        }

        try {
            await api.changePassword(currentPassword, newPassword, token);
            showDialog({ message: '비밀번호가 성공적으로 변경되었습니다.', title: '성공' });
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } catch (error) {
            showDialog({ message: `비밀번호 변경 실패: ${error.message}`, title: '변경 오류' });
        }
    });

    editEmailBtn.addEventListener('click', async () => {
        showDialog({
            title: '이메일 주소 변경',
            message: '새로운 이메일 주소를 입력하세요:',
            showInputField: true,
            inputType: 'email',
            inputValue: emailInput.value,
            onConfirm: async (newEmail) => {
                if (!newEmail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) {
                    showDialog({ message: '유효한 이메일 주소를 입력해주세요.', title: '입력 오류' });
                    return;
                }

                const token = localStorage.getItem('token');
                try {
                    const { data: updatedUser } = await api.changeEmail(newEmail, token);
                    showDialog({ message: '이메일 주소가 성공적으로 변경되었습니다.', title: '성공' });
                    // Update displayed email directly from the response
                    currentUser = updatedUser;
                    displayUserData(currentUser);
                } catch (error) {
                    showDialog({ message: `이메일 변경 실패: ${error.message}`, title: '변경 오류' });
                }
            }
        });
    });

    deleteAccountBtn.addEventListener('click', async () => {
        showDialog({
            message: '정말로 계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.',
            title: '계정 삭제 확인',
            showCancelButton: true,
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                try {
                    await api.deleteAccount(token);
                    showDialog({ message: '계정이 성공적으로 삭제되었습니다.', title: '성공' });
                    localStorage.clear(); // Clear all user data
                    window.location.href = '/views/login.html'; // Redirect to login page
                } catch (error) {
                    showDialog({ message: `계정 삭제 실패: ${error.message}`, title: '삭제 오류' });
                }
            }
        });
    });

    myMenusList.addEventListener('click', async (e) => {
        const target = e.target;
        const menuId = target.dataset.id;
        const token = localStorage.getItem('token');

        if (target.classList.contains('edit-btn')) {
            localStorage.setItem('editMenuId', menuId);
            window.location.href = '/';
        } else if (target.classList.contains('delete-btn')) {
            showDialog({
                message: '정말로 이 메뉴를 삭제하시겠습니까?',
                title: '메뉴 삭제 확인',
                showCancelButton: true,
                onConfirm: async () => {
                    try {
                        await api.deleteMenu(menuId, token);
                        await initialize(); // Refresh the list
                    } catch (error) {
                        showDialog({ message: `메뉴 삭제 실패: ${error.message}`, title: '삭제 오류' });
                    }
                }
            });
        }
    });

    // Helper function to refresh the selected user's menu list
    async function refreshSelectedUserMenus(token) {
        if (!selectedUserId) return;
        try {
            const { data: menus } = await api.getUserMenusAdmin(selectedUserId, token);
            displaySelectedUserMenus(menus);
        } catch (error) {
            showDialog({ message: `메뉴를 다시 불러오는 데 실패했습니다: ${error.message}`, title: '오류' });
        }
    }

    selectedUserMenusList.addEventListener('click', async (e) => {
        const target = e.target;
        const menuId = target.dataset.id;
        const token = localStorage.getItem('token');

        if (target.classList.contains('edit-btn')) {
            localStorage.setItem('editMenuId', menuId);
            window.location.href = '/';
        } else if (target.classList.contains('delete-btn')) {
            showDialog({
                message: '정말로 이 메뉴를 삭제하시겠습니까?',
                title: '메뉴 삭제 확인',
                showCancelButton: true,
                onConfirm: async () => {
                    try {
                        await api.deleteMenu(menuId, token);
                        await refreshSelectedUserMenus(token); // Refresh the selected user's list
                    } catch (error) {
                        showDialog({ message: `메뉴 삭제 실패: ${error.message}`, title: '삭제 오류' });
                    }
                }
            });
        }
    });

    initialize();
});
