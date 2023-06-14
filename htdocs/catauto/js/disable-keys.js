// =============================================================================
//  Catalis - disable-keys.js
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================














// -----------------------------------------------------------------------------
function disableKeys()
// -----------------------------------------------------------------------------
{
	// Deshabilitamos el menú contextual (botón derecho) para todo el documento, excepto TEXTAREA, INPUT
	// ATENCION: Esto es algo restrictivo, porque deshabilita la posibilidad de seleccionar y copiar.
	document.oncontextmenu = function(evt) {
		var evt = (evt) ? evt : window.event;
		eventSource = ( evt.srcElement ) ? evt.srcElement : evt.target;
		return ( eventSource.tagName.search(/textarea|input/i) != -1 );
	}
	
	 
	 
	// También deshabilitamos algunos shortcuts como CTRL+B, CTRL+D, CTRL+F, CTRL+H, CTRL+I, CTRL+N, CTRL+U, Backspace, etc.
	// Véase http://www.microsoft.com/enable/products/keyboard/keyboardresults.asp?Product=26&v=t
	// CTRL+F (find) no se deshabilita(?) (pero no parece molestar).
	document.onkeydown = function(evt) {
		var evt = (evt) ? evt : window.event;
		var target = (evt.target) ? evt.target : evt.srcElement;
		if ( evt.ctrlKey && evt.keyCode.toString().search(/65|66|68|69|70|72|76|78|79|80|82|85/) != -1 ) {  // CTRL + varias teclas
			return false;
		} else if ( evt.keyCode == 8 && target.tagName.search(/TEXTAREA|INPUT/) == -1 ) {  // Backspace
			return false;
		} else if ( evt.altKey && evt.keyCode.toString().search(/37|39/) != -1 ) {  // Alt + left/right arrows
			return false;
		} else if ( evt.altKey && evt.keyCode == 36 ) {  // Alt+Home, que quiere llevarnos a la homepage
			alert("Alt+Inicio te llevaría fuera del sistema, pero curiosamente gracias a este mensaje ya no te lleva.");
			return false;
		} else if ( evt.keyCode.toString().search(/112|114|122/) != -1 ) {   // F1, F3, F11 (no funcionan!)
			return false;
		}
		// ATENCION: un "else return true" al final hace que, por ejemplo, se *escriba* la "i" al
		// hacer CTRL+I para ver un indicador
	}
}
