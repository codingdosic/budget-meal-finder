// frontend/js/main.js
import * as api from './api.js';
import * as mapModule from './map.js';
import * as uiModule from './ui.js';
import { showDialog } from './dialog.js';

document.addEventListener('DOMContentLoaded', () => {

    // 전역 변수 선언
    let allMenus = [];
    let currentUser = null;
    let editingMenuId = null;

    // UI 요소 가져오기
    const ui = uiModule.getElements();
    const spinner = document.getElementById('loading-spinner');

    // 스피너 제어 함수
    function showSpinner() {

        // 클래스 속성 조작
        spinner.classList.add('visible');
    }

    function hideSpinner() {
        spinner.classList.remove('visible');
    }

    // API 에러 핸들러
    function handleApiError(error) {
        if (error.message.includes('Invalid token')) {
            showDialog({
                message: '세션이 만료되었습니다. 다시 로그인해주세요.',
                title: '인증 오류',
                onConfirm: () => {
                    localStorage.clear();
                    window.location.href = '/views/login.html';
                }
            });
        } else {
            showDialog({ message: error.message, title: '오류' });
        }
    }

    // 지도 초기화 함수
    function initMap() {
        mapModule.initMap(async () => {
            await fetchUserData();
            if (currentUser) {

                // 메뉴 데이터 가져오기
                await fetchAllMenus();

                // 이벤트 리스너 설정
                setupEventListeners();
            }
        });
    }

    // 사용자 정보 가져오기
    async function fetchUserData() {

        // 로컬 스토리지에서 토큰 가져오기
        const token = localStorage.getItem('token');

        // 토큰이 없으면 로그인 페이지로 리디렉션
        if (!token) {
            window.location.href = '/views/login.html';
            return;
        }
        
        showSpinner();
        try {

            // 사용자 정보 가져와서 전역 변수에 저장
            const { data } = await api.fetchUser(token);
            currentUser = data;
        } catch (error) {

            // 에러 발생 시 로컬 스토리지 정리 후 로그인 페이지로 리디렉션
            console.error(error);
            localStorage.clear();
            window.location.href = '/views/login.html';
        } finally {
            hideSpinner();
        }
    }

    // 모든 메뉴 데이터 가져오기
    async function fetchAllMenus() {
        showSpinner();
        try {

            // 메뉴 데이터 가져와서 전역 변수에 저장
            const { data } = await api.getAllMenus();
            allMenus = data;

            // 지도와 리스트 업데이트
            updateMapAndList(allMenus);
            checkForEditRequest(); 
        } catch (error) {
            console.error('Error fetching menus:', error);
        } finally {
            hideSpinner();
        }
    }

    // 지도와 리스트 업데이트
    function updateMapAndList(menus) {
        mapModule.updateMap(menus, !ui.searchInput.value); // 검색창이 비어있을 때만 bounds.fit

        uiModule.renderMenuList(menus, currentUser);
    }

    // 추천/비추천 처리
    async function handleRecommendation(menuId, action) {
        showSpinner();
        try {
            await api.handleRecommendation(menuId, action, localStorage.getItem('token'));
            await fetchUserData();
            await fetchAllMenus();
        } catch (error) {
            handleApiError(error);
        } finally {
            hideSpinner();
        }
    }
    
    // 메뉴 삭제
    async function deleteMenu(menuId) {
        showDialog({
            message: '정말로 이 메뉴를 삭제하시겠습니까?',
            title: '메뉴 삭제 확인',
            showCancelButton: true,
            onConfirm: async () => {
                showSpinner();
                try {
                    await api.deleteMenu(menuId, localStorage.getItem('token'));
                    uiModule.showToast('메뉴가 삭제되었습니다.');
                    await fetchAllMenus();
                } catch (error) {
                    handleApiError(error);
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    // 고급 검색
    async function applyAdvancedSearch() {
        const params = {
            keyword: ui.searchInput.value,
            category: ui.categorySelect.value,
            sortBy: ui.sortBySelect.value,
            maxPrice: ui.maxPriceInput.value
        };

        showSpinner();
        try {
            const { data } = await api.applyAdvancedSearch(params);
            updateMapAndList(data);
        } catch (error) {
            console.error('Error during advanced search:', error);
        } finally {
            hideSpinner();
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
        const isEditing = !!editingMenuId;
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

        if (!editingMenuId) {
            formData.append('lat', ui.dialogNameInput.dataset.lat);
            formData.append('lon', ui.dialogNameInput.dataset.lon);
        }

        showSpinner();
        try {
            const response = await api.submitMenu(formData, token, editingMenuId);
            if (response.ok) {
                closeDialog();
                await fetchAllMenus();
                uiModule.showToast(isEditing ? '메뉴가 수정되었습니다.' : '메뉴가 추가되었습니다.');
            } else {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message.includes('Invalid token')) {
                    handleApiError(new Error(errorData.error.message));
                } else {
                    showDialog({ message: `저장 실패: ${errorData.error.message}`, title: '저장 오류' });
                }
            }
        } catch (error) {
            console.error('Error submitting menu:', error);
            handleApiError(error);
        } finally {
            hideSpinner();
        }
    }

    // Helper function to clear filters and re-apply search
    function clearFiltersAndSearch() {
        ui.searchInput.value = '';
        ui.categorySelect.value = '';
        ui.sortBySelect.value = 'createdAt';
        ui.maxPriceInput.value = '';
        applyAdvancedSearch();
    }

    // 모든 이벤트 리스너 설정
    function setupEventListeners() {

        // 검색 관련 이벤트 리스너
        ui.searchButton.addEventListener('click', applyAdvancedSearch);

        // 엔터키 및 이스케이프키 처리
        ui.searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                applyAdvancedSearch();
            } else if (event.key === 'Escape') {
                clearFiltersAndSearch();
            }
        });
        ui.clearSearchButton.addEventListener('click', clearFiltersAndSearch);
        ui.categorySelect.addEventListener('change', applyAdvancedSearch);
        ui.sortBySelect.addEventListener('change', applyAdvancedSearch);
        ui.maxPriceInput.addEventListener('input', applyAdvancedSearch);

        // 헤더 버튼 이벤트 리스너
        ui.myLocationBtn.addEventListener('click', () => {
            mapModule.showMyLocation();
            uiModule.showToast('내 위치로 이동합니다.');
        });

        ui.addMarkerButton.addEventListener('click', () => {
            showDialog({ message: '지도를 클릭하여 메뉴를 추가할 위치를 선택하세요.', title: '메뉴 추가', autoClose: true, duration: 3000 });
            mapModule.addMapClickListener((latLng) => {
                openAddMenuDialog(latLng);
            });
        });

        ui.settingsBtn.addEventListener('click', () => {
            window.location.href = '/views/settings.html';
        });

        ui.logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/views/login.html';
        });

        // 다이얼로그 이벤트 리스너
        ui.dialogSubmitBtn.addEventListener('click', handleDialogSubmit);
        ui.dialogCancelBtn.addEventListener('click', closeDialog);

        ui.markerDialog.addEventListener('paste', uiModule.handlePaste);

        ui.dialogImageInput.addEventListener('change', () => {
            if (ui.dialogImageInput.files[0]) {
                uiModule.updateImagePreview(ui.dialogImageInput.files[0]);
            }
        });

        
        // 마커 리스트 클릭 이벤트 리스너
        ui.markerList.addEventListener('click', (e) => {
            const target = e.target;

            // 데이터 속성에서 액션과 메뉴 ID 추출
            const actionElement = target.closest('[data-action]');
            if (!actionElement) return;

            const action = actionElement.dataset.action;
            const menuId = actionElement.dataset.id;

            // 액션에 따른 분기
            switch (action) {

                // 해당 위치로 이동
                case 'pan':
                    const parentItem = actionElement.closest('.marker-item');
                    mapModule.panToMarker(parentItem.dataset.menuId);
                    break;

                // 추천/비추천
                case 'recommend':
                case 'disrecommend':
                    handleRecommendation(menuId, action);
                    break;
                
                // 메뉴 수정/삭제
                case 'edit':
                    const menuToEdit = allMenus.find(menu => menu._id === menuId);
                    if (menuToEdit) openEditMenuDialog(menuToEdit);
                    break;
                case 'delete':
                    deleteMenu(menuId);
                    break;
            }
        });
    }

    // 초기화 시작
    initMap();
});