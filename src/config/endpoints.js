// src/config/endpoints.js
export const endpoints = {
  users: {
    create: "/users",
    activate: "/users/activate",
    resendActivation: "/users/resend-activation",
    login: "/users/login",
    validateToken: "/users/validate-token",
  },

  // ✅ OAuth (conforme doc)
  oauth: {
    authorize: "/oauth/authorize",
    token: "/oauth/token", // GET (refresh) e também pode existir POST no backend, mas no SPA usamos GET redirect
  },

  corporations: {
    list: "/corporations",
    create: "/corporations",
    details: (id) => `/corporations/${id}`,
    members: (id) => `/corporations/${id}/members`,
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
