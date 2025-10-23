# `backend/middleware/authMiddleware.js` 파일 분석

## 1. 파일의 역할

`authMiddleware.js` 파일은 **인증(Authentication)을 처리하는 Express 미들웨어**입니다. 이 미들웨어의 주된 역할은 로그인이 필요한 API 엔드포인트(경로)를 **보호(protect)**하는 것입니다.

클라이언트가 보호된 API에 요청을 보낼 때, 이 미들웨어는 요청 헤더에 포함된 JWT(JSON Web Token)가 유효한지 검증합니다. 토큰이 유효하면 요청을 다음 단계(다른 미들웨어나 최종 컨트롤러)로 전달하고, 유효하지 않으면 접근을 차단하고 에러를 응답합니다.

## 2. 주요 로직 및 흐름

미들웨어는 다음 순서로 동작합니다.

1.  **`Authorization` 헤더 확인**:
    *   `req.header('Authorization')`를 통해 요청 헤더에서 `Authorization` 값을 가져옵니다.
    *   만약 헤더가 없으면, 토큰이 제공되지 않았다는 의미이므로 `401 Unauthorized` 상태 코드와 함께 "Access denied" 메시지를 응답하고 처리를 중단합니다.

2.  **토큰 추출**:
    *   `Authorization` 헤더의 값은 일반적으로 `"Bearer [토큰값]"` 형식을 따릅니다.
    *   `authHeader.replace('Bearer ', '')` 코드를 통해 `"Bearer "` 접두사를 제거하고 순수한 토큰 문자열만 추출합니다.

3.  **토큰 검증 (`try...catch`)**:
    *   **`try` 블록**:
        1.  `jwt.verify(token, process.env.JWT_SECRET)`: `jsonwebtoken` 라이브러리를 사용하여 토큰의 유효성을 검증합니다. 이 함수는 내부적으로 다음 두 가지를 자동으로 확인합니다.
            *   **서명(Signature) 검증**: 토큰이 서버에서 발급 시 사용한 `JWT_SECRET`으로 올바르게 서명되었는지 확인하여 토큰의 위변조 여부를 가려냅니다.
            *   **만료 시간(Expiration) 검증**: 토큰에 설정된 유효기간이 지나지 않았는지 확인합니다.
        2.  검증에 성공하면, `verify` 함수는 토큰에 담겨 있던 **페이로드(payload)**를 반환합니다. (이 프로젝트에서는 `userId`와 `username`이 담겨 있습니다.)
        3.  `req.user = decoded;`: 반환된 페이로드를 `req` 객체의 `user` 속성에 저장합니다. 이로써 이후에 실행될 컨트롤러에서는 `req.user`를 통해 인증된 사용자의 정보에 접근할 수 있습니다.
        4.  `next()`: 모든 검증이 성공했으므로, `next()` 함수를 호출하여 요청을 다음 미들웨어나 라우트 핸들러로 전달합니다.

    *   **`catch (error)` 블록**:
        *   `jwt.verify` 함수가 서명 불일치, 토큰 만료 등 어떤 이유로든 실패하면 에러를 발생시킵니다.
        *   `catch` 블록이 이 에러를 잡아, 콘솔에 에러 메시지를 기록하고 `400 Bad Request` 상태 코드와 함께 "Invalid token" 메시지를 클라이언트에 응답합니다.

## 3. 사용 방식 (암시적)

이 미들웨어는 로그인이 필요한 라우트를 정의할 때 컨트롤러 핸들러 앞에 추가하여 사용됩니다. 예를 들어, `menuRoutes.js`에서 새로운 메뉴를 추가하는 API는 다음과 같이 보호될 수 있습니다.

```javascript
// 예시: routes/menuRoutes.js
const authMiddleware = require('../middleware/authMiddleware');

// authMiddleware가 먼저 실행되어 인증을 검사한다.
router.post('/menus', authMiddleware, menuController.createMenu);

// 이 라우트는 미들웨어가 없으므로 누구나 접근 가능하다.
router.get('/menus', menuController.getAllMenus);
```

## 4. 다른 파일과의 상호작용

-   **`jsonwebtoken`**: JWT를 검증하기 위한 핵심 라이브러리입니다.
-   **`.env` (암시적)**: 토큰 서명을 검증하기 위해 `process.env.JWT_SECRET` 환경 변수를 사용합니다. 이 값은 토큰을 발급할 때(`auth.service.js`) 사용된 값과 반드시 일치해야 합니다.
-   **각종 라우트 파일 (암시적)**: `userRoutes.js`, `restaurantRoutes.js` 등 로그인이 필요한 기능을 포함하는 라우트 파일에서 이 미들웨어를 임포트하여 사용합니다.
-   **각종 컨트롤러 파일 (암시적)**: 보호된 라우트의 컨트롤러들은 `req.user` 객체를 통해 현재 로그인된 사용자의 ID나 이름을 조회하여 비즈니스 로직을 처리할 수 있습니다.
