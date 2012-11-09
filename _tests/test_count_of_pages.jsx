// Check count of pages form testing file
// 2012-11-08

ESTest.assertFalse ('Count Pages', function() {
	var file = new File(ESTest.getPath().absoluteURI + '/pageCount.pdf');
	
	if (!file.exists) return 'Dont exists file pageCount.pdf';
	
	var pdfInfo = PdfInfo(file);
	
	if (pdfInfo.length != 20) return 'Incorrect value (' + pdfInfo.length + ')';
});
