export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(100 116 139) transparent",
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        ".scrollbar-thin::-webkit-scrollbar-track": {
          background: "transparent",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          backgroundColor: "rgb(100 116 139)",
          borderRadius: "20px",
          border: "2px solid transparent",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgb(71 85 105)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
