let allMenus = []; // 모든 메뉴 데이터를 저장할 배열
let allMarkers = []; // 모든 마커 객체를 저장할 배열
let currentInfoWindow = null; // 현재 열려있는 InfoWindow를 추적하는 변수
let editingMenuId = null; // 수정 중인 메뉴의 ID를 저장할 변수

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Token is valid, proceed with loading the map
                fetchGoogleMapsApiKey();
            } else {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = '/views/login.html';
            }
        } catch (error) {
            console.error('Error validating token:', error);
            window.location.href = '/views/login.html';
        }
    } else {
        window.location.href = '/views/login.html';
    }
});

function fetchGoogleMapsApiKey() {
    fetch('/api/maps-key')
        .then(response => response.json())
        .then(data => {
            const apiKey = data.apiKey;
            if (apiKey && apiKey !== 'YOUR_API_KEY') {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            } else {
                console.error('Google Maps API 키가 유효하지 않습니다. .env 파일을 확인해주세요.');
                alert('지도를 로드하는 데 문제가 발생했습니다. API 키 설정을 확인해주세요.');
            }
        })
        .catch(error => {
            console.error('API 키를 가져오는 데 실패했습니다:', error);
            alert('지도를 로드하는 데 필요한 정보를 가져오지 못했습니다.');
        });
}

// 4. 맵 초기화 함수 (Google Maps 스크립트가 로드된 후 호출됨)
function initMap() {
    const userLocation = JSON.parse(localStorage.getItem('userLocation'));
    const mapElement = document.getElementById('map');

    // 다이얼로그 관련 요소 가져오기
    const markerDialog = document.getElementById('marker-dialog');
    const dialogTitle = document.querySelector('#marker-dialog h2'); // 다이얼로그 제목
    const dialogTitleInput = document.getElementById('dialog-title');
    const dialogDescriptionInput = document.getElementById('dialog-description');
    const dialogPriceInput = document.getElementById('dialog-price');
    const dialogSubmitBtn = document.getElementById('dialog-submit');
    const dialogCancelBtn = document.getElementById('dialog-cancel');

    let clickedLatLng = null; // 지도를 클릭한 위치를 저장할 변수

    if (mapElement) { // userLocation 체크는 이제 필수가 아님
        const map = new google.maps.Map(mapElement, {
            center: userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : { lat: 37.5665, lng: 126.9780 }, // 기본 서울 시청
            zoom: 15
        });

        // "내 위치로 이동하기" 버튼 이벤트 리스너
        const myLocationBtn = document.getElementById('my-location-btn');
        if (myLocationBtn) {
            myLocationBtn.addEventListener('click', () => {
                const storedLocation = JSON.parse(localStorage.getItem('userLocation'));
                if (storedLocation && storedLocation.lat && storedLocation.lon) {
                    map.setCenter({ lat: storedLocation.lat, lng: storedLocation.lon });
                    alert('내 위치로 이동했습니다.');
                } else {
                    // Geolocation API를 사용하여 현재 위치 가져오기
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const lat = position.coords.latitude;
                                const lon = position.coords.longitude;
                                const newLocation = { lat, lon };
                                localStorage.setItem('userLocation', JSON.stringify(newLocation));
                                map.setCenter({ lat, lng: lon });
                                alert('현재 위치를 가져와 지도에 표시했습니다.');
                            },
                            (error) => {
                                console.error('Error getting location:', error);
                                alert('현재 위치를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
                            }
                        );
                    } else {
                        alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
                    }
                }
            });
        }

        // 예산 입력 및 설정 버튼 이벤트 리스너
        const budgetInputMain = document.getElementById('budget-input-main');
        const setBudgetBtn = document.getElementById('set-budget-btn');

        // 초기 예산 표시 (선택 사항, 현재 HTML에서 제거되었으므로 주석 처리)
        // const currentBudgetDisplay = document.getElementById('current-budget');
        // if (currentBudgetDisplay) {
        //     const userBudget = localStorage.getItem('userBudget');
        //     if (userBudget) {
        //         currentBudgetDisplay.textContent = userBudget;
        //     }
        // }

        if (setBudgetBtn) {
            setBudgetBtn.addEventListener('click', () => {
                const newBudget = parseInt(budgetInputMain.value);
                if (!isNaN(newBudget) && newBudget > 0) {
                    localStorage.setItem('userBudget', newBudget);
                    alert(`예산이 ${newBudget}원으로 설정되었습니다.`);
                    // if (currentBudgetDisplay) {
                    //     currentBudgetDisplay.textContent = newBudget;
                    // }
                    // 예산에 따른 마커 필터링이 있다면 여기서 loadAndDisplayMarkers(map) 호출
                } else {
                    alert('유효한 예산 금액을 입력해주세요.');
                }
            });
        }

        // 기존 메뉴들을 로드하고 지도에 표시
        loadAndDisplayMarkers(map, markerDialog, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn);

        // 검색 기능 이벤트 리스너
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const clearSearchButton = document.getElementById('clear-search-button');

        function filterAndDisplayMarkers(map, searchTerm) {
            const filteredMenus = allMenus.filter(menu => 
                menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                menu.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            renderMarkerList(map, filteredMenus);
        }

        searchButton.addEventListener('click', () => {
            filterAndDisplayMarkers(map, searchInput.value);
        });

        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                filterAndDisplayMarkers(map, searchInput.value);
            }
        });

        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            renderMarkerList(map, allMenus);
        });

        // --- 4단계: 마커 추가 기능 구현 ---
        const addMarkerBtn = document.getElementById('add-marker-btn');
        let isMarkerMode = false;

        // "마커 추가" 버튼 클릭 이벤트
        addMarkerBtn.addEventListener('click', () => {
            isMarkerMode = !isMarkerMode; // 모드 전환
            if (isMarkerMode) {
                addMarkerBtn.textContent = '지도에서 위치를 클릭하세요';
                map.setOptions({ draggableCursor: 'crosshair' }); // 커서 모양 변경
            } else {
                addMarkerBtn.textContent = '마커 추가';
                map.setOptions({ draggableCursor: 'grab' }); // 기본 커서로 복원
            }
        });

        // 지도 클릭 이벤트 (마커 추가 모드와 별개로 InfoWindow 닫기)
        map.addListener('click', () => {
            if (currentInfoWindow) {
                currentInfoWindow.close();
                currentInfoWindow = null; // InfoWindow 닫은 후 null로 설정
            }
        });

        // 지도 클릭 이벤트 (마커 추가 모드)
        map.addListener('click', (event) => {
            if (isMarkerMode) {
                clickedLatLng = event.latLng; // 클릭된 위치 저장
                markerDialog.classList.add('visible'); // 다이얼로그 표시
            }
        });

        // 다이얼로그 제출 버튼 이벤트
        dialogSubmitBtn.addEventListener('click', async () => {
            const title = dialogTitleInput.value;
            const description = dialogDescriptionInput.value;
            const price = parseInt(dialogPriceInput.value);

            if (!title || !price || isNaN(price) || (!editingMenuId && !clickedLatLng)) {
                alert('모든 필드를 올바르게 입력하고 지도를 클릭해주세요.');
                return;
            }

            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');

            if (!token || !username) {
                alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
                window.location.href = '/views/login.html';
                return;
            }

            let url = '/api/menus';
            let method = 'POST';
            let successMessage = '메뉴가 성공적으로 추가되었습니다!';
            let errorMessage = '메뉴 추가 실패:';
            let bodyData = {
                name: title,
                price: price,
                description: description,
            };

            if (editingMenuId) {
                url = `/api/menus/${editingMenuId}`;
                method = 'PUT';
                successMessage = '메뉴가 성공적으로 수정되었습니다!';
                errorMessage = '메뉴 수정 실패:';
            } else {
                bodyData.lat = clickedLatLng.lat();
                bodyData.lon = clickedLatLng.lng();
            }

            // 백엔드 API 호출
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(bodyData)
                });

                const data = await response.json();

                if (response.ok) {
                    alert(successMessage);
                    loadAndDisplayMarkers(map, markerDialog, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn); // 전체 메뉴를 다시 로드하여 리스트 및 지도 업데이트
                } else {
                    alert(`${errorMessage} ${data.message || '알 수 없는 오류'}`);
                }
            } catch (error) {
                console.error(`Error ${method === 'POST' ? 'adding' : 'updating'} menu:`, error);
                alert(`메뉴 ${method === 'POST' ? '추가' : '수정'} 중 오류가 발생했습니다.`);
            } finally {
                // 다이얼로그 숨기기 및 필드 초기화
                markerDialog.classList.remove('visible');
                dialogTitleInput.value = '';
                dialogDescriptionInput.value = '';
                dialogPriceInput.value = '';
                clickedLatLng = null; // Reset clickedLatLng
                editingMenuId = null; // Reset editingMenuId
                dialogTitle.textContent = '새 메뉴 추가'; // Reset dialog title
                dialogSubmitBtn.textContent = '추가'; // Reset button text
                isMarkerMode = false;
                addMarkerBtn.textContent = '마커 추가';
                map.setOptions({ draggableCursor: 'grab' });
            }
        });

        // 다이얼로그 취소 버튼 이벤트
        dialogCancelBtn.addEventListener('click', () => {
            markerDialog.classList.remove('visible');
            dialogTitleInput.value = '';
            dialogDescriptionInput.value = '';
            dialogPriceInput.value = '';
            clickedLatLng = null;
            isMarkerMode = false;
            addMarkerBtn.textContent = '마커 추가';
            map.setOptions({ draggableCursor: 'grab' });
        });
        // --- 기능 구현 끝 ---

        console.log('Map initialized.');
    }
}

// 모든 메뉴를 로드하고 지도에 마커로 표시하는 함수
async function loadAndDisplayMarkers(map, markerDialog, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn) {
    try {
        const response = await fetch('/api/menus/all-menus');
        allMenus = await response.json(); // 전역 변수에 저장

        renderMarkerList(map, allMenus, markerDialog, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn); // 초기 리스트 렌더링

    } catch (error) {
        console.error('Error loading and displaying markers:', error);
        alert('기존 메뉴를 불러오는 데 실패했습니다.');
    }
}

// 마커 리스트를 렌더링하는 함수
function renderMarkerList(map, menusToDisplay, markerDialog, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn) {
    const markerListDiv = document.getElementById('marker-list');
    markerListDiv.innerHTML = ''; // 기존 리스트 초기화

    const loggedInUsername = localStorage.getItem('username');

    // 현재 사용자가 추가한 메뉴와 그 외 메뉴를 분리
    const userMenus = [];
    const otherMenus = [];

    menusToDisplay.forEach(menu => {
        if (loggedInUsername && loggedInUsername === menu.username) {
            userMenus.push(menu);
        } else {
            otherMenus.push(menu);
        }
    });

    // 현재 사용자가 추가한 메뉴를 먼저 렌더링
    [...userMenus, ...otherMenus].forEach(menu => {
        if (menu.lat && menu.lon) {
            // 지도에 마커 추가
            const marker = new google.maps.Marker({
                position: { lat: menu.lat, lng: menu.lon },
                map: map,
                title: menu.name,
                menuId: menu._id // 마커에 menuId 저장
            });
            allMarkers.push(marker); // 마커 객체 저장

            const infowindow = new google.maps.InfoWindow({
                content: `<h3>${menu.name}</h3><p>${menu.description || ''}</p><p>가격: ${menu.price}원</p><p>작성자: ${menu.username}</p><p>식당: ${menu.restaurantName}</p>`
            });

            marker.addListener('click', () => {
                if (currentInfoWindow) {
                    currentInfoWindow.close(); // 기존 정보창 닫기
                }
                infowindow.open(map, marker);
                currentInfoWindow = infowindow; // 현재 정보창 업데이트
            });

            // 리스트 아이템 생성
            const listItem = document.createElement('div');
            listItem.className = 'marker-item';
            
            let buttonsHtml = '';
            if (loggedInUsername && loggedInUsername === menu.username) {
                buttonsHtml = `
                    <div class="marker-actions">
                        <button class="edit-btn" data-id="${menu._id}">수정</button>
                        <button class="delete-btn" data-id="${menu._id}">삭제</button>
                    </div>
                `;
            }

            listItem.innerHTML = `
                <div class="marker-info">
                    <h4>${menu.name} (${menu.price}원)</h4>
                    <p>${menu.description || '설명 없음'}</p>
                    <p>작성자: ${menu.username}</p>
                    <p>식당: ${menu.restaurantName}</p>
                </div>
                ${buttonsHtml}
            `;
            listItem.addEventListener('click', () => {
                map.setCenter({ lat: menu.lat, lng: menu.lon });
                if (currentInfoWindow) {
                    currentInfoWindow.close(); // 기존 정보창 닫기
                }
                infowindow.open(map, marker);
                currentInfoWindow = infowindow; // 현재 정보창 업데이트
            });
            markerListDiv.appendChild(listItem);

            // 수정 버튼 이벤트 리스너 추가
            if (loggedInUsername && loggedInUsername === menu.username) {
                const editButton = listItem.querySelector(`.edit-btn[data-id="${menu._id}"]`);
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    editingMenuId = menu._id; // 수정할 메뉴 ID 저장
                    dialogTitle.textContent = '메뉴 수정'; // 다이얼로그 제목 변경
                    dialogSubmitBtn.textContent = '수정'; // 버튼 텍스트 변경

                    // 기존 정보 다이얼로그에 채우기
                    dialogTitleInput.value = menu.name;
                    dialogDescriptionInput.value = menu.description;
                    dialogPriceInput.value = menu.price;
                    clickedLatLng = new google.maps.LatLng(menu.lat, menu.lon); // 기존 마커 위치 저장

                    markerDialog.classList.add('visible'); // 다이얼로그 표시
                });

                const deleteButton = listItem.querySelector(`.delete-btn[data-id="${menu._id}"]`);
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
                        deleteMenu(menu._id, map);
                    }
                });
            }
    };
})

// 검색 및 필터링 함수
function filterAndDisplayMarkers(map, searchTerm) {
    const filteredMenus = allMenus.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        menu.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderMarkerList(map, filteredMenus);
}

// 메뉴 삭제 함수
async function deleteMenu(menuId, map) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }

    try {
        const response = await fetch(`/api/menus/${menuId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('메뉴가 삭제되었습니다.');
            // 지도에서 해당 마커 제거
            const markerToRemove = allMarkers.find(marker => marker.menuId === menuId);
            if (markerToRemove) {
                markerToRemove.setMap(null); // 지도에서 마커 제거
                allMarkers = allMarkers.filter(marker => marker.menuId !== menuId); // allMarkers 배열에서 제거
            }
            // allMenus 배열에서도 해당 메뉴 제거 (검색 및 필터링을 위해)
            allMenus = allMenus.filter(menu => menu._id !== menuId);
            renderMarkerList(map, allMenus, dialogTitle, dialogTitleInput, dialogDescriptionInput, dialogPriceInput, dialogSubmitBtn, dialogCancelBtn); // 리스트 새로고침
        } else {
            const data = await response.json();
            alert(`메뉴 삭제 실패: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting menu:', error);
        alert('메뉴 삭제 중 오류가 발생했습니다.');
    }
}
}
