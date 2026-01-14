// src/config/endpoints.js
export const endpoints = {
  users: {
    create: "/users",
    activate: "/users/activate",
    resendActivation: "/users/resend-activation",
    login: "/users/login",
    validateToken: "/users/validate-token",

    // ✅ Password flows
    forgotPassword: "/users/forgot-password",
    resetPassword: "/users/reset-password",
    changePassword: "/users/me/change-password",
  },

  oauth: {
    authorize: "/oauth/authorize",
    token: "/oauth/token",
  },

  corporations: {
    list: "/corporations",
    create: "/corporations",
    get: (id) => `/corporations/${id}`,
    members: (id) => `/corporations/${id}/members`,
    addMember: (id) => `/corporations/${id}/members`,
    transfer: (id) => `/corporations/${id}`, // PATCH
    remove: (id) => `/corporations/${id}`,   // DELETE
  },

  applications: {
    create: "/applications",
  },

  devices: {
    variables: (id) => `/device/${id}/variables`,
    configs: (id) => `/device/${id}/configs`,
    parameters: (id) => `/device/${id}/parameters`,
    list: "/user/devices",
  },
};
