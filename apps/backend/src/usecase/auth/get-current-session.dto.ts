export type GetCurrentSessionInput = {
  token: string | undefined;
};

export type GetCurrentSessionOutput =
  | { authenticated: false }
  | {
      authenticated: true;
      user: { id: string; name: string; email: string; isAdmin: boolean };
    };
