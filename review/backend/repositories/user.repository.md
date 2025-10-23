# `backend/repositories/user.repository.js` 파일 분석

## 1. 파일의 역할

`user.repository.js` 파일은 **리포지토리 계층(Repository Layer)**으로, `User` 모델과 관련된 모든 **데이터베이스 상호작용(CRUD)** 을 전담합니다. 서비스 계층(예: `AuthService`)의 요청을 받아, Mongoose를 사용하여 MongoDB의 `users` 컬렉션에 대한 쿼리를 실행합니다.

이 파일의 핵심 목적은 **데이터 접근 로직을 추상화**하고 비즈니스 로직(서비스 계층)으로부터 격리하는 것입니다. 이를 통해 코드의 유지보수성과 테스트 용이성이 향상됩니다.

## 2. 주요 로직 및 구조

### `UserRepository` 클래스
사용자 데이터와 관련된 모든 데이터베이스 접근 메서드들을 `UserRepository` 클래스 안에 그룹화합니다. 이 클래스의 인스턴스가 `module.exports`를 통해 외부에 제공됩니다.

### 주요 메서드 (CRUD 기반)

#### Create (생성)
-   **`createUser(userData)`**: 새로운 사용자 데이터를 받아 `User` 모델의 인스턴스를 생성하고, `user.save()`를 호출하여 데이터베이스에 저장합니다. 이 과정에서 `User` 모델에 정의된 `pre('save')` 훅(비밀번호 암호화)이 자동으로 실행됩니다.

#### Read (조회)
-   **`findUserByEmail(email)`**: 이메일을 기준으로 사용자를 찾습니다 (`User.findOne`).
-   **`findUserById(userId)`**: MongoDB의 고유 ID(`_id`)로 사용자를 찾습니다 (`User.findById`).
-   **`findUserByUsername(username)`**: 사용자 이름으로 사용자를 찾습니다.
-   **`getUserRecommendations(userId)`**: 특정 사용자의 추천/비추천 메뉴 목록(`recommendedMenus`, `disrecommendedMenus`)만 선택적으로 조회합니다 (`select`).

#### Update (수정)
-   **`updateUserPassword(userId, newPassword)`**: 사용자를 ID로 찾은 후, `password` 필드를 새로운 값으로 변경하고 `user.save()`를 호출합니다. `save`를 사용함으로써 `pre('save')` 훅이 다시 실행되어 새 비밀번호가 암호화됩니다.
-   **`updateUserEmail(userId, newEmail)`**: `User.findByIdAndUpdate`를 사용하여 특정 사용자의 이메일을 업데이트합니다. `{ new: true }` 옵션은 업데이트된 후의 문서를 반환하도록 합니다.
-   **`addMenuToUser`, `removeMenuFromUser`**: 사용자의 `menus` 배열에 메뉴 ID를 추가하거나 제거합니다. 중복 추가를 방지하기 위해 `$addToSet` 연산자를 사용하는 것이 특징입니다.
-   **`addRecommendedMenuToUser`, `addDisrecommendedMenuToUser`**: 메뉴를 추천/비추천 목록에 추가하는 로직입니다. 한 메뉴가 추천과 비추천 목록에 동시에 존재할 수 없도록, 한쪽에 추가(`$addToSet`)하면서 다른 쪽에서는 제거(`$pull`)하는 복합적인 업데이트를 수행합니다.

#### Delete (삭제)
-   **`deleteUser(userId)`**: `User.findByIdAndDelete`를 사용하여 특정 사용자를 데이터베이스에서 삭제합니다.

## 3. 핵심 기술 및 패턴

-   **리포지토리 패턴 (Repository Pattern)**: 이 파일 전체가 리포지토리 패턴의 구현체입니다. 비즈니스 로직(서비스)과 데이터 접근 로직(리포지토리)을 명확하게 분리하여, 서비스 계층은 "어떻게" 데이터를 가져오는지 알 필요 없이 "무엇을" 원하는지만 리포지토리에 요청하게 됩니다.
-   **Mongoose 쿼리**: `findOne`, `findById`, `findByIdAndUpdate`, `save` 등 Mongoose 모델이 제공하는 다양한 메서드를 사용하여 데이터베이스와 상호작용합니다.
-   **MongoDB 업데이트 연산자**: `$addToSet`, `$pull`과 같은 MongoDB의 원자적(atomic) 연산자를 사용하여 배열 필드를 효율적이고 안전하게 수정합니다.

## 4. 다른 파일과의 상호작용

-   **`../../models/User.js`**: 리포지토리의 가장 핵심적인 의존성입니다. `User` 모델을 직접 임포트하여 데이터베이스 쿼리를 실행합니다.
-   **`../services/*.js` (암시적)**: `AuthService`나 `UserService`와 같은 서비스 계층 파일들이 이 `UserRepository`를 임포트하여 사용자 데이터 관련 작업을 위임합니다. 예를 들어, `AuthService`는 `createUser`, `findUserByEmail` 등의 메서드를 사용합니다.
-   **`../errors/ApiError.js` (잠재적 의존성)**: `updateUserPassword` 메서드 내에서 `ApiError`를 사용하려 하지만, 파일 상단에 `require` 구문이 누락되어 있어 그대로 실행하면 에러가 발생할 수 있습니다. 이는 코드의 잠재적인 버그 또는 불완전한 부분을 시사합니다.
