
// IMPORTANT! remember to use this global switch before publishing!!! 
var MODE = 'LIVE';//'DEV';

var api_url; 
var cookieName;
var cookieUrl;
var dizlinkCookieID;
var dizlinkCookie;
var dizlinkAppToken;
var web_url;
var selectedDomain; 

if (MODE=='LIVE') {
	api_url = 'https://api.diz.link';
	cookieName = "diz.link_SESSION";
	cookieUrl = "https://diz.link";
	web_url = 'https://diz.link';
	selectedDomain = 'diz.link';
}
else {
	// DEV mode by default
	api_url = 'http://localhost:8088';
	cookieName = "diz.link-dev_SESSION";
	cookieUrl = "http://localhost";
	web_url = 'http://localhost:8088';
	selectedDomain = 'diz.link';
}


function initPopup() {
	
	//-document.getElementById('headline').innerText = chrome.i18n.getMessage('headline');
	//-document.getElementById('label_urls').innerText = chrome.i18n.getMessage('tabs') + ':';
	//-document.getElementById('label_url').innerText = chrome.i18n.getMessage('url') + ':';
	//-document.getElementById('param_long_link').placeholder = chrome.i18n.getMessage('url_example');
	document.getElementById('make-link').value = chrome.i18n.getMessage('shorten');
	//-document.getElementById('short_link').style.width = String(chrome.i18n.getMessage('short_url_width')) + 'px';
	//-document.getElementById('label_short_url').innerText = chrome.i18n.getMessage('short_url') + ':';
	//-document.getElementById('copy-short-link').value = chrome.i18n.getMessage('copy');
	//-document.getElementById('test-short-link').value = chrome.i18n.getMessage('test');

	if (selectedDomain == 'lfc.link') {
		document.getElementById('img-mainlogo').src = 'images/mainlogo_lfclink.png';
		document.getElementById('img-mainlogo').alt = 'LFC.LINK';
	}
	else {
		document.getElementById('img-mainlogo').src = 'images/mainlogo_dizlink.png';
		document.getElementById('img-mainlogo').alt = 'DIZ.LINK';
	}
	
	//urlsSelect();
	chrome.windows.getCurrent(function(w) {
		wid = w.id;
		chrome.tabs.getSelected(wid, function(t) {
			if (t.url.substr(0, 7) == 'http://' || t.url.substr(0, 8) == 'https://') {
				//-document.getElementById('param_long_link').value = t.url;
				document.getElementById('param_long_link').innerText = t.url;
			}
		});
	});

	/*
	document.getElementById('urls').addEventListener('change', function(event) {
		document.getElementById('url').value = this.value;
		this.selectedIndex = 0;
		clearError();
		//-getHeaders();
	}, false);
	*/

	document.getElementById('param_long_link').addEventListener('keyup', function(event) {
		if (event.keyCode != 13) {
			document.getElementById('result_makeDizLink').style.display = 'none';
			document.getElementById('div_makeDizLink').style.display = 'block';
			clearError();
		}
	}, false);
	
	delete init;

	
	toastr.options = {
		  "closeButton": true,
		  "debug": false,
		  "positionClass": "toast-bottom-right",
		  "onclick": null,
		  "showDuration": "300",
		  "hideDuration": "1000",
		  "timeOut": "2000",
		  "extendedTimeOut": "1000",
		  "showEasing": "swing",
		  "hideEasing": "linear",
		  "showMethod": "fadeIn",
		  "hideMethod": "fadeOut"
		};
};


function makeDizLink() {
	
	if (MODE!='LIVE') console.log("makeDizLink>> ");
	event.preventDefault();
	
	clearError();
	
	if (MODE!='LIVE') console.log("makeDizLink>> "+ " | api_url: "+api_url );
	
	document.getElementById('result_makeDizLink').style.display = 'none';
	document.getElementById('div_makeDizLink').style.display = 'block';
	//-document.getElementById('short_link').value = '';

	//-var long_link = document.getElementById('param_long_link').value;
	var long_link = document.getElementById('param_long_link').innerText;
	
	if (MODE!='LIVE') console.log("makeDizLink>> "+ "long_link: "+long_link + " | api_url: "+api_url );

	if (long_link != '') {
		if (isValidUrl(long_link) == true) {
			document.getElementById('loading').style.display = 'block';
			
			if (selectedDomain==undefined) selectedDomain='diz.link'; 
			var data = '{"long_link": "'+long_link+'"' + ',"domain":"'+selectedDomain+'"' + '}';
			var xhr = new XMLHttpRequest();
			xhr.open('POST', api_url+'/dev/shorten/'+'?apptoken='+dizlinkAppToken, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onreadystatechange = function() {
				document.getElementById('loading').value = xhr.readyState;
				if (xhr.readyState == 4) {
					document.getElementById('loading').value = xhr.readyState;
					document.getElementById('loading').style.display = 'none';
					document.getElementById('loading').value = 0;
					if (xhr.getAllResponseHeaders() != '') {
						var response = JSON.parse(xhr.responseText);
						if (response.meta.errorDetail == undefined) {
							//-document.getElementById('short_link').value = response.data.short_link;
							document.getElementById('short_link').innerText = response.data.short_link;
							document.getElementById('test-short-link').href = response.data.short_link;
							document.getElementById('copy-short-link').value = response.data.short_link;
							document.getElementById('result_makeDizLink').style.display = 'block';
							document.getElementById('div_makeDizLink').style.display = 'none';
						} else {
							//-showError('general_error', response.meta.errorDetail);
							showError('general_error', JSON.stringify(response) );
						}
					} else {
						showError('network_error', '');
					}
				}
			};
			xhr.send(data);
		} else {
			showError('url_not_valid', '');
		}
	}
};

function isValidUrl(url) {
	
	if (url.substr(0, 7) == 'http://' || url.substr(0, 8) == 'https://') {
		return true;
	} else {
		return false;
	}
};

function urlsSelect() {
	chrome.windows.getAll({'populate': true}, function(windows) {
		windows.forEach(function(w) {
			w.tabs.forEach(function(t) {
				if (isValidUrl(t.url) == true) {
					document.getElementById('urls').innerHTML += '<option>'+String(t.url)+'</option>';
				}
			});
		});
	});
};

function showError(type, message) {
	document.getElementById('loading').style.display = 'none';
	document.getElementById('loading').value = 0;
	document.getElementById('result_makeDizLink').style.display = 'none';
	document.getElementById('result_makeDizLink').innerText = '';
	document.getElementById('error').innerText = chrome.i18n.getMessage(type);
	if (message != '') {
		document.getElementById('error').innerText += ' ('+String(message)+')';
	}
	//-document.getElementById('error').innerText = '<i class="fa fa-warning fa-2x fa-fw"></i> ' + document.getElementById('error').innerText;
	document.getElementById('error').style.backgroundImage = 'url(images/'+type+'.png)';
	document.getElementById('error').style.display = 'block';
};

function clearError() {
	document.getElementById('error').style.display = 'none';
	document.getElementById('error').innerText = '';
	//document.getElementById('error_alert').style.display = 'none';
	//document.getElementById('error_alert').innerText = '';
};

// --- COPY to CLipboard! ---
/*function copyValue(id) {
	event.preventDefault();
	if (MODE!='LIVE') console.log("copyValue>> " + id);
	document.getElementById(id).select();
	document.execCommand('copy');
	window.getSelection().removeAllRanges();
};
function copyToClipboard(id){
	event.preventDefault();
	var textToCopy = document.getElementById(id).innerText;
	if (MODE!='LIVE') console.log("textToCopy>> " + textToCopy);
	 //toastr.info("<em>textToCopy</em><br> &gt;&gt; <strong>"+textToCopy+"</strong>");
	 
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = textToCopy;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand('copy');    //document.execCommand('Copy', false, null);
    document.body.removeChild(copyDiv);
    
    //toastr.info("<em>copied #dizlink to clipboard!</em><br> <strong>"+textToCopy+"</strong>");
};
function copyTextToClipboard(id) {
	
	event.preventDefault();
	var textToCopy = document.getElementById(id).innerText;
	if (MODE!='LIVE') console.log("textToCopy>> " + textToCopy);
	
    var copyFrom = $('<textarea/>');
    copyFrom.text(textToCopy);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy', false);
    copyFrom.remove();
    toastr.info("<em>copied #dizlink to clipboard!</em><br> <strong>"+textToCopy+"</strong>");
}*/
function copyLinkToClipboard() {
	
	event.preventDefault();
	var textToCopy = document.getElementById('short_link').innerText;
	if (MODE!='LIVE') console.log("textToCopy>> " + textToCopy);
	
    var copyFrom = $('<textarea/>');
    copyFrom.text(textToCopy);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy', false);
    copyFrom.remove();
    toastr.info("<em>copied #dizlink!</em><br> <strong>"+textToCopy+"</strong>");
}

function openLink(url) {
	//chrome.tabs.create({'url': url});
	switch (window.localStorage.getItem('link_target')) {
		case null:
		case undefined:
		case 'new_tab':
			chrome.tabs.create({'url': url});
			break;
		case 'active_tab':
			chrome.windows.getCurrent(function(w) {
				wid = w.id;
				chrome.tabs.getSelected(wid, function(t) {
					tid = t.id;
					chrome.tabs.update(tid, {'url': url});
				});
			});
			break;
		case 'new_window':
			chrome.windows.create({'url': url});
			break;
	}
	
	window.close();
	
};

// --- cookies ----
//Compares cookies for "key" (name, domain, etc.) equality, but not "value"
//equality.
function cookieMatch(c1, c2) {
	return (c1.name == c2.name) && (c1.domain == c2.domain) &&
	      (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
	      (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
	      (c1.session == c2.session) && (c1.storeId == c2.storeId);
};
//Returns an array of sorted keys from an associative array.
function sortedKeys(array) {
	var keys = [];
	for (var i in array) {
	 keys.push(i);
	}
	keys.sort();
	return keys;
};
//Shorthand for document.querySelector.
function select(selector) {
	return document.querySelector(selector);
};


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};
function loadVerifyAppToken() {
	
  // docs; https://developer.chrome.com/extensions/cookies 
	chrome.cookies.get({"name":cookieName, "url":cookieUrl}, function(cookie) {
		
		dizlinkCookie = cookie;
		
	    if (dizlinkCookie != undefined) {
	    	if (MODE!='LIVE') console.log("found it!!! >> " + JSON.stringify(dizlinkCookie) );
	    }
	    else {
	    	// create & set a new cookie
	    	dizlinkCookieID = generateUUID();
	    	chrome.cookies.set(
	    			{"url":cookieUrl, "name":cookieName, "value":"ID="+dizlinkCookieID, expirationDate:(new Date().getTime()/1000)+864000}
		    		, function(cookie) {
			    		if (cookie != undefined) {
			    			dizlinkCookie = cookie;
			    			if (MODE!='LIVE') console.log("recreated it!!! >> " + JSON.stringify(dizlinkCookie) );
			    		}
			    	}
	    	);
	    }
	    
	    //if (MODE!='LIVE') console.log("dizlinkCookieID >> " + dizlinkCookieID );
	    if ( (dizlinkCookieID==undefined) && (dizlinkCookie!=undefined && dizlinkCookie.value!=undefined) ) {
			//dizlinkCookieID = dizlinkCookie.value
	    	//if (MODE!='LIVE') console.log("dizlinkCookie.value >> " + dizlinkCookie.value );
			dizlinkCookie.value.split("&").forEach(function(part) {
			    var item = part.split("=");
			    if (item[0].indexOf('ID')!=-1) {
			    	dizlinkCookieID = item[1];
			    }
			    else if (item[0].indexOf('apptoken')!=-1) {
			    	dizlinkAppToken = item[1];
			    }
			  });
			//-if (MODE!='LIVE') console.log("found dizlinkCookieID: " + dizlinkCookieID);
		}
	    
	    if (MODE!='LIVE') console.log("extracted from the Cookie! >> " + " |"+"dizlinkCookieID >> " + dizlinkCookieID + " |"+"dizlinkAppToken >> " + dizlinkAppToken);
	    
	    if (dizlinkAppToken==undefined && dizlinkCookieID!=undefined) {
	    	// check & verify AppToken from API! 
	    	if (selectedDomain==undefined) selectedDomain='diz.link';
	    	var data = '{' + '"userid":"'+dizlinkCookieID+'"' + ',"client":"chrome-extension"' + ',"domain":"'+selectedDomain+'"' + '}'; 
			var xhr = new XMLHttpRequest();
			xhr.open('POST', api_url+'/dev/apptoken/', true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onreadystatechange = function() {
				document.getElementById('loading').value = xhr.readyState;
				if (xhr.readyState == 4) {
					document.getElementById('loading').value = xhr.readyState;
					document.getElementById('loading').style.display = 'none';
					document.getElementById('loading').value = 0;
					if (xhr.getAllResponseHeaders() != '') {
						var response = JSON.parse(xhr.responseText);
						if (response.meta.errorDetail == undefined) {
							dizlinkAppToken = response.data.token;
							if (MODE!='LIVE') console.log("dizlinkAppToken >> " + dizlinkAppToken );
							//dizlinkCookie.value = dizlinkCookie.value + '&APPTOKEN='+dizlinkAppToken;
							
							document.getElementById('result_makeDizLink').style.display = 'none';
							document.getElementById('div_makeDizLink').style.display = 'block';
						} else {
							showError('general_error', response.meta.errorDetail);
						}
					} else {
						showError('network_error', '');
					}
				}
			};
			xhr.send(data);
	    }
    
  });
};

function selectDomain() {
	
	selectedDomain = document.getElementById('select-domain').value;
	//if (MODE!='LIVE') console.log("selectedDomain >> "+selectedDomain);
	if (selectedDomain == 'lfc.link') {
		document.getElementById('img-mainlogo').src = 'images/mainlogo_lfclink.png';
		document.getElementById('img-mainlogo').alt = 'LFC.LINK';
		
		document.getElementById('link_dizlink-home').href = document.getElementById('link_dizlink-home').href.replace("diz.link", "lfc.link");
		document.getElementById('link_dizlink-mylinks').href = document.getElementById('link_dizlink-mylinks').href.replace("diz.link", "lfc.link");
		document.getElementById('link_dizlink-about').href = document.getElementById('link_dizlink-about').href.replace("diz.link", "lfc.link");
		document.getElementById('link_dizlink-terms').href = document.getElementById('link_dizlink-terms').href.replace("diz.link", "lfc.link");
		document.getElementById('link_dizlink-developers').href = document.getElementById('link_dizlink-developers').href.replace("diz.link", "lfc.link");
	}
	else {
		document.getElementById('img-mainlogo').src = 'images/mainlogo_dizlink.png';
		document.getElementById('img-mainlogo').alt = 'DIZ.LINK';
		
		document.getElementById('link_dizlink-home').href = document.getElementById('link_dizlink-home').href.replace("lfc.link", "diz.link");
		document.getElementById('link_dizlink-mylinks').href = document.getElementById('link_dizlink-mylinks').href.replace("lfc.link", "diz.link");
		document.getElementById('link_dizlink-about').href = document.getElementById('link_dizlink-about').href.replace("lfc.link", "diz.link");
		document.getElementById('link_dizlink-terms').href = document.getElementById('link_dizlink-terms').href.replace("lfc.link", "diz.link");
		document.getElementById('link_dizlink-developers').href = document.getElementById('link_dizlink-developers').href.replace("lfc.link", "diz.link");
	}
};


document.addEventListener("DOMContentLoaded", function () {

	initPopup();
	loadVerifyAppToken();
	
	//-document.getElementById('form_url').addEventListener('submit', makeDizLink);
	document.getElementById('div_makeDizLink').addEventListener('submit', makeDizLink);
	
	document.getElementById('select-domain').addEventListener('change', selectDomain );
	
	//document.getElementById('copy-short-link').addEventListener('click', copyValue( 'short_link' ) );
	//document.getElementById('copy-short-link').addEventListener('click', copyToClipboard( 'short_link' ) );
	//document.getElementById('copy-short-link').addEventListener('click', copyTextToClipboard( 'short_link' ) );
	//document.getElementById('copy-short-link').addEventListener('click', copyTextToClipboard );
	document.getElementById('result_makeDizLink').addEventListener('submit', copyLinkToClipboard);
	
});
