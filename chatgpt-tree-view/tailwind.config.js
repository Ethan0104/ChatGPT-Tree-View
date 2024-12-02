module.exports = {
    prefix: 'tree-',
    content: [
        './src/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    primary: '#30D5C8',
                    blockBackground: '#1c1c1c',
                    textChunkBackground: '#212121',
                    shadow: '#101010',
                    buttonHover: 'rgba(47, 47, 47, 0.5)',
                    arrowColor: '#f7f7f7'
                },
            },
        },
    },
    plugins: [],
}
