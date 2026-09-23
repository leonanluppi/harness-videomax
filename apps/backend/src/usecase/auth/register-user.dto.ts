export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
  /** Plaintext session token — for cookie-setting only, never serialized as-is in a JSON body. */
  sessionToken: string;
  sessionExpiresAt: string;
};
