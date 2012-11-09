// Check processing files with unicode chars
// 2012-11-09

ESTest.assertFalse ('Unicode characters', function() {
	
	var file = new File(ESTest.getPath().absoluteURI + 
		File.encode('/В чащах юга жил бы цитрус %20.pdf'));
	
	if (!file.exists) return 'Dont exists file "' + file.fsName + '"';
	 
	var pdfInfo = PdfInfo(file);
	
	if (!pdfInfo.length || pdfInfo.toSource() !=	
		'[({cropBox:[0, 130, 170, 0], bleedBox:[27, 121, 134, 18], ' +
		'trimBox:[30, 120, 130, 20], artBox:[0, 130, 170, 0]})]')
		
		return 'Unable to process files with names containing the '+ 
			'name of the Unicode character';
});
