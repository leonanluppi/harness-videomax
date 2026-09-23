import type { UserId } from "./user-id.vo";

export type CurrentUserDto = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export interface UserQueries {
  getById(id: UserId): Promise<CurrentUserDto | null>;
}
