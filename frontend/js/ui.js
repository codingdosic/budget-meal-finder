// frontend/js/ui.js

// UI 요소 캐싱
const Elements = {
    markerList: document.getElementById('marker-list'),
    searchInput: document.getElementById('search-input'),
    searchButton: document.getElementById('search-button'),
    clearSearchButton: document.getElementById('clear-search-button'),
    categorySelect: document.getElementById('category-select'),
    sortBySelect: document.getElementById('sort-by-select'),
    maxPriceInput: document.getElementById('max-price-input'),
    addMarkerButton: document.getElementById('add-marker-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    myLocationBtn: document.getElementById('my-location-btn'),
    markerDialog: document.getElementById('marker-dialog'),
    dialogTitle: document.getElementById('marker-dialog').querySelector('h2'),
    dialogSubmitBtn: document.getElementById('dialog-submit'),
    dialogCancelBtn: document.getElementById('dialog-cancel'),
    dialogNameInput: document.getElementById('dialog-title'),
    dialogDescriptionInput: document.getElementById('dialog-description'),
    dialogPriceInput: document.getElementById('dialog-price'),
    dialogCategorySelect: document.getElementById('dialog-category'),
    dialogImageInput: document.getElementById('dialog-image'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
};

let _pastedImageFile = null; // ui.js 내부에서만 사용

// 사이드바 리스트 아이템 생성
export function createListItem(menu, currentUser, onRecommend, onDelete, onEdit, onMarkerClick) {
    const item = document.createElement('div');
    item.className = 'marker-item';
    item.dataset.menuId = menu._id;

    const isRecommended = currentUser?.recommendedMenus.includes(menu._id);
    const isDisrecommended = currentUser?.disrecommendedMenus.includes(menu._id);

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
                    <button class="recommend-btn ${isRecommended ? 'recommended' : ''}" data-action="recommend">👍</button>
                    <span class="recommend-count">${menu.recommendations}</span>
                    <button class="disrecommend-btn ${isDisrecommended ? 'disrecommended' : ''}" data-action="disrecommend">👎</button>
                    <span class="disrecommend-count">${menu.disrecommendations}</span>
                </div>
                <p class="marker-item-date">${date}</p>
            </div>
        </div>
        ${menu.username === currentUser.username ? `
        <div class="marker-actions">
            <button class="edit-btn">수정</button>
            <button class="delete-btn">삭제</button>
        </div>` : ''}
    `;

    item.addEventListener('click', (e) => {
        if (e.target.closest('.marker-actions') || e.target.closest('.recommend-actions')) return;
        onMarkerClick(menu._id);
    });

    item.querySelector('.recommend-btn').addEventListener('click', () => onRecommend(menu._id, 'recommend'));
    item.querySelector('.disrecommend-btn').addEventListener('click', () => onRecommend(menu._id, 'disrecommend'));

    const editBtn = item.querySelector('.edit-btn');
    const deleteBtn = item.querySelector('.delete-btn');
    if (editBtn) editBtn.addEventListener('click', () => onEdit(menu));
    if (deleteBtn) deleteBtn.addEventListener('click', () => onDelete(menu._id));

    return item;
}

// 다이얼로그 상태 리셋
export function resetDialog() {
    Elements.dialogTitle.textContent = '';
    Elements.dialogSubmitBtn.textContent = '';
    Elements.dialogNameInput.value = '';
    Elements.dialogDescriptionInput.value = '';
    Elements.dialogPriceInput.value = '';
    Elements.dialogCategorySelect.value = '기타';
    Elements.dialogImageInput.value = '';
    Elements.imagePreviewContainer.innerHTML = '';
    delete Elements.dialogNameInput.dataset.lat;
    delete Elements.dialogNameInput.dataset.lon;
    _pastedImageFile = null;
}

// 다이얼로그 열기 (추가 모드)
export function openAddMenuDialog(position) {
    resetDialog();
    Elements.dialogTitle.textContent = '새 메뉴 추가';
    Elements.dialogSubmitBtn.textContent = '추가';
    Elements.dialogNameInput.dataset.lat = position.lat();
    Elements.dialogNameInput.dataset.lon = position.lng();
    Elements.markerDialog.classList.add('visible');
}

// 다이얼로그 열기 (수정 모드)
export function openEditMenuDialog(menu) {
    resetDialog();
    Elements.dialogTitle.textContent = '메뉴 수정';
    Elements.dialogSubmitBtn.textContent = '수정';
    Elements.dialogNameInput.value = menu.name;
    Elements.dialogDescriptionInput.value = menu.description;
    Elements.dialogPriceInput.value = menu.price;
    Elements.dialogCategorySelect.value = menu.category;
    Elements.dialogImageInput.value = ''; // 파일 입력은 항상 초기화
    if (menu.imageUrl) {
        updateImagePreview(menu.imageUrl);
    }
    Elements.markerDialog.classList.add('visible');
}

// 다이얼로그 닫기
export function closeDialog() {
    Elements.markerDialog.classList.remove('visible');
    resetDialog();
}

// 이미지 미리보기 업데이트
export function updateImagePreview(source) {
    Elements.imagePreviewContainer.innerHTML = ''; // 기존 미리보기 제거
    const img = document.createElement('img');
    img.style.maxWidth = '100%';
    img.style.maxHeight = '150px';
    img.style.marginTop = '10px';

    if (typeof source === 'string') { // URL인 경우
        img.src = source;
    } else { // File 객체인 경우
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(source);
    }
    Elements.imagePreviewContainer.appendChild(img);
}

// 클립보드 이미지 붙여넣기 처리
export function handlePaste(e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const fileName = `pasted-image-${Date.now()}.png`;
            _pastedImageFile = new File([blob], fileName, { type: blob.type });
            updateImagePreview(_pastedImageFile);
            e.preventDefault();
            break;
        }
    }
}

// 현재 붙여넣기된 이미지 파일 반환
export function getPastedImageFile() {
    return _pastedImageFile;
}

// UI 요소 반환 (이벤트 리스너 설정을 위해)
export function getElements() {
    return Elements;
}

// 메뉴 리스트 렌더링
export function renderMenuList(menus, currentUser, callbacks) {
    Elements.markerList.innerHTML = '';
    if (!menus || menus.length === 0) {
        Elements.markerList.innerHTML = '<p>표시할 메뉴가 없습니다.</p>';
        return;
    }
    menus.forEach(menu => {
        const listItem = createListItem(
            menu,
            currentUser,
            callbacks.onRecommend,
            callbacks.onDelete,
            callbacks.onEdit,
            callbacks.onMarkerClick
        );
        Elements.markerList.appendChild(listItem);
    });
}
