export type LogoutUserInput = {
  /** Plaintext session token read from the request cookie, if any. */
  sessionToken: string | undefined;
};

export type LogoutUserOutput = {
  success: true;
};
