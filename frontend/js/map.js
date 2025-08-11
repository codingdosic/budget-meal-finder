// frontend/js/map.js
import * as api from './api.js';

let map;
let infoWindow;
let markers = [];
let markerClustererInstance;
let myLocationMarker = null;

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

// 지도 초기화
export function initMap(onMapLoadCallback) {
    api.getMapsKey()
        .then(({ data }) => {
            const apiKey = data.apiKey;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=onMapLoad&libraries=marker`;
            script.async = true;
            window.onMapLoad = () => {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
                    zoom: 12,
                });
                infoWindow = new google.maps.InfoWindow();

                map.addListener('click', () => {
                    infoWindow.close();
                });

                if (onMapLoadCallback) {
                    onMapLoadCallback();
                }
            };
            document.head.appendChild(script);
        })
        .catch(error => {
            console.error('Failed to load Google Maps:', error);
            alert('지도를 불러오는 데 실패했습니다.');
        });
}

// 지도 업데이트 (마커 및 클러스터)
export function updateMap(menus, shouldFitBounds = false) {
    if (markerClustererInstance) {
        markerClustererInstance.clearMarkers();
    }
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    if (!menus || menus.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    markers = menus.map(menu => {
        if (!menu.lat || !menu.lon) return null;

        const position = { lat: menu.lat, lng: menu.lon };
        const marker = new google.maps.Marker({ position, title: menu.name });

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
        // 연관된 메뉴 정보를 마커에 저장
        marker.menuData = menu;
        return marker;
    }).filter(Boolean);

    markerClustererInstance = new markerClusterer.MarkerClusterer({ map, markers });

    if (shouldFitBounds && markers.length > 0) {
        map.fitBounds(bounds);
    }
}

// 특정 위치로 지도 이동 및 정보창 열기
export function panToMarker(menuId) {
    const marker = markers.find(m => m.menuData._id === menuId);
    if (marker) {
        map.panTo(marker.getPosition());
        infoWindow.setContent(createInfoWindowContent(marker.menuData));
        infoWindow.open(map, marker);
    }
}

// '내 위치' 표시
export function showMyLocation() {
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
}

// 지도 클릭 리스너 추가 (일회성)
export function addMapClickListener(callback) {
    const listener = map.addListener('click', (e) => {
        callback(e.latLng);
        google.maps.event.removeListener(listener);
    });
}
