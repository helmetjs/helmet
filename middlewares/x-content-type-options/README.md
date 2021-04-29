# X-Content-Type-Options middleware

Some browsers will try to "sniff" mimetypes. For example, if my server serves _file.txt_ with a _text/plain_ content-type, some browsers can still run that file with `<script src="file.txt"></script>`. Many browsers will allow _file.js_ to be run even if the content-type isn't for JavaScript.

Browsers' same-origin policies generally prevent remote resources from being loaded dangerously, but vulnerabilities in web browsers can cause this to be abused. Some browsers, like [Chrome](https://developers.google.com/web/updates/2018/07/site-isolation), will further isolate memory if the `X-Content-Type-Options` header is seen.

There are [some other vulnerabilities](https://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/), too.

This middleware prevents Chrome, Opera 13+, IE 8+ and [Firefox 50+](https://bugzilla.mozilla.org/show_bug.cgi?id=471020) from doing this sniffing. The following example sets the `X-Content-Type-Options` header to its only option, `nosniff`:

```javascript
const dontSniffMimetype = require("dont-sniff-mimetype");
app.use(dontSniffMimetype());
```

[MSDN has a good description](https://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx) of how browsers behave when this header is sent.
