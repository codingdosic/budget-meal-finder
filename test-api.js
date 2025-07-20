
const fetch = require('node-fetch');

// API 테스트를 위한 비동기 함수
async function testApi() {
  try {

    console.log('--- 회원가입 테스트 ---');

    // /api/register 엔드포인트로 POST 요청
    const registerRes = await fetch('http://localhost:3000/api/register', {

      // HTTP 메서드를 POST로 지정
      method: 'POST', 

      // 요청 헤더에 JSON 형식 지정 
      headers: { 'Content-Type': 'application/json' }, 

      // 요청 본문의 회원가입 정보를 JSON 문자열로 변환
      body: JSON.stringify({ 
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })

    });

    // 회원가입 요청의 응답 상태 코드를 출력
    console.log('Status:', registerRes.status);

    // 회원가입 요청의 응답 본문을 텍스트로 변환하여 출력
    console.log('Body:', await registerRes.text());


    console.log('\n--- 로그인 테스트 ---');

    // /api/login 엔드포인트로 POST 요청
    const loginRes = await fetch('http://localhost:3000/api/login', {

      // HTTP 메서드를 POST로 지정
      method: 'POST', 

      // 요청 헤더에 JSON 형식 지정 
      headers: { 'Content-Type': 'application/json' },

      // 요청 본문의 로그인 정보를 JSON 문자열로 변환
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'password123'
      })

    });

    // 로그인 요청의 응답 상태 코드를 출력
    console.log('Status:', loginRes.status);

    // 로그인 요청의 응답 본문을 JSON으로 변환
    const loginBody = await loginRes.json();

    // 로그인 요청의 응답 본문을 출력
    console.log('Body:', loginBody);

    // 응답 본문에 토큰이 포함되어 있는지 확인
    if (loginBody.token) { 
      console.log('\nJWT 토큰이 성공적으로 발급되었습니다.');
    } else {
      console.log('\nJWT 토큰 발급에 실패했습니다.');
    }
  } catch (error) {
    // 테스트 중 발생한 오류를 콘솔에 출력
    console.error('테스트 중 오류 발생:', error);
  }
}

testApi();