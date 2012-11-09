// ESTest.jsx
// Testing engine for ExtendScript

/*
Copyright: Konstantin Smorodsky
License:   MIT

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to 
deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
*/

// 2012-11-08

var ESTest = {};
ESTest.this = this;
ESTest.result = '';


ESTest.runAllTests = function (/* optional */ filePrefix, testsFolder) {
	
	ESTest.startTime = new Date();
	
	// save global names
	var globals = '\nScriptLanguage\n';
	
	for (var i in ESTest.this) globals += i + '\n';
	
	// seek tests
	if (!filePrefix) filePrefix = 'test_';
	
	if (!testsFolder) testsFolder = ESTest.getPath();
	
	var files = testsFolder.getFiles();
	filePrefix = filePrefix.toUpperCase();
	
	// call tests
	for (var i = files.length; i--; ) {
		
		var file = files[i], name = File.decode(file.name);
		
		if (!(file instanceof File) ||
			name.toUpperCase().indexOf(filePrefix) != 0) 
			
			continue;
		
		try {
			app.doScript(file);
		}
		catch (e) {
			ESTest.result += '\nError in File ' + name + ': ' + 
				e.message + ' (Line: ' + e.line + ')';
		}
	}
	
	// check globals
	var newGlobals = [];
	
	for (var i in ESTest.this) {
		
		if (globals.indexOf('\n' + i + '\n') < 0) {
			
			newGlobals.push(i);
		}
	}

	if (newGlobals.length) {
		
		ESTest.result += '\n\nDuring start tests have been added to the global variables:\n' + 
			newGlobals.join('n');
	}
	ESTest.endTime = new Date();
}


ESTest.assertFalse = function (title, fun) {
	
	ESTest.result += '\n' + title + ': ';
	
	try {
		
		var rc = fun();
		ESTest.result += rc ? 'Fail. ' + rc : 'OK';
		
	} catch (e) {
		ESTest.result += 'Fail. ' + e.message + ' (' + e.fileName + ' Line: ' + e.line + ')';
	}
}

// show alert with test results
ESTest.alert = function () {
	
	alert(ESTest.result);
}

// create new document with test tesults
ESTest.print = function() {
	
	// add time label
	ESTest.result += '\n\nTests started: ' + ESTest.startTime;
	ESTest.result += '\nTests ended: ' + ESTest.endTime;
	ESTest.result += '\nTime: ' + (ESTest.endTime.getTime() - 
		ESTest.startTime.getTime())/ 1000 + 'c';
	
	// make report
	var doc = app.documents.add();
	var page = doc.pages[0];
	var textFrame = page.textFrames.add();
	
	var ArrageTF = function () {
		
		var mp = page.marginPreferences;
		var leftSide = page.side == PageSideOptions.leftHand;
		
		textFrame.geometricBounds = [
			page.bounds[0] + mp.top, 
			page.bounds[1] + (leftSide ? mp.right : mp.left), 
			page.bounds[2] - mp.bottom, 
			page.bounds[3] - (leftSide ? mp.left : mp.right)
		];
	};
	ArrageTF();
	textFrame.insertionPoints.item(-1).contents = ESTest.result;
	
	while (textFrame.contents.length && textFrame.overflows) {
		page = doc.pages.add();
		var newTF = page.textFrames.add();
		newTF.previousTextFrame = textFrame;
		textFrame = newTF;
		ArrageTF();
	}
}

// return Folder object with reference this script folder
ESTest.getPath = function () {
	try {
		
		return app.activeScript.parent;
	} 
	catch (e) {
		
		return new File(e.fileName).parent;
	}
}