var browser = require('ua-parser'),
  firefoxHeader = 'X-Content-Security-Policy',
	webkitHeader = 'X-WebKit-CSP',
	standardHeader = "Content-Security-Policy";

// UA Test Cases

var uaFF = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9) Gecko/2008052906 Firefox/3.0';
console.log(browser.parseUA(uaFF).toString());
var uaIE = 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)';
console.log(browser.parseUA(uaIE).toString());


if (browser.parseUA(uaIE).toString().match(/Firefox/)) {
	console.log('here');
	headerType = firefoxHeader;
}
else if (browser.parseUA(uaIE).toString().match(/IE/)) {
	console.log('here IE');
	headerType = standardHeader;
}
else {
	console.log('here Webkit');
	headerType = webkitHeader;
}
