// frontend/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // 전역 변수 선언
    let map;
    let infoWindow;
    let allMenus = [];
    let markers = [];
    let markerClustererInstance;
    let currentUser = null;
    let editingMenuId = null;
    let pastedImageFile = null;
    let myLocationMarker = null;

    // UI 요소 가져오기
    const markerList = document.getElementById('marker-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const categorySelect = document.getElementById('category-select');
    const maxPriceInput = document.getElementById('max-price-input');
    const sortBySelect = document.getElementById('sort-by-select');
    const advancedSearchButton = document.getElementById('advanced-search-button');
    const resetFiltersButton = document.getElementById('reset-filters-button');
    const addMarkerButton = document.getElementById('add-marker-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const myLocationBtn = document.getElementById('my-location-btn');

    // 다이얼로그 관련 UI 요소
    const markerDialog = document.getElementById('marker-dialog');
    const dialogTitle = markerDialog.querySelector('h2');
    const dialogSubmitBtn = document.getElementById('dialog-submit');
    const dialogCancelBtn = document.getElementById('dialog-cancel');
    const dialogNameInput = document.getElementById('dialog-title');
    const dialogDescriptionInput = document.getElementById('dialog-description');
    const dialogPriceInput = document.getElementById('dialog-price');
    const dialogCategorySelect = document.getElementById('dialog-category');
    const dialogImageInput = document.getElementById('dialog-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    // 지도 초기화 함수
    async function initMap() {
        try {
            const response = await fetch('/api/maps-key');
            const { success, data } = await response.json();
            if (!success) throw new Error('Failed to get API key');
            
            const apiKey = data.apiKey;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=onMapLoad&libraries=marker`;
            script.async = true;
            window.onMapLoad = onMapLoad; // 전역 콜백으로 설정
            document.head.appendChild(script);
        } catch (error) {
            console.error('Failed to load Google Maps:', error);
            alert('지도를 불러오는 데 실패했습니다.');
        }
    }

    // 지도가 로드된 후 실행될 메인 함수
    window.onMapLoad = async function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
            zoom: 12,
        });
        infoWindow = new google.maps.InfoWindow();

        // 지도 클릭 시 정보창 닫기
        map.addListener('click', () => {
            infoWindow.close();
        });

        await fetchUserData();
        
        if (currentUser) {
            await fetchAllMenus();
            setupEventListeners();
        }
    };

    // 사용자 정보 가져오기
    async function fetchUserData() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/views/login.html';
            return;
        }
        try {
            const response = await fetch('/api/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const { success, data } = await response.json();
                if(success) currentUser = data;
                else throw new Error('Failed to fetch user data');
            } else {
                 throw new Error('User data fetch failed');
            }
        } catch (error) {
            console.error(error);
            localStorage.clear();
            window.location.href = '/views/login.html';
        }
    }

    // 모든 메뉴 데이터 가져오기
    async function fetchAllMenus() {
        try {
            const response = await fetch('/api/menus/all-menus');
            const { success, data } = await response.json();
            if (success) {
                allMenus = data;
                updateMapAndList(allMenus);
            }
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    }

    // 지도와 리스트 업데이트
    function updateMapAndList(menus) {
        if (markerClustererInstance) {
            markerClustererInstance.clearMarkers();
        }
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        markerList.innerHTML = '';

        if (!menus || menus.length === 0) {
            markerList.innerHTML = '<p>표시할 메뉴가 없습니다.</p>';
            return;
        }

        const bounds = new google.maps.LatLngBounds();

        markers = menus.map(menu => {
            if (!menu.lat || !menu.lon) return null;

            const position = { lat: menu.lat, lng: menu.lon };
            const marker = new google.maps.Marker({ position, title: menu.name });

            // 마커 이벤트 리스너 개선
            let infowindowOpen = false;
            marker.addListener('click', () => {
                infoWindow.setContent(createInfoWindowContent(menu));
                infoWindow.open(map, marker);
                infowindowOpen = true;
            });
            marker.addListener('mouseover', () => {
                if (!infowindowOpen) {
                    infoWindow.setContent(createInfoWindowContent(menu));
                    infoWindow.open(map, marker);
                }
            });
            marker.addListener('mouseout', () => {
                if (!infowindowOpen) {
                    infoWindow.close();
                }
            });
            google.maps.event.addListener(infoWindow, 'closeclick', () => {
                infowindowOpen = false;
            });

            bounds.extend(position);

            const listItem = createListItem(menu, marker);
            markerList.appendChild(listItem);
            return marker;
        }).filter(Boolean);

        markerClustererInstance = new markerClusterer.MarkerClusterer({ map, markers });

        if (markers.length > 0 && !searchInput.value) {
            map.fitBounds(bounds);
        }
    }

    // 정보창 콘텐츠 생성
    function createInfoWindowContent(menu) {
        const imageHtml = menu.imageUrl ? `<img src="${menu.imageUrl}" alt="${menu.name}" class="infowindow-image">` : '';
        const date = new Date(menu.createdAt).toLocaleDateString();
        return `
            <div class="infowindow-content">
                ${imageHtml}
                <div class="infowindow-details">
                    <h3 class="infowindow-title">${menu.name}</h3>
                    <p class="infowindow-text"><strong>가격:</strong> ${menu.price.toLocaleString()}원</p>
                    <p class="infowindow-text">${menu.description || '설명 없음'}</p>
                    <p class="infowindow-meta">작성자: ${menu.username} | ${date}</p>
                </div>
            </div>
        `;
    }

    // 사이드바 리스트 아이템 생성
    function createListItem(menu, marker) {
        const item = document.createElement('div');
        item.className = 'marker-item';
        item.dataset.menuId = menu._id;

        const isRecommended = currentUser?.recommendedMenus.includes(menu._id);
        const isDisrecommended = currentUser?.disrecommendedMenus.includes(menu._id);

        const imageHtml = menu.imageUrl 
            ? `<img class="marker-item-image" src="${menu.imageUrl}" alt="${menu.name}">` 
            : '<div class="marker-item-image"></div>';

        item.innerHTML = `
            ${imageHtml}
            <div class="marker-info">
                <h4>${menu.name}</h4>
                <p class="price">${menu.price.toLocaleString()}원</p>
                <p class="marker-item-description">${menu.description || '설명 없음'}</p>
                <div class="recommend-actions">
                    <button class="recommend-btn ${isRecommended ? 'recommended' : ''}" data-action="recommend">👍</button>
                    <span class="recommend-count">${menu.recommendations}</span>
                    <button class="disrecommend-btn ${isDisrecommended ? 'disrecommended' : ''}" data-action="disrecommend">👎</button>
                    <span class="disrecommend-count">${menu.disrecommendations}</span>
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
            map.panTo(marker.getPosition());
            infoWindow.setContent(createInfoWindowContent(menu));
            infoWindow.open(map, marker);
        });

        // 이벤트 리스너 연결
        item.querySelector('.recommend-btn').addEventListener('click', () => handleRecommendation(menu._id, 'recommend'));
        item.querySelector('.disrecommend-btn').addEventListener('click', () => handleRecommendation(menu._id, 'disrecommend'));

        const editBtn = item.querySelector('.edit-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        if (editBtn) editBtn.addEventListener('click', () => openEditMenuDialog(menu));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteMenu(menu._id));

        return item;
    }

    // 추천/비추천 처리
    async function handleRecommendation(menuId, action) {
        try {
            const response = await fetch(`/api/menus/${menuId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                await fetchUserData();
                await fetchAllMenus();
            } else {
                alert('요청에 실패했습니다.');
            }
        } catch (error) {
            console.error(`Error ${action}ing menu:`, error);
        }
    }
    
    // 메뉴 삭제
    async function deleteMenu(menuId) {
        if (!confirm('정말로 이 메뉴를 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`/api/menus/${menuId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                await fetchAllMenus();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
        }
    }

    // 고급 검색
    async function applyAdvancedSearch() {
        const query = new URLSearchParams({
            keyword: searchInput.value,
            category: categorySelect.value,
            maxPrice: maxPriceInput.value,
            sortBy: sortBySelect.value
        }).toString();

        try {
            const response = await fetch(`/api/menus/advanced-search?${query}`);
            const { success, data } = await response.json();
            if (success) {
                updateMapAndList(data);
            }
        } catch (error) {
            console.error('Error during advanced search:', error);
        }
    }

    // 다이얼로그 열기 (추가 모드)
    function openAddMenuDialog(position) {
        resetDialog();
        dialogTitle.textContent = '새 메뉴 추가';
        dialogSubmitBtn.textContent = '추가';
        dialogNameInput.dataset.lat = position.lat();
        dialogNameInput.dataset.lon = position.lng();
        markerDialog.classList.add('visible');
    }

    // 다이얼로그 열기 (수정 모드)
    function openEditMenuDialog(menu) {
        resetDialog();
        editingMenuId = menu._id;
        dialogTitle.textContent = '메뉴 수정';
        dialogSubmitBtn.textContent = '수정';
        dialogNameInput.value = menu.name;
        dialogDescriptionInput.value = menu.description;
        dialogPriceInput.value = menu.price;
        dialogCategorySelect.value = menu.category;
        dialogImageInput.value = ''; // 파일 입력은 항상 초기화
        if (menu.imageUrl) {
            const preview = document.createElement('img');
            preview.src = menu.imageUrl;
            preview.style.maxWidth = '100px';
            imagePreviewContainer.innerHTML = '';
            imagePreviewContainer.appendChild(preview);
        }
        markerDialog.classList.add('visible');
    }

    // 다이얼로그 상태 리셋
    function resetDialog() {
        editingMenuId = null;
        pastedImageFile = null;
        dialogNameInput.value = '';
        dialogDescriptionInput.value = '';
        dialogPriceInput.value = '';
        dialogCategorySelect.value = '기타';
        dialogImageInput.value = '';
        imagePreviewContainer.innerHTML = '';
        delete dialogNameInput.dataset.lat;
        delete dialogNameInput.dataset.lon;
    }

    // 다이얼로그 닫기
    function closeDialog() {
        markerDialog.classList.remove('visible');
        resetDialog();
    }

    // 다이얼로그 제출 처리
    async function handleDialogSubmit() {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', dialogNameInput.value);
        formData.append('description', dialogDescriptionInput.value);
        formData.append('price', dialogPriceInput.value);
        formData.append('category', dialogCategorySelect.value);
        
        // 붙여넣기된 이미지 또는 파일 입력에서 선택된 이미지를 추가
        if (pastedImageFile) {
            formData.append('image', pastedImageFile, pastedImageFile.name);
        } else if (dialogImageInput.files[0]) {
            formData.append('image', dialogImageInput.files[0]);
        }

        let url, method;
        if (editingMenuId) {
            url = `/api/menus/${editingMenuId}`;
            method = 'PUT';
        } else {
            url = '/api/menus';
            method = 'POST';
            formData.append('lat', dialogNameInput.dataset.lat);
            formData.append('lon', dialogNameInput.dataset.lon);
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
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

    // 클립보드 이미지 붙여넣기 처리
    function handlePaste(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                pastedImageFile = items[i].getAsFile();
                pastedImageFile.name = `pasted-image-${Date.now()}.png`;
                updateImagePreview(pastedImageFile);
                e.preventDefault();
                break;
            }
        }
    }

    // 이미지 미리보기 업데이트
    function updateImagePreview(source) {
        imagePreviewContainer.innerHTML = ''; // 기존 미리보기 제거
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
        imagePreviewContainer.appendChild(img);
    }

    // 모든 이벤트 리스너 설정
    function setupEventListeners() {
        searchButton.addEventListener('click', applyAdvancedSearch);
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            applyAdvancedSearch();
        });
        advancedSearchButton.addEventListener('click', applyAdvancedSearch);
        resetFiltersButton.addEventListener('click', () => {
            searchInput.value = '';
            categorySelect.value = '';
            maxPriceInput.value = '';
            sortBySelect.value = 'createdAt';
            fetchAllMenus();
        });

        addMarkerButton.addEventListener('click', () => {
            alert('지도를 클릭하여 새 메뉴를 추가할 위치를 선택하세요.');
            const listener = map.addListener('click', (e) => {
                openAddMenuDialog(e.latLng);
                google.maps.event.removeListener(listener);
            });
        });

        dialogSubmitBtn.addEventListener('click', handleDialogSubmit);
        dialogCancelBtn.addEventListener('click', closeDialog);

        // 다이얼로그에 붙여넣기 이벤트 추가
        markerDialog.addEventListener('paste', handlePaste);

        // 파일 입력 변경 시 미리보기 업데이트
        dialogImageInput.addEventListener('change', () => {
            if (dialogImageInput.files[0]) {
                pastedImageFile = null; // 파일 선택 시 붙여넣기된 파일은 무시
                updateImagePreview(dialogImageInput.files[0]);
            }
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/views/login.html';
        });

        myLocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    map.setCenter(myPos);
                    map.setZoom(15);
                    if (myLocationMarker) myLocationMarker.setMap(null);
                    myLocationMarker = new google.maps.Marker({
                        position: myPos,
                        map: map,
                        title: '내 위치',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: '#4285F4',
                            fillOpacity: 1,
                            strokeColor: 'white',
                            strokeWeight: 2,
                        },
                    });
                }, () => alert('위치 정보를 가져올 수 없습니다.'));
            } else {
                alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
            }
        });
    }

    // 초기화 시작
    initMap();
});