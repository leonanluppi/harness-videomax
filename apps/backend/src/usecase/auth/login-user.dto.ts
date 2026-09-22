import type { RegisterUserOutput } from "./register-user.dto";

export type LoginUserInput = {
  email: string;
  password: string;
};

// Same public shape as registration: user + one-time session token.
export type LoginUserOutput = RegisterUserOutput;

export { toOutput } from "./register-user.dto";
