import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CoverImageState {
  isOpen: boolean;
  url?: string;
}

const initialState: CoverImageState = {
  isOpen: false,
  url: undefined,
};

export const coverImageSlice = createSlice({
  name: "coverImage",
  initialState,
  reducers: {
    onOpen: (state) => {
      state.isOpen = true;
    },
    onClose: (state) => {
      state.isOpen = false;
      state.url = undefined;
    },
    onReplace: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
      state.isOpen = true;
    },
  },
});

export const { onOpen, onClose, onReplace } = coverImageSlice.actions;
export default coverImageSlice.reducer;
