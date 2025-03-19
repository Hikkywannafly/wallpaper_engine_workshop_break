export interface Alert {
    id: string
    message: string
    type: 'error' | 'success'
}

export interface Account {
    username: string
    displayName?: string
    password: string
}