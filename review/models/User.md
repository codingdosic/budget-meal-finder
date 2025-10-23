# `models/User.js` 파일 분석

## 1. 파일의 역할

`models/User.js` 파일은 MongoDB의 `users` 컬렉션에 대한 **데이터 구조를 정의**하는 **Mongoose 스키마(Schema) 및 모델(Model)**입니다. 이 파일은 사용자 문서가 어떤 필드를 가져야 하는지, 각 필드의 데이터 타입과 제약 조건(예: 필수, 고유값)은 무엇인지를 명시합니다.

또한, 비밀번호 암호화와 같은 데이터 처리 로직을 스키마 수준에서 구현하여 데이터의 일관성과 보안을 보장하는 중요한 역할을 합니다.

## 2. 주요 로직 및 구조

### `userSchema` (사용자 스키마 정의)
`mongoose.Schema`를 사용하여 사용자 데이터의 구조를 정의합니다.

-   **`username`**: `String` 타입, 필수(`required`), 고유(`unique`) 값이어야 합니다.
-   **`email`**: `String` 타입, 필수, 고유 값이어야 합니다.
-   **`password`**: `String` 타입, 필수 값입니다. 이 필드에는 암호화된 해시(hash) 값이 저장됩니다.
-   **`menus`, `recommendedMenus`, `disrecommendedMenus`**: 사용자와 메뉴 간의 관계를 정의하는 필드입니다.
    -   `type: mongoose.Schema.Types.ObjectId`: 다른 문서의 ID를 저장합니다.
    -   `ref: 'Menu'`: `Menu` 모델을 참조하며, 이를 통해 Mongoose의 `populate` 기능을 사용하여 관련 메뉴 정보를 쉽게 가져올 수 있습니다.

### `userSchema.pre('save', ...)` (Mongoose 미들웨어 - Pre-save Hook)
이 코드는 사용자 문서가 데이터베이스에 `save` 되기 **직전**에 실행되는 미들웨어(훅)입니다. 주로 비밀번호 암호화에 사용됩니다.

-   **로직 흐름**:
    1.  `if (!this.isModified('password'))`: 사용자 정보 수정 시, **비밀번호 필드가 변경되었을 때만** 암호화 로직을 실행하도록 합니다. 이메일 변경 등 다른 필드만 수정될 때는 불필요한 재암호화를 방지하여 효율성을 높입니다.
    2.  `bcrypt.genSalt(10)`: `bcrypt` 라이브러리를 사용하여 '솔트(salt)'를 생성합니다. 솔트는 암호화의 보안을 강화하는 랜덤 문자열입니다.
    3.  `bcrypt.hash(this.password, salt)`: 생성된 솔트를 이용해 사용자의 평문 비밀번호를 해싱(hashing)하여 암호화합니다.
    4.  `this.password = ...`: 암호화된 해시 값을 `password` 필드에 덮어씁니다.
    5.  `next()`: 다음 미들웨어나 실제 저장 로직으로 제어를 넘깁니다.

### `userSchema.methods.comparePassword` (인스턴스 메서드)
`userSchema`에 `comparePassword`라는 커스텀 메서드를 추가합니다. 이 메서드는 `User` 모델의 모든 인스턴스(개별 사용자 문서)에서 호출할 수 있습니다.

-   **역할**: 로그인 시, 사용자가 입력한 평문 비밀번호와 데이터베이스에 저장된 해시 값을 안전하게 비교합니다.
-   **동작**: `bcrypt.compare()` 함수를 사용하여 비교하며, 일치하면 `true`, 아니면 `false`를 반환합니다.
-   **사용처**: 주로 `auth.service.js`의 로그인 로직에서 사용자의 비밀번호를 검증할 때 호출됩니다.

### `mongoose.model('User', userSchema)`
정의된 `userSchema`를 기반으로 `User`라는 Mongoose 모델을 생성하고 내보냅니다. 이 모델은 데이터베이스의 `users` 컬렉션과 상호작용(CRUD)하는 인터페이스 역할을 합니다.

## 3. 다른 파일과의 상호작용

-   **`../repositories/user.repository.js` (암시적)**: `UserRepository`는 이 `User` 모델을 임포트하여 `find`, `create`, `update` 등 데이터베이스 작업을 수행합니다.
-   **`../models/Menu.js` (암시적)**: 스키마 내에서 `Menu` 모델을 참조(`ref`)하여 `User`와 `Menu` 간의 관계를 설정합니다.
-   **`../services/auth.service.js` (간접적)**: `auth.service`가 `user.repository`를 통해 사용자를 생성하면, 이 모델의 `pre('save')` 훅이 자동으로 실행되어 비밀번호를 암호화합니다. 또한, 로그인 시 `comparePassword` 메서드를 통해 비밀번호를 검증할 수 있습니다.
