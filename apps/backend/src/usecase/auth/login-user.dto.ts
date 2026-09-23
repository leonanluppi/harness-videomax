export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserOutput = {
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
