# `backend/routes/authRoutes.js` 파일 분석

## 1. 파일의 역할

`authRoutes.js` 파일은 Express의 `Router`를 사용하여 **사용자 인증 관련 API 엔드포인트(경로)를 정의**하는 **라우터(Router)** 파일입니다. 이 파일은 특정 URL 경로와 HTTP 메서드(예: `POST /register`)를 해당 요청을 처리할 컨트롤러 메서드(`AuthController.register`)와 연결하는 역할을 합니다.

쉽게 말해, 클라이언트의 인증 관련 요청이 들어왔을 때, 그 요청을 어떤 함수가 처리해야 하는지를 알려주는 **교통 안내판**과 같습니다.

## 2. 주요 로직 및 구조

### Express 라우터 설정
`const router = express.Router();` 코드를 통해 새로운 라우터 객체를 생성합니다. 이 라우터는 모듈화되어 `server.js`에서 `app.use('/api/auth', ...)` 형태로 사용됩니다. 따라서 이 파일에 정의된 모든 경로는 ` /api/auth` 라는 접두사(prefix)를 갖게 됩니다.

### 라우트 정의

1.  **회원가입 API (`POST /api/auth/register`)**
    ```javascript
    router.post('/register', registerValidator, AuthController.register);
    ```
    *   **경로 및 메서드**: `/register` 경로에 대한 `POST` 요청을 처리합니다.
    *   **실행 순서**:
        1.  **`registerValidator` (미들웨어)**: 요청이 컨트롤러에 도달하기 전에 먼저 실행됩니다. 이 미들웨어는 클라이언트가 보낸 데이터(예: 이메일 형식, 비밀번호 길이)의 유효성을 검사합니다. 유효성 검사에 실패하면 여기서 요청이 중단되고 에러 응답이 전송됩니다.
        2.  **`AuthController.register` (컨트롤러)**: 유효성 검사를 통과하면, `AuthController`의 `register` 메서드가 호출되어 실제 회원가입 로직을 수행합니다.

2.  **로그인 API (`POST /api/auth/login`)**
    ```javascript
    router.post('/login', loginValidator, AuthController.login);
    ```
    *   **경로 및 메서드**: `/login` 경로에 대한 `POST` 요청을 처리합니다.
    *   **실행 순서**:
        1.  **`loginValidator` (미들웨어)**: 로그인에 필요한 `email`, `password` 필드가 제대로 들어왔는지 검증합니다.
        2.  **`AuthController.login` (컨트롤러)**: 검증 통과 후, `AuthController`의 `login` 메서드가 호출되어 로그인 로직을 처리합니다.

3.  **비밀번호 재설정 API (`POST /api/auth/reset-password`)**
    ```javascript
    router.post('/reset-password', AuthController.resetPassword);
    ```
    *   **경로 및 메서드**: `/reset-password` 경로에 대한 `POST` 요청을 처리합니다.
    *   **실행 순서**: 별도의 유효성 검사 미들웨어 없이 바로 `AuthController.resetPassword` 메서드를 호출합니다.

## 3. 핵심 기술 및 패턴

-   **라우팅 모듈화**: `express.Router`를 사용해 기능별(여기서는 `auth`)로 라우트를 분리하여 코드의 구조를 깔끔하게 유지하고 관리를 용이하게 합니다. 이를 **모듈형 라우터 패턴**이라고 합니다.
-   **미들웨어 체이닝 (Middleware Chaining)**: `router.post`의 인자로 여러 함수(`registerValidator`, `AuthController.register`)를 전달하는 것을 볼 수 있습니다. Express는 이 함수들을 순서대로 실행하며, 각 함수는 요청(req), 응답(res) 객체와 다음 미들웨어를 호출하는 `next` 함수에 접근할 수 있습니다. 이를 통해 **유효성 검사**와 같은 공통 관심사를 컨트롤러 로직과 분리할 수 있습니다.

## 4. 다른 파일과의 상호작용

-   **`../controllers/auth.controller.js`**: API 요청을 실제로 처리할 `AuthController`의 메서드들을 임포트하여 각 라우트의 핸들러로 지정합니다.
-   **`../middleware/validators.js`**: `registerValidator`, `loginValidator`와 같은 유효성 검사 미들웨어를 임포트하여 컨트롤러가 실행되기 전에 데이터의 무결성을 보장합니다.
-   **`server.js` (암시적)**: 이 파일에서 `export`한 `router` 객체는 `server.js`에서 `app.use('/api/auth', authRoutes)` 코드를 통해 메인 애플리케이션에 등록됩니다.
