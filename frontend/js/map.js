// frontend/js/map.js
import * as api from './api.js';
import { showDialog } from './dialog.js';

// 전역 변수
let map;
let infoWindow;
let markers = [];
let markerClustererInstance;
let myLocationMarker = null;
let clickedMarker = null;

// 마커 정보 표시 함수
function createInfoWindowContent(menu) {

    // 이미지 가져오기
    const imageHtml = menu.imageUrl ? `<img src="${menu.imageUrl}" alt="${menu.name}" class="infowindow-image">` : '';

    // 생성일자 포맷팅
    const date = new Date(menu.createdAt).toLocaleDateString();

    // 마커 정보 표시창
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


// 지도 초기화
export function initMap(onMapLoadCallback) {

    // 구글맵 api 키 요청 
    api.getMapsKey()

        // 키 받아오면 스크립트 동적 로드
        .then(({ data }) => {

            // 객체에서 키 추출
            const apiKey = data.apiKey;

            // 동적 생성을 위한 스크립트 태그 생성
            const script = document.createElement('script');

            // 맵스 api 로드 주소
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=onMapLoad&libraries=marker`;
            
            // 비동기 로드 설정
            script.async = true;

            // 맵스 api 로드 시 호출
            window.onMapLoad = () => {

                // 지정한 html 요소에 맵 초기화 
                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
                    zoom: 12,
                });

                // 정보창 초기화
                infoWindow = new google.maps.InfoWindow();

                // 지도 클릭 시 정보창 닫기, 클릭 마커 초기화
                map.addListener('click', () => {
                    infoWindow.close();
                    clickedMarker = null;
                });

                // onMapLoadCallback으로 넘겨진 함수 있을 시 호출
                if (onMapLoadCallback) {
                    onMapLoadCallback();
                }
            };

            // 맵스는 문서의 head에 추가해야 동작
            document.head.appendChild(script);
        })
        .catch(error => {
            console.error('Failed to load Google Maps:', error);
            showDialog({ message: '지도를 불러오는 데 실패했습니다.', title: '지도 오류' });
        });
}

// 지도 업데이트 (마커 및 클러스터)
export function updateMap(menus, shouldFitBounds = false) {

    // 기존 마커 및 클러스터 제거하여 누적 방지
    if (markerClustererInstance) {
        markerClustererInstance.clearMarkers();
    }

    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // 메뉴 데이터 없으면 종료
    if (!menus || menus.length === 0) return;

    // 경계 설정을 위한 LatLngBounds 객체 생성
    const bounds = new google.maps.LatLngBounds();

    // 메뉴 데이터로 마커 생성
    markers = menus.map(menu => {

        // 위도 경도 없으면 마커 생성 안함
        if (!menu.lat || !menu.lon) return null;

        // 마커 위치 설정
        const position = { lat: menu.lat, lng: menu.lon };

        // 마커 생성
        const marker = new google.maps.Marker({ position, title: menu.name });

        // 마커 이벤트 리스너 설정
        marker.addListener('click', () => {
            infoWindow.setContent(createInfoWindowContent(menu));
            infoWindow.open(map, marker);
            clickedMarker = marker;
        });
        marker.addListener('mouseover', () => {
            if (!clickedMarker) {
                infoWindow.setContent(createInfoWindowContent(menu));
                infoWindow.open(map, marker);
            }
        });
        marker.addListener('mouseout', () => {
            if (!clickedMarker) {
                infoWindow.close();
            }
        });
        google.maps.event.addListener(infoWindow, 'closeclick', () => {
            clickedMarker = null;
        });

        // 경계 확장을 위해 위치 추가
        bounds.extend(position);

        // 연관된 메뉴 정보를 마커에 저장
        marker.menuData = menu;
        return marker;

        // null 필터링
    }).filter(Boolean);

    // 마커 클러스터러 생성
    markerClustererInstance = new markerClusterer.MarkerClusterer({ map, markers });

    // 모든 마커가 화면에 담기도록 경계 설정
    if (shouldFitBounds && markers.length > 0) {
        map.fitBounds(bounds);
    }
}

// 특정 위치로 지도 이동 및 정보창 열기
export function panToMarker(menuId) {

    // menuId와 동일한 마커 찾기
    const marker = markers.find(m => m.menuData._id === menuId);
    if (marker) {

        // 지도 이동
        map.panTo(marker.getPosition());

        // 정보창 객체에 정보 생성 후 열기
        infoWindow.setContent(createInfoWindowContent(marker.menuData));
        infoWindow.open(map, marker);
    }
}

// '내 위치' 표시
export function showMyLocation() {

    // 브라우저 위치 정보 사용 가능 여부 확인
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {

            // 내 위치로 이동
            const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(myPos);
            map.setZoom(15);

            // 기존 내 위치 표시 마커 제거 후 새로 생성
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
        }, () => showDialog({ message: '위치 정보를 가져올 수 없습니다.', title: '위치 오류' }));
    } else {
        showDialog({ message: '이 브라우저에서는 위치 정보가 지원되지 않습니다.', title: '위치 오류' });
    }
}

// 지도 클릭 리스너 추가 (일회성)
export function addMapClickListener(callback) {
    const listener = map.addListener('click', (e) => {

        // 클릭 시 위치 반환 후 리스너 제거 -> 제거가 안될 시 지도 클릭 시마다 콜백으로 위치값이 전달됨
        // 위치 정보를 한번만 주고 싶을 때 사용
        callback(e.latLng);
        google.maps.event.removeListener(listener);
    });
}
