import { configureStore } from "@reduxjs/toolkit";
import coverImageReducer from "./coverImageSlice";

export const store = configureStore({
  reducer: {
    coverImage: coverImageReducer,
  },
});

// Infer types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
