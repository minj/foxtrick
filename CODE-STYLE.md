# Coding style

## Rules (Strict Mode etc)

### Variables should be declared before they are used
### Variables should not be redeclared in the same function*

* Note that this actually causes all the different `for (var i = 0;;)` loops throw this warning.
A possible solution is to declare those indices at the top of run() etc

### Variables should not have the same name as function parameters
### `new Function`, `eval`, `setTimeout(string)`, `setInterval(string)`, and `onevent` attributes must not be used except when otherwise impossible in the web scope
### Assignments need to be surrounded with parenthesis when used in a boolean test
#### Do

```js
while ((a = e * f)) {
	Foxtrick.log(a);
}
```

#### Don't

```js
while (a = e * f) {
	Foxtrick.log(a);
}
```

### Falsy values `false`, `undefined`, `null`, `0`, and `''` should be compared with === and !== or negated with ! when it does not matter
#### Do

```js
if (a === '') {
	Foxtrick.log('We have ourselves an empty string');
}
if (!a) {
	Foxtrick.log('We wanted something better');
	// note that empty arrays are not included here!!!
}
```

#### Don't

```js
if (0 == '') {
	Foxtrick.log('How did that happen?');
}
```

### Non-void functions must always return a value
#### Do

```js
a = function(param) {
	if (param)
		return true;
	return false;
};
```

#### Don't

```js
a = function(param) {
	if (param)
		return true;
};
```

### Variables must not be declared conditionally
#### Do

```js
var truth;
if (a) 
	truth = true;
else
	truth = false;
var lie = a ? false : true;
```

#### Don't

```js
if (b)
	var moreTruth = true;
else
	var moreTruth = false;
```

### Functions should not be declared inside a loop
#### Do

```js
var makeLogger = function(i) {
	return function(ev) {
		Foxtrick.log('You clicked link number', i);
	};
};
var links = doc.querySelectorAll('a');
var ct = links.length;
for (var index = 1; index <= ct; index++) {
	Foxtrick.onClick(links[index], makeLogger(index));
}
```

#### Don't

```js
var links = doc.querySelectorAll('a');
var ct = links.length;
for (var index = 1; index <= ct; index++) {
	Foxtrick.onClick(links[index], function(ev) {
		Foxtrick.log('You clicked link number', index);
		Foxtrick.log('I predict it was number', ct);
	});
}
```

### Multi-line strings must not be used
#### Do

```js
a = 'multi' +
'line';
```

#### Don't

```js
a = 'multi \
line';
```

## Guidelines

### JSDoc your functions and comment tricky places
### Every script needs a `'use strict';` statement
### BOM-less UTF8 ONLY
### Code should be indented with tabs not spaces
### Lines should not be longer than 100 columns (1 tab = 4 columns)
### Lines should end with line feeds `\n` only (UNIX style)
### There should be no whitespace before the line feed
### There should be a final line feed at the end of a file
### Variables should be declared close to where they are used, not at the top of the function
### Statements should always end with a semicolon `;`
### Consequently there should be a semicolon `;` after function declaration
#### Do

```js
var fnc = function() {
};
```

#### Don't

```js
var fnc = function() {
}
```

### Single quote marks `'` should be always used unless the string includes them
#### Do

```js
a = 'a';
a = 'a "quote"';
a = 'a \'quote\'';
a = "a 'quote'";
```

#### Don't

```js
a = "a";
```

### Use a space after control statements `if`, `else`, `for`, `while`, `do`, `switch`, `return`, `try`, `catch`, `case`
#### Do

```js
if (true) {
	Foxtrick.log('OK');
}
else {
	Foxtrick.log('OK');
}
try {
	throw new Error('Good error');
}
catch (e) {
	Foxtrick.log(e);
}
for (; false;) {
	Foxtrick.log('Not gonna happen');
}
while (false) {
	Foxtrick.log('Not gonna happen');
}
do {
	Foxtrick.log('Do once');
}
while (false);
switch ('a') {
	case 'a':
		Foxtrick.log('OK');
		break;
	default:
		Foxtrick.log('OK');
		break;
}
function getA() {
	return 'a';
}
```

#### Don't

```js
if(true) {
	Foxtrick.log('NOT OK');
}
else{
	Foxtrick.log('NOT OK');
}
try{
	throw new Error('Bad error');
}
catch(e) {
	Foxtrick.log(e);
}
for(; false;) {
	Foxtrick.log('Not gonna happen');
}
while(false) {
	Foxtrick.log('Not gonna happen');
}
do{
	Foxtrick.log('NOT OK');
}
while(false);
switch('a') {
	case'a':
		Foxtrick.log('NOT OK');
		break;
	default:
		Foxtrick.log('NOT OK');
		break;
}
function getA() {
	return'a';
}
```

### Keywords `else` and `catch` should always start on a new line
#### Do

```js
if (x < 0) {
	x++;
}
else {
	x--;
}
if (x < 0) {
	x++;
}
else if (true) {
	x--;
}
try {
	a = b;
}
catch (err) {}
```

#### Don't

```js
if (x < 0) {
	x++;
} else {
	x--;
}
try {
	a = b;
} catch (err) {}
```

### There should always be a space before a curly brace `{`
#### Do

```js
if (true) {
	Foxtrick.log('OK');
}
```

#### Don't

```js
if (true){
	Foxtrick.log('NOT OK');
}
```

### Always use curly braces `{}` with `try`, `catch`, `do`
#### Do

```js
try {
	throw new Error('Good error');
}
catch (e) {
	Foxtrick.log(e);
}
if (true)
	Foxtrick.log('OK');
else
	Foxtrick.log('OK');
do {
	Foxtrick.log('OK, do once');
}
while (false);
```

#### Don't

```js
try throw new Error('Bad error');
catch (e) Foxtrick.log(e);
do Foxtrick.log('NOT OK');
while (false);
```

### There should be no empty blocks except after `catch`
#### Do

```js
try {
	a = b;
}
catch (er) {}
```

#### Don't

```js
if (a == b) {}
else {
	c = d;
}
```

### Spaces should not be mixed with tabs unless when indenting broken lines or in JSDoc blocks
#### Do

```js
/**
 * doc block
 */
if (true) {
	(function(aLongVar,
	          anEvenLongerVar) {})(); // 1 tab + spaces
}
```

#### Don't

```js
if (true) {
	if (false) {
    	Foxtrick.log('spaces with 1 tab');
	}
}
if (true) {
	if (false) {
	    Foxtrick.log('1 tab with spaces');
	}
}
/* this one is caught only by google js linter */
if (true)	{
	Foxtrick.log('1 tab instead of 1 space');
}
```

### Assignments and key declarations should not be aligned excl. extreme cases
#### Do

```js
a = {
	a: 1,
	bcd: 2,
	ef: 'str'
};
```

#### Don't

```js
a = {
	a  : 1,
	bcd: 2,
	ef : 'str'
};
/* this one is caught only by google js linter */
var sh           = 's';
var longlonglong = 'longlonglong';
```

### There should be no spaces inside parenthesis `()`
#### Do

```js
a = (1 + 2) * 3;
```

#### Don't

```js
a = ( 1 + 2 ) * 3;
```

### There should be no spaces inside array literals
#### Do

```js
a = [1];
```

#### Don't

```js
a = [ 1 ];
```

### There should be spaces inside object literals unless they are nested
#### Do

```js
a = { a: 1 };
a = { a: { b: 1 }};
```

#### Don't

```js
a = {a: 1};
```

### There should be no space between the object key and the colon `:`
#### Do

```js
a = { a: 1 };
```

#### Don't

```js
a = { a : 1 };
```

### Ending commas `,` in object and array literals are allowed
#### Do

```js
a = [
	1,
	2,
];
a = {
	a: 'a',
	b: 'b',
};
```

### Commas `,` should not be at the start of the line
#### Do

```js
a = {
	one: 1,
	two: 2
};
a = { three: 3, four: 4 };
```

#### Don't

```js
a = {
	one: 1
	, two: 2
};
var abc = 'abc'
	, def = 'def';
```

### Object keys should not be quoted unless necessary
#### Do

```js
a = { a: 1, 'default': 2 };
a = { 'bad key name': true };
```

#### Don't

```js
a = { 'a': 1 };
```

### There should be no space between a unary operator and its operand
#### Do

```js
x = !y;
y = ++j;
x = y++;
```

#### Don't

```js
x = ! y;
y = ++ j;
x = y ++;
```

### A space goes _after_ but not _before_ a comma `,`
#### Do

```js
a = [1, 2];
```

#### Don't

```js
a = [1,2];
a = [1 ,2];
a = [1 , 2];
```

### There should be a space around all other operators
#### Do

```js
x = y;
x = y ? 1 : 2;
x = y + 1;
x = y * 2 + 1;
a = x !== y;
x += y;
a = x % 2;
a = x > y;
a = x && y;
```

#### Don't

```js
x= y;
x =y;
x=y;
x = y? 1 : 2;
x = y ?1 : 2;
x = y ? 1 :2;
x = y+ 1;
x = y +1;
x = y* 2 + 1;
x = y *2 + 1;
x = y*2 + 1;
a = x!== y;
a = x !==y;
a = x!==y;
x +=y;
x+= y;
x+=y;
a = x %2;
a = x% 2;
a = x%2;
a = x> y;
a = x >y;
a = x>y;
a = x&& y;
a = x &&y;
a = x &&y;
a = x&&y;
/* this one is caught only by google js linter */
x = y ? 1: 2;
```

### Binary operators should not start on a new line
#### Do

```js
var x, y, j;
a = x +
	y;
a = x %
	y;
a = x =
	y;
a = x +=
	y;
a = x ===
	y;
a = i &&
	j;
a = i <
	j;
x = y ? 1 : 2;
x = y ?
	1 : 2;
x = y ?
	1 :
	2;
a = 
	-1; // unary
```

#### Don't

```js
a = x
	+ y;
a = x
	% y;
a = x
	= y;
a = x
	+= y;
a = x
	=== y;
a = i
	&& j;
a = i
	< j;
x = y
	? 1 : 2;
x = y ? 1
	: 2;
```

### Self-invoking function declarations should be surrounded with parenthesis `()`
#### Do

```js
var a = (function() { return 1; })();
var b = (function() { return 2; }());
var c = (function() { return 3; }).call(this);
var d = (function() { return 3; }.call(this));
var e = (function() { return d; }).apply(this);
var f = (function() { return d; }.apply(this));
```

#### Don't

```js
var g = function() { return 1; }();
var h = function() { return 3; }.call(this);
var i = function() { return d; }.apply(this);
```

### Constructors should be capitalized
#### Do

```js
a = new B();
a = new this();
```

#### Don't

```js
a = new e();
```


## Sublime Text 3 Config
### Package list
- DocBlockr
- SublimeLinter
- SublimeLinter-gjslint
- SublimeLinter-jscs
- SublimeLinter-jshint

### Additionally needed software
- https://developers.google.com/closure/utilities/docs/linter_howto
- https://github.com/SublimeLinter/SublimeLinter-jscs#linter-installation
- http://jshint.com/install/

### foxtrick.sublime-project
```json
{
	"folders":
	[
		{
			"path": "trunk"
		}
	],
	"settings": {
		"auto_indent": true,
		"default_line_ending": "unix",
		"detect_indentation": true,
		"dictionary": "Packages/Language - English/en_US.dic",
		"draw_white_space": "all",
		"ensure_newline_at_eof_on_save": true,
		"indent_to_bracket": true,
		"indent_subsequent_lines": false,
		"rulers":
		[
			80,
			100
		],
		"show_encoding": true,
		"show_line_endings": true,
		"spell_check": true,
		"smart_indent": true,
		"tab_size": 4,
		"translate_tabs_to_spaces": false,
		"trim_trailing_white_space_on_save": true,
		"word_wrap": true,
		"wrap_width": 100
	},
	"SublimeLinter": {
		"linters": {
			"jshint": {
				// "@disable": true,
				"ignore_match": [
					// spam
					//"Line is too long",
					//"Strings must use singlequote",
					//"'.+' is already defined",
					// "'.+' is defined but never used",
					//"Use '[=!]==' to compare",
					// "'.+' used out of scope",
					// "Expected a conditional expression and instead saw an assignment",
					// "Don't make functions within a loop",
					// "Redefinition of 'Foxtrick'",

					// ignore
					"Use the function form of \"use strict\"" // global strict
					"'.' is already defined", // loop indices
					"'e(v|vent)?' is defined but never used" // event listeners
				]
			},
			"jscs": {
				// "@disable": true,
				"ignore_match": [ // indentation problems
					// "Illegal space before opening curly brace" 
					// "Expected indentation of"
				]
			},
			"gjslint": {
				// "@disable": true,
				"max_line_length": 91, // counts tabs as 1
				"ignore_match": [ // wants spaces instead of tabs
					"Illegal tab in whitespace before",
					"Illegal tab in comment",
					"Missing @this JsDoc",
					"Illegal comma at end of (object|array) literal"
				]
			}
		}
	}
}
```

### trunk/.jshintrc
```json
{
	"bitwise": true,
	"browser": true,
	"devel": true,
	"eqnull": true,
	"freeze": true,
	"globalstrict": true,
	"immed": true,
	"indent": 4,
	"jquery": true,
	"latedef": true,
	"maxlen": 100,
	"maxerr": 100,
	"moz": true,
	"newcap": true,
	"noarg": true,
	"noempty": true,
	"nonew": true,
	"nonstandard": true,
	"quotmark": "single",
	"smarttabs": true,
	"strict": true,
	"sub": true,
	"trailing": true,
	"undef": true,
	"unused": "strict",
	"globals": {"Foxtrick": false}
}
```

### trunk/.jscs.json
```json
{
	"requireCurlyBraces": [
		"try", "catch", "do"
	]
	,"requireSpaceAfterKeywords": [
		"if", "else", "for", "while", "do", "switch", "return", "try", "catch", "case"
	]
	,"requireParenthesesAroundIIFE": true
	,"disallowEmptyBlocks": true
	,"disallowSpacesInsideArrayBrackets": true
	,"disallowSpacesInsideParentheses": true
	,"requireSpacesInsideObjectBrackets": "allButNested"
	,"disallowQuotedKeysInObjects": "allButReserved"
	,"disallowSpaceAfterObjectKeys": true
	,"requireCommaBeforeLineBreak": true
	,"requireOperatorBeforeLineBreak": [
		"?", ":", "+", "/", "*", "%", "=", "+=", "-=", "/=", "*=", "%=", "==", "===", "!=", "!==", ">", ">=", "<", "<=", "&&", "||"
	]
	,"disallowLeftStickedOperators": [
		"{", "?", "+", "/", "*", "%", "=", "+=", "-=", "/=", "*=", "%=", "==", "===", "!=", "!==", ">", ">=", "<", "<=", "&&", "||"
	]
	,"disallowRightStickedOperators": [
		"?", ",", ":", "+", "/", "*", "%", "=", "+=", "-=", "/=", "*=", "%=", "==", "===", "!=", "!==", ">", ">=", "<", "<=", "&&", "||"
	]
	,"requireRightStickedOperators": ["!"]
	,"requireLeftStickedOperators": [","]
	,"disallowSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"]
	,"disallowSpaceBeforePostfixUnaryOperators": ["++", "--"]
	,"requireSpaceBeforeBinaryOperators": [
		"+", "-", "/", "*", "%", "=", "+=", "-=", "/=", "*=", "%=", "==", "===", "!=", "!==", ">", ">=", "<", "<=", "&&", "||"
	]
	,"requireSpaceAfterBinaryOperators": [
		"+", "-", "/", "*", "%", "=", "+=", "-=", "/=", "*=", "%=", "==", "===", "!=", "!==", ">", ">=", "<", "<=", "&&", "||"
	]
	,"disallowKeywords": ["with"]
	,"disallowMultipleLineStrings": true
	,"validateLineBreaks": "LF"
	,"validateIndentation": "\t"
	,"disallowTrailingWhitespace": true
	,"requireKeywordsOnNewLine": ["else", "catch"]
	,"requireLineFeedAtFileEnd": true
	,"requireCapitalizedConstructors": true
	,"validateJSDoc": {
		"checkParamNames": true,
		"checkRedundantParams": true,
		"requireParamTypes": true
	}
}

```
