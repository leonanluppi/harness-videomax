export type GetCurrentSessionInput = {
  /** Plaintext session token read from the request cookie, if any. */
  sessionToken: string | undefined;
};

export type GetCurrentSessionOutput =
  | { authenticated: false }
  | {
      authenticated: true;
      user: {
        id: string;
        name: string;
        email: string;
        isAdmin: boolean;
      };
    };
