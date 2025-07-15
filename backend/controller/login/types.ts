type loginErrorCode = 'NO_ERROR' | 'USER_DOES_NOT_EXIST' | 'INVALID_ACCESS'

interface login {
    pass:string,
    email:string,
}

export type {
    loginErrorCode,
    login
}