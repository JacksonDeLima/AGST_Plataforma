// src/config/endpoints.js

export const endpoints = {
  users: {
    create: "/users",
    activate: "/users/activate",
    resendActivation: "/users/resend-activation",
    login: "/users/login",
    validateToken: "/users/validate-token",
  },
  corporations: {
    list: "/corporations",
    create: "/corporations",
    // usar: `/corporations/${id}`
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
