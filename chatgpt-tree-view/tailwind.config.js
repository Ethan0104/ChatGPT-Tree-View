module.exports = {
    content: [
        './src/libs/*.{js,jsx,ts,tsx}',
        './src/libs/elements/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    primary: '#3FCF8E',
                    blockBackground: '#1c1c1c',
                    textChunkBackground: '#212121',
                    shadow: '#101010',
                },
            },
        },
    },
    plugins: [],
}
