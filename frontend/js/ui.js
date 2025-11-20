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
    toastContainer: document.getElementById('toast-container')
};


// 이미지 저장용 전역 변수
let _pastedImageFile = null;

// 사이드바 리스트 아이템 생성
export function createListItem(menu, currentUser) {

    // 리스트 아이템 담을 요소 생성
    const item = document.createElement('div');

    // 클래스 및 데이터 속성 설정
    item.className = 'marker-item';
    item.dataset.menuId = menu._id;

    // 해당 메뉴에 대한 추천/비추천 상태 확인
    const isRecommended = currentUser?.recommendedMenus.includes(menu._id);
    const isDisrecommended = currentUser?.disrecommendedMenus.includes(menu._id);

    // 이미지 HTML 생성, 없을 경우 빈 div 사용
    const imageHtml = menu.imageUrl
        ? `<img class="marker-item-image" src="${menu.imageUrl}" alt="${menu.name}">`
        : '<div class="marker-item-image"></div>';

    // 생성일자 포맷팅
    const date = new Date(menu.createdAt).toLocaleDateString();

    // 아이템 내부 HTML 설정
    item.innerHTML = `
        ${imageHtml}
        <div class="marker-info" data-action="pan">
            <h4>${menu.name}</h4>
            <p class="price">${menu.price.toLocaleString()}원</p>
            <p class="marker-item-description">${menu.description || '설명 없음'}</p>
            <div class="recommend-actions">
                <div class="recommend-buttons">
                    <button class="recommend-btn ${isRecommended ? 'recommended' : ''}" data-action="recommend" data-id="${menu._id}">👍</button>
                    <span class="recommend-count">${menu.recommendations}</span>
                    <button class="disrecommend-btn ${isDisrecommended ? 'disrecommended' : ''}" data-action="disrecommend" data-id="${menu._id}">👎</button>
                    <span class="disrecommend-count">${menu.disrecommendations}</span>
                </div>
                <p class="marker-item-date">${date}</p>
            </div>
        </div>
        ${(menu.username === currentUser.username || (currentUser && currentUser.role === 'admin')) ? `
        <div class="marker-actions">
            <button class="edit-btn" data-action="edit" data-id="${menu._id}">수정</button>
            <button class="delete-btn" data-action="delete" data-id="${menu._id}">삭제</button>
        </div>` : ''}
    `;

    return item;
}

// 다이얼로그 초기화
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

    // 기존 메뉴 정보로 입력 필드 채우기
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

    // 다이얼로그 숨기기 및 초기화
    Elements.markerDialog.classList.remove('visible');
    resetDialog();
}

// 이미지 미리보기 업데이트
export function updateImagePreview(source) {
    Elements.imagePreviewContainer.innerHTML = ''; // 기존 미리보기 제거

    // 이미지 요소 생성
    const img = document.createElement('img');
    img.style.maxWidth = '100%';
    img.style.maxHeight = '150px';
    img.style.marginTop = '10px';

    // URL인 경우
    if (typeof source === 'string') { 
        img.src = source;
    } else { // File 객체인 경우

        // 파일 리더로 이미지 데이터 읽기
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(source);
    }

    // 이미지 미리보기 컨테이너에 추가
    Elements.imagePreviewContainer.appendChild(img);
}

// 클립보드 이미지 붙여넣기 처리
export function handlePaste(e) {

    // 클립보드 항목 순회
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {

        // 역순 탐색 (최신 항목 우선)으로 이미지 파일 찾기
        if (items[i].type.indexOf('image') !== -1) {

            // 이미지 파일 생성
            const blob = items[i].getAsFile();

            // 파일 이름 생성
            const fileName = `pasted-image-${Date.now()}.png`;

            // 전역 변수에 붙여넣기된 이미지 파일 저장
            _pastedImageFile = new File([blob], fileName, { type: blob.type });

            // 미리보기 업데이트
            updateImagePreview(_pastedImageFile);

            // 기본 붙여넣기 동작 방지
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
export function renderMenuList(menus, currentUser) {

    // 기존 리스트 초기화
    Elements.markerList.innerHTML = '';

    //  메뉴가 없을 경우 안내문 표시
    if (!menus || menus.length === 0) {
        Elements.markerList.innerHTML = '<p>표시할 메뉴가 없습니다.</p>';
        return;
    }

    // 메뉴별로 리스트 아이템 생성 및 추가
    menus.forEach(menu => {
        const listItem = createListItem(
            menu,
            currentUser
        );
        Elements.markerList.appendChild(listItem);
    });
}

// 토스트 알림 표시
export function showToast(message) {
    
    // 토스트 컨테이너 없으면 종료
    if (!Elements.toastContainer) return;

    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // 토스트 컨테이너에 추가
    Elements.toastContainer.appendChild(toast);

    // 설정 시간 후 애니메이션 시작
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // 설정 시간 후 토스트 제거
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}