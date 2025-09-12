interface forgotPassword {
    email:string
}

type forgotPasswordErrorCode = "NO_ERROR" | "FP_EXCEPTION" | 'USER_DOES_NOT_EXIST' | 'MAX_ATTEMPT_REACHED'

export type {
    forgotPassword,
    forgotPasswordErrorCode
}