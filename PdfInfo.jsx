/*
PdfInfo.jsx

This module is used to read the extended file information about PDF. 
Typical use in ExtendScript for InDesign. In any case, need to have 
installed Acrobat Pro. Tested on Mac and Windows. 

The module contains a single function "PdfInfo". If successful, it 
returns an array with the number of elements by appropriate number 
of pages in the PDF. Each element has information about the size of 
page boxes measured in points.

Returned array:

[
	{                                 // - beginning info of the page 0
	
		cropBox:  [ 0, 130, 170,  0], // - box values:
		bleedBox: [27, 121, 134, 18], // left, top, right, bottom
		trimBox:  [30, 120, 130, 20], // in points,
		artBox:   [ 0, 130, 170,  0]  // measured at the lower left corner
		
	},                                // - end page 0
	{                                 // - beginning info of the page 1
.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
	}                                 // - end last page	
]

****************************************************************************

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

****************************************************************************

*/
// 2012-11-09

var PdfInfo = function (file) {
	
	if (!file.exists) throw 'File not found';
	
	// call win or mac version systems script
	var rc = PdfInfo[File.fs](file);
	
	if (!rc) throw 'Can not read file ' + file.fsName;
	
	// convert regional nums & split pages
	var pages = rc.replace(/,/g, '.').split(/[\n\r]/g);
	
	// parse numeric values
	var GetBox = function (n) {
		var box = boxes[n].split(' ');
		
		for (var i = box.length; i--; ) {
			
			box[i] = parseFloat(box[i]);
		}
		return box;
	}
	
	for (var i = pages.length; i--; ) {
		
		var boxes = pages[i].split('\t');
		
		pages[i] = {
			cropBox:  GetBox(0),
			bleedBox: GetBox(1),
			trimBox:  GetBox(2),
			artBox:   GetBox(3)
		};
	}

	return pages;
}

PdfInfo.Macintosh = function (file) {
	var scpt = '\
set theFile to POSIX file "' + file.fsName + '"\
\
-- seek document\
on GetDoc(fname)\
	tell application id "com.adobe.Acrobat.Pro"\
		repeat with doc in documents\
			if file alias of doc as text = fname then\
				return doc\
			end if\
		end repeat\
	end tell\
	return null\
end GetDoc\
\
set ExistsDoc to GetDoc(theFile as text)\
\
tell application id "com.adobe.Acrobat.Pro"\
	\
	if ExistsDoc = null then\
		\
		open theFile with invisible\
		tell me to set doc to GetDoc(theFile as text)\
		\
		if doc = null then return\
	else\
		set doc to ExistsDoc\
	end if\
	\
	set rc to ""\
	set AppleScript\'s text item delimiters to " "\
	\
	repeat with pge in pages of doc\
		\
		if length of rc > 0 then set rc to rc & return\
		\
		set rc to rc & (crop box of pge as text) & tab\
		set rc to rc & (bleed box of pge as text) & tab\
		set rc to rc & (trim box of pge as text) & tab\
		set rc to rc & (art box of pge as text)\
		\
	end repeat\
	\
	set AppleScript\'s text item delimiters to ""\
	\
	if ExistsDoc = null then close doc\
	\
end tell\
\
rc\
	';
	
	return app.doScript(scpt, ScriptLanguage.APPLESCRIPT_LANGUAGE);
}

PdfInfo.Windows = function (file) {
	var tmpFile = new File(Folder.temp.absoluteURI + 
		'/pdfinfo-' + (new Date()).getTime().toString(36));
	
	var wscpt = '\
rc = ""\
Set AcroDoc = CreateObject("AcroExch.PDDoc")\
\
AcroDoc.Open("' + file.fsName + '")\
Set JSO = AcroDoc.GetJSObject\
\
If Not JSO Is Nothing Then\
	NumPages = AcroDoc.GetNumPages\
	\
	For i = 0 To NumPages - 1\
		\
		If Len(rc) <> 0 Then rc = rc & vbCr\
		\
		rc = rc & join(JSO.getPageBox("Crop",  i), " ") & vbTab\
		rc = rc & join(JSO.getPageBox("Bleed", i), " ") & vbTab\
		rc = rc & join(JSO.getPageBox("Trim",  i), " ") & vbTab\
		rc = rc & join(JSO.getPageBox("Art",   i), " ") \
	Next\
	\
End If\
\
AcroDoc.Close\
\
Set FSO = CreateObject("Scripting.FileSystemObject")\
Set TmpFile = FSO.OpenTextFile("' + tmpFile.fsName + '", 2, True)\
TmpFile.Write(rc)\
TmpFile.Close\
	';
	
	app.doScript(wscpt, ScriptLanguage.visualBasic);
		
	if (!tmpFile.exists || !tmpFile.open('r')) 
		throw 'Can not read file ' + file.fsName;
	
	var rc = tmpFile.read();
	tmpFile.close();
	tmpFile.remove();
	
	return rc;
}

