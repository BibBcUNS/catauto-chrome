// =============================================================================
//  Catalis - simModal.js
// =============================================================================


// ************************************************************
// Código tomado de: JavaScript and DHTML Cookbook
// ************************************************************


// Global flag for Navigator 4-only event handling branches.
var Nav4 = ((navigator.appName == "Netscape") && (parseInt(navigator.appVersion) == 4))
   
// One object tracks the current modal dialog opened from this window.
var dialogWin = new Object();
   
// Event handler to inhibit Navigator 4 form element 
// and IE link activity when dialog window is active.
function deadend() {
    if (dialogWin.win && !dialogWin.win.closed) {
        dialogWin.win.focus();
        return false;
    }
}



   
   
// Since links in some browsers cannot be truly disabled, preserve 
// link onclick & onmouseout event handlers while they're "disabled."
// Restore when re-enabling the main window.
var linkClicks;
   
// Disable form elements and links in all frames.
function disableForms() {
    linkClicks = new Array();
    for (var i = 0; i < document.forms.length; i++) {
        for (var j = 0; j < document.forms[i].elements.length; j++) {
            document.forms[i].elements[j].disabled = true;
        }
    }
    for (i = 0; i < document.links.length; i++) {
        linkClicks[i] = {click:document.links[i].onclick, up:null};
        linkClicks[i].up = document.links[i].onmouseup;
        document.links[i].onclick = deadend;
        document.links[i].onmouseup = deadend;
        document.links[i].disabled = true;
    }
    window.onfocus = checkModal;
    document.onclick = checkModal;
}
   
// Restore form elements and links to normal behavior.
function enableForms() {
    for (var i = 0; i < document.forms.length; i++) {
        for (var j = 0; j < document.forms[i].elements.length; j++) {
            document.forms[i].elements[j].disabled = false;
        }
    }
    for (i = 0; i < document.links.length; i++) {
        document.links[i].onclick = linkClicks[i].click;
        document.links[i].onmouseup = linkClicks[i].up;
        document.links[i].disabled = false;
    }
}
   
// Grab all Navigator events that might get through to form
// elements while dialog is open. For IE, disable form elements.
function blockEvents() {
    if (Nav4) {
        window.captureEvents(Event.CLICK | Event.MOUSEDOWN | Event.MOUSEUP | Event.FOCUS);
        window.onclick = deadend;
    } else {
        disableForms();
    }
    window.onfocus = checkModal;
}

// As dialog closes, restore the main window's original
// event mechanisms.
function unblockEvents() {
    if (Nav4) {
        window.releaseEvents(Event.CLICK | Event.MOUSEDOWN | Event.MOUSEUP | Event.FOCUS);
        window.onclick = null;
        window.onfocus = null;
    } else {
        enableForms();
    }
}
   
// Generate a modal dialog.
// Parameters:
//    url -- URL of the page/frameset to be loaded into dialog
//    width -- pixel width of the dialog window
//    height -- pixel height of the dialog window
//    returnFunc -- reference to the function (on this page)
//                  that is to act on the data returned from the dialog
//    args -- [optional] any data you need to pass to the dialog
function openSimDialog(url, width, height, returnFunc, args) {
    if (!dialogWin.win || (dialogWin.win && dialogWin.win.closed)) {
        // Initialize properties of the modal dialog object.
        dialogWin.url = url;
        dialogWin.width = width;
        dialogWin.height = height;
        dialogWin.returnFunc = returnFunc;
        dialogWin.args = args;
        dialogWin.returnedValue = "";
        // Keep name unique.
        dialogWin.name = (new Date()).getSeconds().toString();
        // Assemble window attributes and try to center the dialog.
        if (window.screenX) {              // Navigator 4+
            // Center on the main window.
            dialogWin.left = window.screenX + 
               ((window.outerWidth - dialogWin.width) / 2);
            dialogWin.top = window.screenY + 
               ((window.outerHeight - dialogWin.height) / 2);
            var attr = "screenX=" + dialogWin.left + 
               ",screenY=" + dialogWin.top + ",resizable=no,width=" + 
               dialogWin.width + ",height=" + dialogWin.height;
        } else if (window.screenLeft) {    // IE 5+/Windows 
            // Center (more or less) on the IE main window.
            // Start by estimating window size, 
            // taking IE6+ CSS compatibility mode into account
            var CSSCompat = (document.compatMode && document.compatMode != "BackCompat");
            window.outerWidth = (CSSCompat) ? document.body.parentElement.clientWidth : 
                document.body.clientWidth;
            window.outerHeight = (CSSCompat) ? document.body.parentElement.clientHeight :  
                document.body.clientHeight;
            window.outerHeight -= 80;
            dialogWin.left = parseInt(window.screenLeft+ 
               ((window.outerWidth - dialogWin.width) / 2));
            dialogWin.top = parseInt(window.screenTop + 
               ((window.outerHeight - dialogWin.height) / 2));
            var attr = "left=" + dialogWin.left + 
               ",top=" + dialogWin.top + ",resizable=no,width=" + 
               dialogWin.width + ",height=" + dialogWin.height;
        } else {                           // all the rest
            // The best we can do is center in screen.
            dialogWin.left = (screen.width - dialogWin.width) / 2;
            dialogWin.top = (screen.height - dialogWin.height) / 2;
            var attr = "left=" + dialogWin.left + ",top=" + 
               dialogWin.top + ",resizable=no,width=" + dialogWin.width + 
               ",height=" + dialogWin.height;
        }
        // Generate the dialog and make sure it has focus.
        dialogWin.win=window.open(dialogWin.url, dialogWin.name, attr);
        dialogWin.win.focus();
    } else {
        dialogWin.win.focus();
    }
}
   
// Invoked by onfocus event handler of EVERY frame,
// return focus to dialog window if it's open.
function checkModal() {
    setTimeout("finishChecking()", 50);
    return true;
}
   
function finishChecking() {
    if (dialogWin.win && !dialogWin.win.closed) {
        dialogWin.win.focus();
    }
}
