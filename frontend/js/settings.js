// frontend/js/settings.js
import * as api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const backToMapBtn = document.getElementById('back-to-map-btn');
    const myMenusList = document.getElementById('my-menus-list');

    async function initialize() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/views/login.html';
            return;
        }

        try {
            const { data: menus } = await api.fetchMyMenus(token);
            displayMyMenus(menus);
        } catch (error) {
            console.error('Error initializing settings page:', error);
            localStorage.removeItem('token');
            window.location.href = '/views/login.html';
        }
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

    // Event Listeners
    backToMapBtn.addEventListener('click', () => {
        window.location.href = '/';
    });

    myMenusList.addEventListener('click', async (e) => {
        const target = e.target;
        const menuId = target.dataset.id;
        const token = localStorage.getItem('token');

        if (target.classList.contains('edit-btn')) {
            localStorage.setItem('editMenuId', menuId);
            window.location.href = '/';
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
                try {
                    await api.deleteMenu(menuId, token);
                    await initialize(); // Refresh the list
                } catch (error) {
                    alert(`메뉴 삭제 실패: ${error.message}`);
                }
            }
        }
    });

    initialize();
});
