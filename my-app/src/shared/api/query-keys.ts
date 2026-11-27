
export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },

  issues: {
    all: ["issues"],

    detail: (id: string) =>
      ["issues", "detail", id],
  },

  projects: {
    all: ["projects"],
  },
};
