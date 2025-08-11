// frontend/js/main.js
import * as api from './api.js';
import * as mapModule from './map.js';
import * as uiModule from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 전역 변수 선언
    let allMenus = [];
    let currentUser = null;
    let editingMenuId = null;

    // UI 요소 가져오기
    const ui = uiModule.getElements();

    // 지도 초기화 함수
    function initMap() {
        mapModule.initMap(async () => {
            await fetchUserData();
            if (currentUser) {
                await fetchAllMenus();
                setupEventListeners();
            }
        });
    }

    // 사용자 정보 가져오기
    async function fetchUserData() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/views/login.html';
            return;
        }
        try {
            const { data } = await api.fetchUser(token);
            currentUser = data;
        } catch (error) {
            console.error(error);
            localStorage.clear();
            window.location.href = '/views/login.html';
        }
    }

    // 모든 메뉴 데이터 가져오기
    async function fetchAllMenus() {
        try {
            const { data } = await api.getAllMenus();
            allMenus = data;
            updateMapAndList(allMenus);
            checkForEditRequest(); // Check for edit request after menus are loaded
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    }

    // 지도와 리스트 업데이트
    function updateMapAndList(menus) {
        mapModule.updateMap(menus, !ui.searchInput.value); // 검색창이 비어있을 때만 bounds.fit

        uiModule.renderMenuList(menus, currentUser, {
            onRecommend: handleRecommendation,
            onDelete: deleteMenu,
            onEdit: openEditMenuDialog,
            onMarkerClick: mapModule.panToMarker
        });
    }

    // 추천/비추천 처리
    async function handleRecommendation(menuId, action) {
        try {
            await api.handleRecommendation(menuId, action, localStorage.getItem('token'));
            await fetchUserData();
            await fetchAllMenus();
        } catch (error) {
            alert(error.message);
        }
    }
    
    // 메뉴 삭제
    async function deleteMenu(menuId) {
        if (!confirm('정말로 이 메뉴를 삭제하시겠습니까?')) return;
        try {
            await api.deleteMenu(menuId, localStorage.getItem('token'));
            await fetchAllMenus();
        } catch (error) {
            alert(error.message);
        }
    }

    // 고급 검색
    async function applyAdvancedSearch() {
        const params = {
            keyword: ui.searchInput.value,
            category: ui.categorySelect.value,
            sortBy: ui.sortBySelect.value,
            maxPrice: ui.maxPriceInput.value
        };

        try {
            const { data } = await api.applyAdvancedSearch(params);
            updateMapAndList(data);
        } catch (error) {
            console.error('Error during advanced search:', error);
        }
    }

    // 다이얼로그 열기 (추가 모드)
    function openAddMenuDialog(position) {
        uiModule.openAddMenuDialog(position);
    }

    // 다이얼로그 열기 (수정 모드)
    function openEditMenuDialog(menu) {
        editingMenuId = menu._id;
        uiModule.openEditMenuDialog(menu);
    }

    // 다이얼로그 상태 리셋
    function resetDialog() {
        editingMenuId = null;
        uiModule.resetDialog();
    }

    // 다이얼로그 닫기
    function closeDialog() {
        uiModule.closeDialog();
        resetDialog();
    }

    // Check for a request to edit a menu from another page
    function checkForEditRequest() {
        const menuIdToEdit = localStorage.getItem('editMenuId');
        if (menuIdToEdit) {
            const menuToEdit = allMenus.find(menu => menu._id === menuIdToEdit);
            if (menuToEdit) {
                openEditMenuDialog(menuToEdit);
            }
            localStorage.removeItem('editMenuId');
        }
    }

    // 다이얼로그 제출 처리
    async function handleDialogSubmit() {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', ui.dialogNameInput.value);
        formData.append('description', ui.dialogDescriptionInput.value);
        formData.append('price', ui.dialogPriceInput.value);
        formData.append('category', ui.dialogCategorySelect.value);
        
        const pastedImageFile = uiModule.getPastedImageFile();
        if (pastedImageFile) {
            formData.append('image', pastedImageFile, pastedImageFile.name);
        } else if (ui.dialogImageInput.files[0]) {
            formData.append('image', ui.dialogImageInput.files[0]);
        }

        // 새 메뉴 추가 시 위도, 경도 추가
        if (!editingMenuId) {
            formData.append('lat', ui.dialogNameInput.dataset.lat);
            formData.append('lon', ui.dialogNameInput.dataset.lon);
        }

        try {
            const response = await api.submitMenu(formData, token, editingMenuId);
            if (response.ok) {
                closeDialog();
                await fetchAllMenus();
            } else {
                const errorData = await response.json();
                alert(`저장 실패: ${errorData.error.message}`);
            }
        } catch (error) {
            console.error('Error submitting menu:', error);
        }
    }

    // 모든 이벤트 리스너 설정
    function setupEventListeners() {
        ui.searchButton.addEventListener('click', applyAdvancedSearch);
        ui.clearSearchButton.addEventListener('click', () => {
            ui.searchInput.value = '';
            ui.categorySelect.value = '';
            ui.sortBySelect.value = 'createdAt';
            ui.maxPriceInput.value = '';
            applyAdvancedSearch();
        });
        ui.categorySelect.addEventListener('change', applyAdvancedSearch);
        ui.sortBySelect.addEventListener('change', applyAdvancedSearch);
        ui.maxPriceInput.addEventListener('input', applyAdvancedSearch);

        ui.addMarkerButton.addEventListener('click', () => {
            alert('지도를 클릭하여 새 메뉴를 추가할 위치를 선택하세요.');
            mapModule.addMapClickListener((latLng) => {
                openAddMenuDialog(latLng);
            });
        });

        ui.settingsBtn.addEventListener('click', () => {
            window.location.href = '/views/settings.html';
        });

        ui.dialogSubmitBtn.addEventListener('click', handleDialogSubmit);
        ui.dialogCancelBtn.addEventListener('click', closeDialog);

        // 다이얼로그에 붙여넣기 이벤트 추가
        ui.markerDialog.addEventListener('paste', uiModule.handlePaste);

        // 파일 입력 변경 시 미리보기 업데이트
        ui.dialogImageInput.addEventListener('change', () => {
            if (ui.dialogImageInput.files[0]) {
                uiModule.updateImagePreview(ui.dialogImageInput.files[0]);
            }
        });

        ui.logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/views/login.html';
        });

        ui.myLocationBtn.addEventListener('click', () => {
            mapModule.showMyLocation();
        });
    }

    // 초기화 시작
    initMap();
});
