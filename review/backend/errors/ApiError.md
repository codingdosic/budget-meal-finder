# `backend/errors/ApiError.js` 파일 분석

## 1. 파일의 역할

`ApiError.js` 파일은 애플리케이션 내에서 발생하는 **사용자 정의 에러(Custom Error)**를 정의합니다. Node.js의 내장 `Error` 클래스를 확장하여, HTTP 상태 코드와 메시지를 포함하는 특정 에러 객체를 생성할 수 있도록 합니다. 이는 API 응답에서 일관된 에러 형식을 제공하고, 에러 처리를 중앙 집중화하는 데 도움을 줍니다.

## 2. 주요 로직 및 구조

### `ApiError` 클래스

`ApiError` 클래스는 `Error` 클래스를 상속받습니다. 이는 `ApiError` 인스턴스가 일반적인 JavaScript 에러 객체의 모든 속성(예: `name`, `message`, `stack`)을 가지면서, 추가적으로 `statusCode`와 `data` 속성을 가질 수 있도록 합니다.

-   **생성자 (`constructor(statusCode, message, isOperational = true, stack = '', data = null)`)**:
    -   `statusCode`: HTTP 응답으로 보낼 상태 코드 (예: 400, 401, 404, 500).
    -   `message`: 사용자에게 보여줄 에러 메시지.
    -   `isOperational`: 이 에러가 개발자가 의도한(예측 가능한) 에러인지 여부를 나타내는 플래그. 기본값은 `true`입니다. (예: 유효성 검사 실패, 인증 실패 등)
    -   `stack`: 에러 스택 트레이스. 개발 환경에서 디버깅에 유용합니다. `Error.captureStackTrace`를 사용하여 현재 스택을 캡처합니다.
    -   `data`: 에러와 관련된 추가 데이터를 포함할 수 있는 필드. (예: 유효성 검사 실패 시 어떤 필드가 실패했는지에 대한 정보)

-   **`super(message)`**: 부모 클래스인 `Error`의 생성자를 호출하여 `message` 속성을 초기화합니다.
-   **`this.statusCode = statusCode;`**: HTTP 상태 코드를 저장합니다.
-   **`this.isOperational = isOperational;`**: 에러의 운영 상태를 저장합니다.
-   **`this.data = data;`**: 추가 데이터를 저장합니다.
-   **`Error.captureStackTrace(this, this.constructor);`**: 에러가 발생한 지점의 스택 트레이스를 캡처하여 `this.stack`에 할당합니다. 이는 에러의 출처를 추적하는 데 매우 유용합니다.

## 3. 핵심 기술 및 패턴

-   **커스텀 에러 클래스**: Node.js의 `Error` 객체를 확장하여 애플리케이션 특유의 에러를 정의하는 패턴입니다. 이를 통해 에러 객체에 추가적인 정보를 담을 수 있습니다.
-   **일관된 에러 처리**: `ApiError`를 사용함으로써 애플리케이션의 모든 에러가 `statusCode`와 `message`를 가지게 되어, 중앙 에러 핸들러(`errorHandler.js`)에서 일관된 방식으로 에러를 처리하고 클라이언트에게 응답할 수 있습니다.
-   **스택 트레이스 캡처**: `Error.captureStackTrace`를 사용하여 에러 발생 지점을 정확히 파악할 수 있어 디버깅 효율을 높입니다.

## 4. 다른 파일과의 상호작용

-   **`backend/middleware/errorHandler.js`**: 중앙 에러 핸들러는 `ApiError` 인스턴스를 감지하고, `statusCode`와 `message`를 사용하여 클라이언트에게 적절한 HTTP 응답을 보냅니다.
-   **`backend/services/*.js` 및 `backend/controllers/*.js`**: 비즈니스 로직이나 요청 처리 과정에서 특정 조건(예: 유효하지 않은 입력, 리소스 없음, 인증 실패)이 충족되지 않을 때 `new ApiError(...)`를 사용하여 에러를 발생시킵니다. 이 에러는 `asyncHandler`를 통해 `errorHandler`로 전달됩니다.
