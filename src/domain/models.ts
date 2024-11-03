export interface CreateUserRequest {
  username: string;
  firstName?: string;
  lastName?: string;
  email: {
    email: string;
    isVerified: boolean;
  };
  password: {
    password: string;
    changeRequired: boolean;
  };
  profile: {
    givenName: string;
    familyName: string;
    nickName?: string;
    displayName: string;
    preferredLanguage: string;
    gender: 'GENDER_MALE' | 'GENDER_FEMALE' | 'GENDER_OTHER';
  };
  
}


export interface ZitadelError {
  code: number;
  message: string;
  details?: unknown;
}

export const errorMessages = {
  3: {
    username: 'Username must be between 1 and 200 characters',
    email: 'Email must be a valid email address',
    password: 'Password must meet the minimum requirements',
  },
} as const;

export interface CreateUserResponse {
  id: string;
}
