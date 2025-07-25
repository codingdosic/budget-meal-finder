document.addEventListener('DOMContentLoaded', () => {
    const userBudget = localStorage.getItem('userBudget');
    const userLocation = JSON.parse(localStorage.getItem('userLocation'));

    // 1. 설정 값 확인
    if (!userBudget || !userLocation) {
        alert('초기 설정이 필요합니다. 설정 페이지로 이동합니다.');
        window.location.href = '/views/settings.html';
        return;
    }

    // 설정 정보 표시
    document.getElementById('current-budget').textContent = userBudget;

    // 2. 백엔드에서 API 키 요청
    fetch('/api/maps-key')
        .then(response => response.json())
        .then(data => {
            const apiKey = data.apiKey;
            if (apiKey && apiKey !== 'YOUR_API_KEY') {
                // 3. Google Maps 스크립트 동적 로드
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
});

// 4. 맵 초기화 함수 (Google Maps 스크립트가 로드된 후 호출됨)
function initMap() {
    const userLocation = JSON.parse(localStorage.getItem('userLocation'));
    const mapElement = document.getElementById('map');

    if (userLocation && mapElement) {
        const map = new google.maps.Map(mapElement, {
            center: { lat: userLocation.lat, lng: userLocation.lon },
            zoom: 15
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

        // 지도 클릭 이벤트
        map.addListener('click', (event) => {
            if (isMarkerMode) {
                // 1. 사용자로부터 정보 입력받기
                const title = prompt('마커의 제목을 입력하세요 (예: 식당 이름):');
                if (!title) { // 사용자가 취소하거나 아무것도 입력하지 않으면 중단
                    isMarkerMode = false;
                    addMarkerBtn.textContent = '마커 추가';
                    map.setOptions({ draggableCursor: 'grab' });
                    return;
                }

                const content = prompt('마커의 내용을 입력하세요 (예: 메뉴, 가격):');

                // 2. 마커 생성
                const marker = new google.maps.Marker({
                    position: event.latLng,
                    map: map,
                    title: title // 마커에 마우스 오버 시 제목 표시
                });

                // 3. 정보창(InfoWindow) 생성
                const infowindow = new google.maps.InfoWindow({
                    content: `<h3>${title}</h3><p>${content || ''}</p>`
                });

                // 4. 마커 클릭 시 정보창 열기 이벤트 추가
                marker.addListener('click', () => {
                    infowindow.open(map, marker);
                });

                // 5. 마커 추가 후 모드 비활성화
                isMarkerMode = false;
                addMarkerBtn.textContent = '마커 추가';
                map.setOptions({ draggableCursor: 'grab' });
            }
        });
        // --- 기능 구현 끝 ---

        console.log('Map initialized.');
    }
}
