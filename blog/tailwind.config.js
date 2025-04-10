/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", // Required for next-themes to work correctly
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // Ensures Tailwind works in src folder
      "./components/**/*.{js,ts,jsx,tsx}", // Includes components folder
      "./app/**/*.{js,ts,jsx,tsx}", // Includes app directory (if using app router)
      "node_modules/@shadcn/ui/dist/**/*.{js,ts,jsx,tsx}", // Enables Tailwind for ShadCN UI components
      "./style.css"
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  