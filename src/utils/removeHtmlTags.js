export const removeHtmlTags =(text)=> {
    if (typeof text !== 'string') {
      return '';
    }
    return text.replace(/<[^>]+>/g, '');
  }