document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');
    const getLocationBtn = document.getElementById('get-location');
    const locationDisplay = document.getElementById('location-display');

    let userLocation = null;

    // 현재 위치 가져오기 버튼 클릭 이벤트
    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                locationDisplay.textContent = `위도: ${userLocation.lat.toFixed(4)}, 경도: ${userLocation.lon.toFixed(4)}`;
                alert('위치 정보를 가져왔습니다.');
            }, (error) => {
                console.error('Geolocation error:', error);
                alert('위치 정보를 가져오는 데 실패했습니다.');
            });
        } else {
            alert('이 브라우저에서는 위치 정보 서비스를 지원하지 않습니다.');
        }
    });

    // 설정 저장 폼 제출 이벤트
    settingsForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 폼 기본 제출 동작 방지

        const budget = document.getElementById('budget').value;

        if (!budget || !userLocation) {
            alert('예산과 위치를 모두 설정해주세요.');
            return;
        }

        // localStorage에 예산과 위치 정보 저장
        localStorage.setItem('userBudget', budget);
        localStorage.setItem('userLocation', JSON.stringify(userLocation));

        alert('설정이 저장되었습니다. 메인 페이지로 이동합니다.');
        window.location.href = '/views/index.html'; // 메인 페이지로 리디렉션
    });
});