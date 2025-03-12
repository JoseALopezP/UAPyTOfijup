export const removeHtmlTags = (html) => {
  if (typeof html !== 'string') return '';
  return html
    .replace(/&nbsp;/g, ' ') 
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<[^>]+>/g, '');
};
