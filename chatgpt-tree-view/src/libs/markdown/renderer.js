// // markdownRenderer.js
// import remark from 'remark';
// import html from 'remark-html';
// import highlight from 'highlight.js';

// const renderMarkdown = (markdown) => {
//   const processor = remark()
//     .use(html, {
//       sanitize: false,
//       handlers: {
//         code: (h, node) => {
//           const value = node.value;
//           const lang = node.lang || '';
//           const highlighted = highlight.highlightAuto(value, [lang]).value;
//           return h(node, 'pre', { className: `hljs ${lang}` }, [
//             h(node, 'code', { className: `hljs ${lang}` }, highlighted),
//           ]);
//         },
//       },
//     });

//   const result = processor.processSync(markdown);
//   return result.toString();
// };

// export { renderMarkdown }
