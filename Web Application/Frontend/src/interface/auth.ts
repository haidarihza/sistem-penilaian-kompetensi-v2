interface token {
  token: string,
  scheme: string,
  expires_at: string,
}

export interface AuthData {
  access_token: token,
  refresh_token: token,
  role: string,
}

export interface ProfileData {
  name: string,
  phone: string,
  email?: string
}

export interface UpdatePassword {
  current_password: string,
  new_password: string,
  confirm_password: string,
}