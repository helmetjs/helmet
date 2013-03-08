// set secure headers
var http = require('http'),
  browser = require('ua-parser');

var setCSP = function(options){
	//CSP stuff
	// Lots of options to worry about here
};

var setHSTS = function(options){
	//HSTS stuff
	var hstsHeaderName = 'Strict-Transport-Security',
		hstsMaxAge = "31536000",
		hstsValue = "",
		defaultValue = "max-age=" + hstsMaxAge,
		validHSTSHeader = /\Amax-age=\d+(; includeSubdomains)?\z/i;

	if (options === undefined){
		hstsValue = defaultValue;
		response.setHeader(hstsHeaderName, hstsValue);
	}
	else if (options.match(validHSTSHeader)) {
		hstsValue = options;
		response.setHeader(hstsHeaderName, hstsValue);
	}
	else
		console.log('Error HSTS');
};

var setX_CTO = function(options){
	//XCTO stuff
	var X_CTOHeaderName = "X-Content-Type-Options",
		X_CTOValue = '',
		defaultValue = "nosniff";

	if (options === undefined){
		X_CTOValue = defaultValue;
		response.setHeader(X_CTOHeaderName, X_CTOValue);
	}
	else if (options == "nosniff") {
		X_CTOValue = options;
		response.setHeader(X_CTOHeaderName, X_CTOValue);
	}
	else
		console.log('Error X_CTO');


};

var setXFO = function(options){
	//XFO stuff
	var XFOHeaderName = "X-FRAME-OPTIONS",
		defaultValue = 'SAMEORIGIN',
		validXFOHeader = /\A(SAMEORIGIN\z|DENY\z|ALLOW-FROM:)/i,
		XFOValue = '';

	if (options === undefined){
		XFOValue = defaultValue;
		response.setHeader(XFOHeaderName, XFOValue);
	}
	else if (options.match(validXFOHeader)) {
		XFOValue = options;
		response.setHeader(XFOHeaderName, XFOValue);
	}
	else
		console.log('Error XFO');

};

var setX_XSS = function(options){
	//X_XSS stuff
	var X_XSSHeaderName = 'X-XSS-Protection',
		defaultValue = "1",
		X_XSSValue = '',
		validX_XSSHeader = /\A[01](; mode=block)?\z/i;

	if (options === undefined){
		X_XSSValue = defaultValue;
		response.setHeader(X_XSSHeaderName, X_XSSValue);
	}
	else if (options.match(validX_XSSHeader)){
		XFOValue = options;
		response.setHeader(X_XSSHeaderName, X_XSSValue);
	}
	else
		console.log('Error X_XSS');
};

var setSecureHeaders = function(options, userAgent){
	//set all headers
	setCSP({});
	setHSTS({});
	setXFO({});
	setX_XSS({});
	if (browser.parseUA(userAgent).toString().match(/IE/)) {
		setX_CTO({});
	}

};
