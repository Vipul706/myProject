type resetPasswordErrorCodes = "NO_ERROR" | 'SEM_EXPECTION' | 'RP_EXCEPTION'
interface prRequest {
    email: string
}
export type {
    resetPasswordErrorCodes,
    prRequest
}