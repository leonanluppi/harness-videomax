export type CurrentUserView = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export interface UserQueries {
  currentUserById(id: string): Promise<CurrentUserView | null>;
}
