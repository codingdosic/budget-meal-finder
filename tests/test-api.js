
const fetch = require('node-fetch');

// 테스트에 사용할 기본 URL
const BASE_URL = 'http://localhost:3000/api';

// 테스트에 사용할 데이터
const testUser = { 
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'password123'
};

let authToken = ''; // 로그인 후 발급받은 JWT 토큰을 저장할 변수
let restaurantId = ''; // 생성된 식당의 ID를 저장할 변수
let menuId = ''; // 생성된 메뉴의 ID를 저장할 변수

// API 테스트를 위한 비동기 함수
async function testApi() {
  try {
    // --- 1. 회원가입 테스트 ---
    console.log('\n--- 1. 회원가입 테스트 ---');
    const registerRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    console.log(`Status: ${registerRes.status}`);
    console.log(`Body: ${await registerRes.text()}`);

    // --- 2. 로그인 테스트 ---
    console.log('\n--- 2. 로그인 테스트 ---');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginBody = await loginRes.json();
    authToken = loginBody.token; // 발급받은 토큰 저장
    console.log(`Status: ${loginRes.status}`);
    console.log(`Token: ${authToken}`);

    // --- 3. 식당 등록 테스트 ---
    console.log('\n--- 3. 식당 등록 테스트 ---');
    const restaurantData = {
      name: '테스트 식당',
      address: '서울시 강남구 테스트로 123',
      location: { type: 'Point', coordinates: [127.0276, 37.4979] }, // 강남역 좌표
      category: '한식'
    };
    const createRestaurantRes = await fetch(`${BASE_URL}/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // 인증 토큰 추가
      },
      body: JSON.stringify(restaurantData)
    });
    const createdRestaurant = await createRestaurantRes.json();
    restaurantId = createdRestaurant._id; // 생성된 식당 ID 저장
    console.log(`Status: ${createRestaurantRes.status}`);
    console.log('Created Restaurant:', createdRestaurant);

    // --- 4. 메뉴 추가 테스트 ---
    console.log('\n--- 4. 메뉴 추가 테스트 ---');
    const menuData = { name: '김치찌개', price: 8000, description: '맛있는 김치찌개' };
    const createMenuRes = await fetch(`${BASE_URL}/restaurants/${restaurantId}/menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(menuData)
    });
    const createdMenu = await createMenuRes.json();
    menuId = createdMenu._id; // 생성된 메뉴 ID 저장
    console.log(`Status: ${createMenuRes.status}`);
    console.log('Created Menu:', createdMenu);

    // --- 5. 정보 조회 테스트 ---
    console.log('\n--- 5. 정보 조회 테스트 ---');
    const restaurantsRes = await fetch(`${BASE_URL}/restaurants`);
    console.log('All Restaurants:', await restaurantsRes.json());

    const restaurantRes = await fetch(`${BASE_URL}/restaurants/${restaurantId}`);
    console.log('Single Restaurant:', await restaurantRes.json());

    const menusRes = await fetch(`${BASE_URL}/restaurants/${restaurantId}/menus`);
    console.log('Menus in Restaurant:', await menusRes.json());

    // --- 6. 정보 수정 테스트 ---
    console.log('\n--- 6. 정보 수정 테스트 ---');
    const updatedMenuData = { name: '된장찌개', price: 9000, description: '구수한 된장찌개' };
    const updateMenuRes = await fetch(`${BASE_URL}/menus/${menuId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updatedMenuData)
    });
    console.log(`Status: ${updateMenuRes.status}`);
    console.log('Updated Menu:', await updateMenuRes.json());

    // --- 7. 핵심 검색 테스트 ---
    console.log('\n--- 7. 핵심 검색 테스트 ---');
    const searchRes = await fetch(`${BASE_URL}/search?lat=37.4979&lon=127.0276&budget=10000`);
    console.log(`Status: ${searchRes.status}`);
    console.log('Search Results:', await searchRes.json());

    // --- 8. 정보 삭제 테스트 ---
    console.log('\n--- 8. 정보 삭제 테스트 ---');
    const deleteMenuRes = await fetch(`${BASE_URL}/menus/${menuId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`Delete Menu Status: ${deleteMenuRes.status}`);
    console.log(await deleteMenuRes.json());

  } catch (error) {
    console.error('\n🚨 테스트 중 오류 발생:', error);
  } finally {
    // --- 테스트 후 데이터 정리 (선택적) ---
    // 테스트용으로 생성한 식당을 삭제합니다.
    if (restaurantId && authToken) {
        console.log('\n--- 테스트 데이터 정리 ---');
        await fetch(`${BASE_URL}/restaurants/${restaurantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log(`식당(ID: ${restaurantId}) 삭제 완료`);
    }
  }
}

testApi();