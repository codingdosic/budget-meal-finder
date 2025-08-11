// frontend/js/api.js

const BASE_URL = '/api';

// 에러 핸들링을 포함한 fetch 래퍼 함수
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(errorData.error.message || 'API 요청에 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Google Maps API 키 가져오기
export async function getMapsKey() {
    return request(`${BASE_URL}/maps-key`);
}

// 사용자 정보 가져오기
export async function fetchUser(token) {
    return request(`${BASE_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// 내가 작성한 메뉴 데이터 가져오기
export async function fetchMyMenus(token) {
    return request(`${BASE_URL}/menus/my-menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// 모든 메뉴 데이터 가져오기
export async function getAllMenus() {
    return request(`${BASE_URL}/menus/all-menus`);
}

// 고급 검색 적용
export async function applyAdvancedSearch(params) {
    const query = new URLSearchParams(params).toString();
    return request(`${BASE_URL}/menus/advanced-search?${query}`);
}

// 메뉴 추천/비추천
export async function handleRecommendation(menuId, action, token) {
    return request(`${BASE_URL}/menus/${menuId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// 메뉴 삭제
export async function deleteMenu(menuId, token) {
    return request(`${BASE_URL}/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// 메뉴 추가/수정 제출
export async function submitMenu(formData, token, menuId = null) {
    const url = menuId ? `${BASE_URL}/menus/${menuId}` : `${BASE_URL}/menus`;
    const method = menuId ? 'PUT' : 'POST';

    return fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
}
