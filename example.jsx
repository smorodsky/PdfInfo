// This program is an example of using PdfInfo.jsx

#target indesign
#include "PdfInfo.jsx"

var fileFilter = File.fs == 'Macintosh' ? 
	function(f){return f.name.toUpperCase().substr(-4) == '.PDF';} :
	'*.pdf';

var file = File.openDialog('Choice PDF file', fileFilter);

if (!file) exit();

var pdfInfo = PdfInfo(file);

alert('PdfInfo\nFile: ' + file.fsName + 
	'\nTotal pages: ' + 
	pdfInfo.length + 
	'\nSize of the first page [left, top, right, bottom] (pt):\n' + 
	pdfInfo[0].toSource());
