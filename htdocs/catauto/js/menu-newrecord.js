// =============================================================================
//  Catalis - menu-newrecord.js
//
//  Menú para crear nuevos registros (adaptado de un menú contextual)
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================

// -----------------------------------------------------------------------------
function canDuplicate() 
// ATENCION: revisar este criterio. 
// -----------------------------------------------------------------------------
{
	var answer = ( document.getElementById("marcEditForm").f001.value != "" );
	return answer;
}

// -----------------------------------------------------------------------------
function showNewRecordMenu(evt)
// -----------------------------------------------------------------------------
{
	//event.srcElement.blur();   // el blur() ahora está en el srcElement
	

	var theDocument;
	if (ie) theDocument = oPopup.document;
	else if (moz) theDocument = document;
	
	// Construimos el menú
	var newMenu = theDocument.createElement("DIV");
	//newMenu.className = "menuSkin";
	// ATENCION: el archivo .css no es visto desde oPopup, por eso están aquí
	// los .style
	newMenu.style.borderTop = "1px solid ThreeDHighlight";
	newMenu.style.borderLeft = "1px solid ThreeDHighlight";
	newMenu.style.borderBottom = "1px solid ThreeDShadow";
	newMenu.style.borderRight = "1px solid ThreeDShadow";
	newMenu.style.backgroundColor = "#E2DFD0";
	newMenu.style.fontFamily = "verdana, arial, sans-serif";
	newMenu.style.fontSize = "13px";
	newMenu.style.lineHeight = "15px";
	newMenu.style.padding = "2px";
	newMenu.style.cursor = "default";
	var newText;
	var itemID = new Array();
	var itemText = new Array();
	var accessKey = new Array();
	var itemEnabled = new Array();
	var menuFunctions = new Array();

	itemID.push("newTemplate");
	itemText.push("Crear registro usando plantilla");
	accessKey.push("P");
	itemEnabled.push(function() {
		return true;
	});
	menuFunctions.push(function() {
		killmenu();
		checkModified(this.id);
	});

	/*itemID.push("newImport");
	itemText.push("Importar registro MARC");
	accessKey.push("I");
	itemEnabled.push(function() {
		return true;
	});
	menuFunctions.push(function() {
		killmenu();
		checkModified(this.id);
	});*/

	itemID.push("newDuplicate");
	itemText.push("Duplicar el registro actual");
	accessKey.push("D");
	itemEnabled.push(canDuplicate);
	menuFunctions.push(function() {
		killmenu();
		checkModified(this.id);
	});

	// Recorremos los items del menú
	for (var i=0; i < itemText.length; i++) {
		newMenuItem = theDocument.createElement("DIV");
		// Uso BUTTON en lugar de DIV con la esperanza de que se pueda acceder a
		// ellos desde el teclado :-\
		newMenuItem.style.width = "100%";
		newMenuItem.style.padding = "3px 10px";  // 2px en los contextuales

		// styles agregados a causa de los BUTTONS
		/*
		newMenuItem.style.fontSize = "12px";
		newMenuItem.style.fontFamily = "arial, verdana, sans-serif";
		newMenuItem.style.textAlign = "left";
		newMenuItem.style.borderWidth = 0;
		*/

		if ( itemEnabled[i]() ) {
			//newMenuItem.className = "menuitems";
			newMenuItem.id = itemID[i];
			newMenuItem.onclick = menuFunctions[i]; // ahora estas son todas iguales! (2003/12/02)
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
				this.style.color = "white";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
				this.style.color = "black";
			}
		}
		else {
			//newMenuItem.className = "menuitemsDisabled";
			newMenuItem.style.color = "GrayText";
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
			};
		}

		newText = theDocument.createTextNode(itemText[i]);
		newMenuItem.appendChild(newText);
		newMenu.appendChild(newMenuItem);

		// Líneas de separación
		/*
		if (i==0 || i==2 || i==4) {
			var newDiv = oPopup.document.createElement("DIV");
			newDiv.style.margin = "-5px";
			var newRule = oPopup.document.createElement("HR");
			newDiv.appendChild(newRule);
			newMenu.appendChild(newDiv); 
		}
		*/
	}
	// Menú construido

	var eventSource = (evt.target) ? evt.target : event.srcElement;
	
	var MENU_WIDTH = 230;
	
	if (ie) {
		oPopup.document.body.innerHTML = "";
		oPopup.document.body.appendChild(newMenu);
	} else if (moz) {
		oPopup.innerHTML = "";
		oPopup.appendChild(newMenu);
	}
	
	
	showPopup(0, 0, MENU_WIDTH, 0);
	var realHeight = (ie) ? oPopup.document.body.scrollHeight : oPopup.offsetHeight;
	// Hides the dimension detector popup object.
	hidePopup();
	// Shows the actual popup object with correct height.
	//oPopup.show(event.srcElement.offsetWidth, 0, MENU_WIDTH, realHeight, event.srcElement);
	//oPopup.show(event.offsetX+2, event.offsetY+2, MENU_WIDTH, realHeight, event.srcElement);
	showPopup(0, eventSource.offsetHeight, MENU_WIDTH, realHeight, eventSource);

	return false;
}

// -----------------------------------------------------
function killmenu()
// -----------------------------------------------------
{
	hidePopup();
}

