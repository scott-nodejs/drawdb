/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      '3xl': {'max': '2047px'},
      '2xl': {'max': '1535px'},
      'xl': {'min': '1024px'},
      'lg': {'max': '1023px'},
      'md': {'max': '820px'},
      'sm': {'max': '639px'}
    },
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            maxWidth: '100%',
            code: {
              color: theme('colors.gray.900'),
              backgroundColor: theme('colors.gray.100'),
              borderRadius: theme('borderRadius.DEFAULT'),
              padding: '2px 4px',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200'),
              borderRadius: theme('borderRadius.lg'),
              padding: theme('spacing.4'),
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: 0,
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            code: {
              color: theme('colors.gray.200'),
              backgroundColor: theme('colors.gray.700'),
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.200'),
            },
          },
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}

