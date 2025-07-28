export default function normalizeHtml(html){
  if (!html || html === "<p><br></p>") return "";
  return html
    .replace(/\s+/g, " ")
    .replace(/<p><br><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/style="[^"]*"/g, (match) => match.replace(/\s+/g, ' '))
    .trim();
};
