// import { createSlice } from "@reduxjs/toolkit";

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: null,
//     tokens: null,
//   },
//   reducers: {
//     loginSuccess: (state, action) => {
//       state.user = action.payload.user;
//       state.tokens = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.tokens = null;
//     },
//     refreshTokenAction: (state, action) => {
//       if (state.tokens) {
//         state.tokens.access = action.payload;
//       }
//     },
//   },
// });

// export const { loginSuccess, logout, refreshTokenAction } = authSlice.actions;
// export default authSlice.reducer;



import { createSlice } from "@reduxjs/toolkit";

const storedTokens = JSON.parse(localStorage.getItem("tokens"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    tokens: storedTokens || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload; // Store tokens
      localStorage.setItem("tokens", JSON.stringify(action.payload)); // Save tokens in localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user)); // Save user data
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      localStorage.removeItem("tokens"); // Remove from storage
      localStorage.removeItem("user");
    },
    refreshTokenAction: (state, action) => {
      if (state.tokens) {
        state.tokens.access = action.payload;
        localStorage.setItem(
          "tokens",
          JSON.stringify({ ...state.tokens, access: action.payload })
        ); // Update stored token
      }
    },
  },
});

export const { loginSuccess, logout, refreshTokenAction } = authSlice.actions;
export default authSlice.reducer;
