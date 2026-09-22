export type GeneratedSessionToken = {
  token: string;
  tokenHash: string;
};

export interface SessionTokenGateway {
  generate(): GeneratedSessionToken;
  hash(token: string): string;
}
