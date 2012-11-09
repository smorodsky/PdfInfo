// Check returned values of page boxes
// 2012-11-08

ESTest.assertFalse ('Page Boxes', function() {
	var file = new File(ESTest.getPath().absoluteURI + '/pageBoxes.pdf');
	
	if (!file.exists) return 'Dont exists file pageBoxes.pdf';
	
	var pdfInfo = PdfInfo(file);
	var boxes = pdfInfo[0];
	
	//prompt('', boxes.toSource());
	
	if (boxes.cropBox.toSource() != '[0, 130, 170, 0]') {		
		
		return 'Incorrect value cropBox. Expected [0, 130, 170, 0], Received ' + 
			boxes.cropBox.toSource();
	}
	if (boxes.bleedBox.toSource() != '[27, 121, 134, 18]') {
		
		return 'Incorrect value bleedBox. Expected [27, 121, 134, 18], Received ' + 
			boxes.bleedBox.toSource();
	}
	if (boxes.trimBox.toSource() != '[30, 120, 130, 20]') {
		
		return 'Incorrect value trimBox. Expected [30, 120, 130, 20], Received ' + 
			boxes.trimBox.toSource();
	}
	if (boxes.artBox.toSource() != '[0, 130, 170, 0]') {
		
		return 'Incorrect value artBox. Expected [0, 130, 170, 0], Received ' + 
			boxes.artBox.toSource();
	}
});
