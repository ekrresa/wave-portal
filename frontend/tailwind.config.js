module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'bright-purple': '#f6f7ff',
        'dark-purple': '#232946',
        'dark-purple2': '#353d62',
        'dark-purple3': '#574b90',
        'light-ray': '#fffffe',
        'blue-choo': '#b8c1ec',
        'light-beige': '#eebbc3',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
