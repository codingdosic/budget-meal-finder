# `backend/controllers/auth.controller.js` 파일 분석

## 1. 파일의 역할

`auth.controller.js`는 사용자 인증(Authentication)과 관련된 모든 HTTP 요청을 처리하는 **컨트롤러**입니다. 클라이언트로부터 들어오는 회원가입, 로그인, 비밀번호 재설정 등의 API 요청을 받아, 실제 비즈니스 로직을 처리하는 `AuthService`를 호출하고, 그 결과를 클라이언트에게 응답으로 보내주는 역할을 합니다.

이 컨트롤러는 API 엔드포인트와 비즈니스 로직(서비스 계층)을 연결하는 **중개자** 역할을 수행합니다.

## 2. 주요 로직 및 구조

### `AuthController` 클래스
인증 관련 컨트롤러 메서드들을 `AuthController`라는 클래스 안에 그룹화하여 코드를 구조화하고 재사용성을 높입니다. 파일 마지막에서는 이 클래스의 인스턴스를 생성하여 `module.exports`로 내보냅니다.

```javascript
class AuthController {
  // ... controller methods
}

module.exports = new AuthController();
```

### 주요 메서드

1.  **`register` (회원가입)**
    *   **요청**: `POST /api/auth/register`
    *   **동작**: 클라이언트가 보낸 요청의 `body` (사용자 정보)를 `AuthService.register` 메서드로 전달하여 회원가입 로직을 수행합니다.
    *   **응답**: 성공 시, 생성된 사용자 정보를 담아 `201` (Created) 상태 코드와 함께 응답합니다.

2.  **`login` (로그인)**
    *   **요청**: `POST /api/auth/login`
    *   **동작**: 요청 `body`에서 `email`과 `password`를 추출하여 `AuthService.login` 메서드를 호출합니다.
    *   **응답**: 성공 시, 로그인 결과(예: JWT 토큰, 사용자 정보)를 `200` (OK) 상태 코드로 응답합니다.

3.  **`resetPassword` (비밀번호 재설정)**
    *   **요청**: `POST /api/auth/reset-password` (추정)
    *   **동작**: 요청 `body`에서 `email`을 추출하여 `AuthService.resetPassword` 메서드를 호출합니다.
    *   **응답**: 성공 시, 비밀번호 재설정 처리 결과를 응답합니다.

## 3. 핵심 기술 및 패턴

-   **`asyncHandler` 유틸리티**
    모든 컨트롤러 메서드는 `asyncHandler`로 감싸여 있습니다. 이는 비동기 함수 내에서 발생하는 예외(error)를 자동으로 감지하여 중앙 에러 핸들러(`errorHandler.js`)로 전달하는 역할을 합니다. 이를 통해 각 메서드마다 `try...catch` 구문을 반복적으로 작성하지 않아도 됩니다.

    ```javascript
    register = asyncHandler(async (req, res) => {
      // ... async logic
    });
    ```

-   **`sendSuccess` 유틸리티**
    `responseHandler.js`에서 가져온 `sendSuccess` 함수를 사용하여 성공 응답을 표준화된 형식으로 보냅니다. 이를 통해 코드 중복을 줄이고 응답 형식을 일관되게 유지할 수 있습니다.

## 4. 다른 파일과의 상호작용

-   **`../services/auth.service.js`**: 이 컨트롤러의 가장 중요한 의존성입니다. 실제 비즈니스 로직 처리를 위해 `AuthService`의 메서드(`register`, `login` 등)를 호출합니다. 이로써 **관심사 분리(Separation of Concerns)** 원칙을 지킵니다.
-   **`../utils/asyncHandler.js`**: 비동기 에러 처리를 위해 모든 컨트롤러 메서드를 감싸는 래퍼(wrapper) 함수를 가져옵니다.
-   **`../utils/responseHandler.js`**: 성공적인 HTTP 응답을 보내기 위해 `sendSuccess` 함수를 가져옵니다.
-   **`../routes/authRoutes.js` (암시적)**: 이 컨트롤러에서 정의된 메서드들은 `authRoutes.js` 파일에서 각 API 엔드포인트(예: `/register`, `/login`)와 매핑되어 사용됩니다.
