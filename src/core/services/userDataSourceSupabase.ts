export const userDataSourceSupabase = {
  async getUserProfile(userId: string): Promise<UserProfile> {
    return { id: userId, name: "Mock User", role: "clinician" };
  },

  async signInWithPassword(): Promise<{ session: { user: { id: string } }; user: { id: string } }> {
    return {
      session: { user: { id: "mock-user-id" } },
      user: { id: "mock-user-id" }
    };
  },

  async signUp(): Promise<{ user: { id: string } }> {
    return { user: { id: "mock-user-id" } };
  }
};

export type UserProfile = {
  id: string;
  name: string;
  role: RoleType;
};

export type RoleType = "admin" | "clinician" | "professional" | "patient";
