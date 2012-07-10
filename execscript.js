

YUI.add('execscript', function(Y) {
	
	Y.ExecScript = {
		matchScript: function(html) {
			var match, attrs, text, srcMatch, charsetMatch, script,
				RE_SCRIPT = new RegExp(/<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig),
				RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
				RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i,
            	output = {
		        	html: (html + '').replace(RE_SCRIPT, ''),
		        	scripts: []
		        };
			
	
			RE_SCRIPT.lastIndex = 0;
	
			while ((match = RE_SCRIPT.exec(html))) {
				attrs = match[1];
				srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
				if (srcMatch && srcMatch[2]) {
					// script via src
					script = {
						src: srcMatch[2]
					};
					// set charset
					if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
						script.charset = charsetMatch[2];
					}
					output.scripts.push(script);
				} else if ((text = match[2]) && text.length > 0) {
					// inline script
					script = {
						text: text
					};
					output.scripts.push(script);
				}
			}
			
			return output;
		},
		globalEval: function(text) {
			if (text && text.text) {
				text = text.text;
			}
			if (text && /\S/.test(text)) {
				var head = document.getElementsByTagName('head')[0],
					script = document.createElement('script');
	
				// It works! All browsers support!
				script.text = text;
				head.appendChild(script);
				//head.removeChild(script);
			}
		},
		insertScript: function(script) {
			var head = document.getElementsByTagName('head')[0],
				s = document.createElement('script');
				
			if (typeof script === 'string') {
				script = {
					src: script
				};
			}
			
			s.src = script.src;
			if (script.charset) {
				s.charset = script.charset;
			}
			// make sure async in gecko
			s.async = true;
			head.appendChild(s);
		},
		exec: function(script) {
			if (typeof script === 'string') {
				script = {
					text: script
				};
			}
			if (script) {
				if (script.text) {
					Y.ExecScript.globalEval(script);
				} else if (script.src) {
					Y.ExecScript.insertScript(script);
				}
			}
		}
	};
}, '0.0.1', {
	requires: []
});
