<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
-->
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Adding Event Handlers &mdash; CKEditor Sample</title>
	<meta content="text/html; charset=utf-8" http-equiv="content-type"/>
	<link href="../sample.css" rel="stylesheet" type="text/css"/>
</head>
<body>
	<h1 class="samples">
		CKEditor Sample &mdash; Adding Event Handlers
	</h1>
	<div class="description">
	<p>
		This sample shows how to add event handlers to CKEditor with PHP.
	</p>
	<p>
		A snippet of the configuration code can be seen below; check the source code of this page for
		the full definition:
	</p>
	<pre class="samples">&lt;?php
// Include the CKEditor class.
include("ckeditor/ckeditor.php");

// Create a class instance.
$CKEditor = new CKEditor();

// Path to the CKEditor directory.
$CKEditor->basePath = '/ckeditor/';

// The initial value to be displayed in the editor.
$initialValue = 'This is some sample text.';

// Add event handler, <em>instanceReady</em> is fired when editor is loaded.
$CKEditor-><strong>addEventHandler</strong>('instanceReady', 'function (evt) {
	alert("Loaded editor: " + evt.editor.name);
}');

// Create an editor instance.
$CKEditor->editor("editor1", $initialValue);
</pre>
	</div>
	<!-- This <div> holds alert messages to be display in the sample page. -->
	<div id="alerts">
		<noscript>
			<p>
				<strong>CKEditor requires JavaScript to run</strong>. In a browser with no JavaScript
				support, like yours, you should still see the contents (HTML data) and you should
				be able to edit it normally, without a rich editor interface.
			</p>
		</noscript>
	</div>
	<form action="../sample_posteddata.php" method="post">
		<label>Editor 1:</label>
<textarea name="editor1" rows="8" cols="60">&lt;p&gt;This is some &lt;strong&gt;sample text&lt;/strong&gt;. You are using &lt;a href=&quot;http://ckeditor.com/&quot;&gt;CKEditor&lt;/a&gt;.&lt;/p&gt;</textarea>
<script type="text/javascript" src="../../ckeditor.js?t=C6HH5UF"></script>
<script type="text/javascript">//<![CDATA[
CKEDITOR.replace('editor1', {"width":750,"on":{"instanceReady":function (evt) {
	alert("Loaded editor: " + evt.editor.name);
}}});
//]]></script>
		<br />
		<label>Editor 2:</label>
<textarea name="editor2" rows="8" cols="60">&lt;p&gt;This is some &lt;strong&gt;sample text&lt;/strong&gt;. You are using &lt;a href=&quot;http://ckeditor.com/&quot;&gt;CKEditor&lt;/a&gt;.&lt;/p&gt;</textarea>
<script type="text/javascript">//<![CDATA[

CKEDITOR.on('dialogDefinition', function (ev) {
		// Take the dialog window name and its definition from the event data.
		var dialogName = ev.data.name;
		var dialogDefinition = ev.data.definition;

		// Check if the definition comes from the "Link" dialog window.
		if ( dialogName == "link" )
			dialogDefinition.removeContents("target")
	});
CKEDITOR.on('dialogDefinition', function (evt) {
		alert("Loading a dialog window: " + evt.data.name);
	});CKEDITOR.replace('editor2', {"width":"600","toolbar":"Basic","on":{"instanceReady":function (evt) {
	alert("Loaded second editor: " + evt.editor.name);
}}});
//]]></script>
		<p>
			<input type="submit" value="Submit"/>
		</p>
	</form>
	<div id="footer">
		<hr />
		<p>
			CKEditor - The text editor for the Internet - <a class="samples" href="http://ckeditor.com/">http://ckeditor.com</a>
		</p>
		<p id="copy">
			Copyright &copy; 2003-2012, <a class="samples" href="http://cksource.com/">CKSource</a> - Frederico
			Knabben. All rights reserved.
		</p>
	</div>
</body>
</html>
