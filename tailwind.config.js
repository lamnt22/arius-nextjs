module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': "#40916c",
        'dark-green': "#8DC11E",
        'light': "#FFFFFF",
        'light-white': "rgba(255,255,255,0.18)",
        'arius-green': "#2b9348",
        'light-green': "#55a630",
        'light-blue': "#52b69a",
        'arius-red': "#df2935",
        'light-red': "#ff686b",

        'insight-green': "#40916c",
      }
    },
  },
  plugins: [],
};
