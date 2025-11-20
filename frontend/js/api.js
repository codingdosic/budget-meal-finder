// frontend/js/api.js

const BASE_URL = '/api';

// 에러 핸들링을 포함한 fetch 래퍼 함수
async function request(url, options = {}) {
    try {

        // 옵션(method, headers, body 등) 요청 보내기
        const response = await fetch(url, options);

        // 상태 코드 체크(200번대가 아니면 에러 처리)
        if (!response.ok) {

            //에러 데이터 추출, json이 아니거나 추출 실패 시 기본 메시지 사용
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(errorData.error.message || 'API 요청에 실패했습니다.');
        }

        // 204 No Content 처리
        if (response.status === 204) {
            return {};
        }

        // 정상 응답 js 객체로 변환하여 반환
        return await response.json();

    } catch (error) { // 다른 오류 처리
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

// 비밀번호 변경
export async function changePassword(currentPassword, newPassword, token) {
    return request(`${BASE_URL}/user/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });
}

// 이메일 변경
export async function changeEmail(newEmail, token) {
    return request(`${BASE_URL}/user/email`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
    });
}

// 계정 삭제
export async function deleteAccount(token) {
    return request(`${BASE_URL}/user`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// 비밀번호 재설정 요청
export async function resetPassword(email) {
    return request(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
}

// (관리자) 계정 생성
export async function registerAdmin(data) {
    return request(`${BASE_URL}/auth/register-admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

// (관리자) 모든 사용자 정보 가져오기
export async function getAllUsersAdmin(token, searchQuery = '') {
    const url = searchQuery ? `${BASE_URL}/admin/users?search=${searchQuery}` : `${BASE_URL}/admin/users`;
    return request(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// (관리자) 특정 사용자의 메뉴 정보 가져오기
export async function getUserMenusAdmin(userId, token) {
    return request(`${BASE_URL}/admin/users/${userId}/menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

// 계정 생성
export async function register(data){
    return request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}

// 로그인
export async function login(data) {
    return request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}
