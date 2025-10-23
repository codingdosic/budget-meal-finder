# `backend/services/auth.service.js` 파일 분석

## 1. 파일의 역할

`auth.service.js`는 사용자 인증과 관련된 **핵심 비즈니스 로직**을 담당하는 **서비스 계층(Service Layer)** 파일입니다. 컨트롤러로부터 받은 데이터를 기반으로 실제적인 작업을 수행하며, 데이터베이스와의 직접적인 상호작용은 리포지토리 계층(`UserRepository`)에 위임합니다.

주요 책임은 다음과 같습니다:
-   회원가입 시 사용자 데이터 유효성 검사 및 생성
-   로그인 시 자격 증명(credential) 확인 및 인증 토큰(JWT) 발급
-   비밀번호 재설정 로직 처리

## 2. 주요 로직 및 구조

### `AuthService` 클래스
인증 관련 비즈니스 로직 메서드들을 `AuthService` 클래스 안에 그룹화하여 관리합니다. 이 클래스의 인스턴스가 `module.exports`를 통해 외부(주로 `AuthController`)에서 사용됩니다.

### 주요 메서드

1.  **`register(userData)` (회원가입 로직)**
    *   **입력**: `username`, `email`, `password`가 포함된 `userData` 객체.
    *   **로직**:
        1.  `UserRepository.findUserByEmail`을 호출하여 이미 동일한 이메일로 가입한 사용자가 있는지 확인합니다.
        2.  만약 사용자가 존재하면, `409` (Conflict) 상태 코드를 가진 `ApiError`를 발생시켜 중복 가입을 방지합니다.
        3.  사용자가 없으면, `UserRepository.createUser`를 호출하여 새로운 사용자를 데이터베이스에 생성합니다. (실제 비밀번호 암호화는 모델 또는 리포지토리 계층에서 처리될 가능성이 높습니다.)
    *   **출력**: 생성된 사용자의 `id`, `username`, `email`을 담은 객체를 반환합니다. (비밀번호는 제외)

2.  **`login(email, password)` (로그인 로직)**
    *   **입력**: `email`과 `password`.
    *   **로직**:
        1.  `UserRepository.findUserByEmail`로 사용자를 조회합니다. 사용자가 없으면 `401` (Unauthorized) 에러를 발생시킵니다.
        2.  `bcrypt.compare`를 사용하여 클라이언트가 제출한 `password`와 데이터베이스에 저장된 해시된 `user.password`를 비교합니다.
        3.  비밀번호가 일치하지 않으면 `401` 에러를 발생시킵니다.
        4.  인증에 성공하면, `jwt.sign`을 사용하여 **JWT(JSON Web Token)**를 생성합니다. 토큰에는 `userId`와 `username`이 포함되며, `JWT_SECRET` 환경 변수로 서명되고 1시간의 유효기간을 가집니다.
    *   **출력**: 생성된 `token`과 `username`을 담은 객체를 반환합니다.

3.  **`resetPassword(email)` (비밀번호 재설정 로직)**
    *   **입력**: `email`.
    *   **로직**:
        1.  `UserRepository.findUserByEmail`로 사용자를 조회합니다. 사용자가 없으면 `404` (Not Found) 에러를 발생시킵니다.
        2.  `Math.random()`을 이용해 임시 비밀번호를 생성합니다.
        3.  `UserRepository.updateUserPassword`를 호출하여 해당 유저의 비밀번호를 임시 비밀번호로 업데이트합니다.
    *   **출력**: 생성된 `tempPassword`를 담은 객체를 반환합니다.
    *   **참고**: 실제 서비스라면 임시 비밀번호를 API 응답으로 직접 보내는 대신, 이메일 등으로 사용자에게 전송하는 것이 보안상 안전합니다.

## 3. 핵심 기술 및 패턴

-   **계층형 아키텍처 (Layered Architecture)**: 컨트롤러 - 서비스 - 리포지토리로 이어지는 계층 구조를 명확하게 보여줍니다. 서비스 계층은 비즈니스 로직에만 집중하고, 데이터 접근은 리포지토리에게, HTTP 처리는 컨트롤러에게 위임합니다.
-   **비밀번호 암호화 (`bcrypt`)**: `bcrypt` 라이브러리를 사용하여 비밀번호를 안전하게 해싱하고 비교합니다. 이를 통해 원본 비밀번호가 데이터베이스에 저장되지 않도록 합니다.
-   **토큰 기반 인증 (`jsonwebtoken`)**: JWT를 생성하여 상태 비저장(stateless) 인증을 구현합니다. 로그인 성공 후 발급된 토큰은 클라이언트가 API 요청 시마다 헤더에 담아 보내 인증을 유지합니다.
-   **사용자 정의 에러 (`ApiError`)**: 특정 상황(예: 중복 이메일, 잘못된 비밀번호)에 맞는 HTTP 상태 코드와 메시지를 가진 에러를 생성하여, 중앙 에러 핸들러가 일관되게 처리할 수 있도록 합니다.

## 4. 다른 파일과의 상호작용

-   **`../repositories/user.repository.js`**: 사용자 데이터에 접근하기 위해 `UserRepository`의 메서드들(`findUserByEmail`, `createUser` 등)을 호출합니다.
-   **`../errors/ApiError.js`**: 비즈니스 로직 상에서 발생하는 특정 에러 상황을 처리하기 위해 이 커스텀 에러 클래스를 사용합니다.
-   **`../controllers/auth.controller.js` (암시적)**: 이 서비스의 메서드들은 `AuthController`에 의해 호출되어 사용됩니다.
-   **`.env` (암시적)**: JWT 서명에 필요한 `process.env.JWT_SECRET` 값을 사용합니다.
