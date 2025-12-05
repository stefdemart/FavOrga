import { Bookmark } from "./types";

export const exportToJson = (bookmarks: Bookmark[]) => {
  const dataStr = JSON.stringify(bookmarks, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'bookmarks_central_backup.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportToHtml = (bookmarks: Bookmark[]) => {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  // Simple flat export for robustness, preserving folder path in title/tags could be an option
  // but standard requires nested DL/DT. For simplicity here, we export flat list or basic grouping.
  // Let's do a simple flat export grouped by Category if available.

  bookmarks.forEach(b => {
      const date = Math.floor(new Date(b.createdAt).getTime() / 1000);
      html += `    <DT><A HREF="${b.url}" ADD_DATE="${date}" TAGS="${b.category || ''}">${b.title}</A>\n`;
  });

  html += `</DL><p>`;

  const dataUri = 'data:text/html;charset=utf-8,'+ encodeURIComponent(html);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', "bookmarks_export.html");
  linkElement.click();
};
