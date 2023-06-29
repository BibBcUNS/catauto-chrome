// =============================================================================
// Catalis - contextmenu-field.js
//
//  Menú contextual para campos -- En base a createPopup()
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================







// -----------------------------------------------------------------------------
function canMoveUpF(field)
// Determina si el campo 'field' puede desplazarse una posición hacia arriba.
// -----------------------------------------------------------------------------
{
	var answer;
	var tag = field.tag;
	var fieldBlock = getFieldBlockName(tag);
	
		// El primer campo, y aquellos no-repetibles, no se pueden subir
	if ( indexOfField(field,fieldBlock) == 0 || tag.search(MARC_TAGS_NR) != -1 ) {
		answer = false;
	}  else if ( tag.search(/[4567]../) != -1 )  {
		// En los bloques 4xx, 5xx, 6xx, 7xx, todos pueden subir (excepto el primero del bloque)
		answer = ( field.previousSibling.tag.substr(0,1) == tag.substr(0,1) );
	} else {
		// Y para el resto, podemos subir sólo si el campo anterior tiene el mismo tag
		answer = ( field.previousSibling.tag == tag );
	}
	return answer;
}


// -----------------------------------------------------------------------------
function canMoveDownF(field)
// Determina si el campo 'field' puede desplazarse una posición hacia abajo.
// -----------------------------------------------------------------------------
{
	var answer;
	var tag = field.tag;
	var fieldBlock = getFieldBlockName(tag);
	var lastIndex = getDatafields(fieldBlock).length - 1;

	// El último campo, y aquellos no-repetibles, no se pueden bajar
	if ( indexOfField(field,fieldBlock) == lastIndex || tag.search(MARC_TAGS_NR) != -1 ) {
		answer = false;
	} else if ( tag.search(/[4567]../) != -1 )  {
		// En los bloques 4xx, 5xx, 6xx, 7xx, todos pueden bajar (excepto el último del bloque)
		answer = ( field.nextSibling.tag.substr(0,1) == tag.substr(0,1) );
	} else {
		// Y para el resto, podemos bajar sólo si el campo siguiente tiene el mismo tag
		answer = ( field.nextSibling.tag == tag );
	}
	return answer;
}


// -----------------------------------------------------------------------------
function canRemoveF(field)
// Determina si el campo 'field' puede ser eliminado.
//
// Criterio a usar: tag es oblig y solo hay una occ de tag --> false
// TO-DO: la obligatoriedad de un campo depende de la plantilla elegida
// (i.e., del material catalogado).
// TO-DO: contar ocurrencias presentes.
// -----------------------------------------------------------------------------
{
	var tag = field.tag;
	var oblig;
	try {
		oblig = top.selectNodesChrome("/" + "/datafield[@tag='"+tag+"']/@oblig", top.xmlData.xmlMARC21)[0].value;
	}
	catch(err) {
		oblig = "";
	}
	var answer = ( "ALL" != oblig );
	return answer;
}
 
 

// -----------------------------------------------------------------------------
function canDuplicateF(field)
// Determina si el campo 'field' puede duplicarse (i.e., si se trata de un campo
// repetible)
// -----------------------------------------------------------------------------
{
	var tag = field.tag;
	var answer = ( tag.search(MARC_TAGS_NR) == -1 );
	return answer;
}


// -----------------------------------------------------------------------------
function canShowDocF(field)
// -----------------------------------------------------------------------------
{
	return true;
}


// -----------------------------------------------------------------------------
function canAddField(field)
// -----------------------------------------------------------------------------
{
	return true;
}


// -----------------------------------------------------------------------------
function canConvertTo440(field)
// -----------------------------------------------------------------------------
{	
	return (getSubfields(field) != "");
}


// -----------------------------------------------------------------------------
function canConvertTo700(field)
// -----------------------------------------------------------------------------
{	   
	return (getSubfields(field) != "");
}


// -----------------------------------------------------------------------------
function canConvertTo246(field)
// -----------------------------------------------------------------------------
{   
	return (getSubfields(field) != "");
}


// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function showFieldMenu(field)
// -----------------------------------------------------------------------------
{
	//(M.A) 10/04 divido esta funcion con el siguiente if y declaro estas 2 funciones al final de este mismo archivo
	// Construimos el menú
	if(ie){
		construirMenuIE(field);
	}else{
		construirMenuChrome(field);
	}

	return false;
}


// -----------------------------------------------------------------------------
function killmenu()
// -----------------------------------------------------------------------------
{
	hidePopup();
}

function construirMenuIE(field){
	var newMenu = oPopup.document.createElement("div");
	newMenu.id = "contextMenu";
	// ATENCION: el archivo .css no es visto desde oPopup, por eso
	// están aquí los .style
	/*
		newMenu.style.borderTop = "1px solid ThreeDHighlight";
		newMenu.style.borderLeft = "1px solid ThreeDHighlight";
		newMenu.style.borderBottom = "1px solid ThreeDShadow";
		newMenu.style.borderRight = "1px solid ThreeDShadow";
	*/
	newMenu.style.border = "1px solid black";
	newMenu.style.backgroundColor = "white"; //"#E2DFD0";
	newMenu.style.fontFamily = "arial, verdana, sans-serif";
	newMenu.style.lineHeight = "15px";
	newMenu.style.cursor = "default";
	newMenu.style.fontSize = "12px";

	var newMenuOption, newText;
	
	var itemText = new Array();        // el texto visible en el menú
	var itemEnabled = new Array();     // la opción está habilitada | deshabilitada
	var menuFunctions = new Array();   // la función invocada, en caso de estar habilitada la opción

	// Información para construir las opciones del menú
	itemText.push("Documentación (LC)");
	itemEnabled.push(canShowDocF);
	menuFunctions.push(function() {
		showDoc(field.tag);
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Subir");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveUpF);
	menuFunctions.push(function() {
		var mField = moveField(field,"up");
		firstSubfieldBox(mField).focus(); // ATENCION: no funciona
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Bajar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveDownF);
	menuFunctions.push(function() {
		var mField = moveField(field,"down");
		firstSubfieldBox(mField).focus(); // ATENCION: no funciona
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Duplicar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canDuplicateF);
	menuFunctions.push(function() {
		var tag = field.tag;
		var ind = getIndicators(field);
		
		var subfields = getSubfields(field,"","empty");
		// TO-DO: si, en lugar de una duplicación estricta, queremos que aparezca la plantilla del campo (sin datos),
		// ¿usamos los subcampos e indicadores presentes en el campo original, o los de la plantilla asociada al tag?
		var newField = createField(tag,ind,subfields);
		displayField(newField);
		lastSubfieldBox(newField).focus();  // para forzar un scroll
		firstSubfieldBox(newField).focus();
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Eliminar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canRemoveF);
	menuFunctions.push(function() {
		// window.event es null; oPopup.event es undefined... Y entonces, ¿cómo sabremos
		// dónde ubicar la ventana con el confirm?
		var fieldContent = getSubfields(field).replace(/\^/g," ^");
		if ( fieldContent == "" ) {  // campos vacíos se eliminan sin pedir confirmación
			removeField(field);
		} else {
			if ( fieldContent.length > 80 )  fieldContent = fieldContent.substr(0,80) + " ...";
			var question = "<i>Campo " + field.tag + ":</i><br>&nbsp;&nbsp;&nbsp;" + fieldContent + "<br><br>¿Confirma su eliminación?";
			if ( catalis_confirm(question,380,160,"left") ) {
				removeField(field);
			}
		}
		killmenu();
	});

	if ( "100" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 700");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo700);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 100 a un 700?";
			if ( confirm(message) ) {
				map100to700(field);
			}
			killmenu();
		});
	}
	
	if ( "490" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 440");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo440);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 490 a un 440?\n\nRecuerde que los campos 440 y 490 no tienen exactamente\nla misma estructura, y por lo tanto en algunos casos tendrá que realizar\ncorrecciones adicionales luego del cambio de etiqueta. Si tiene\ndudas, consulte la documentación.";
			if ( confirm(message) ) {
				map490to440(field);
			}
			killmenu();
		});
	}
	
	if ( "740" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 246");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo246);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 740 a un 246?";
			if ( confirm(message) ) {
				map740to246(field);
			}
			killmenu();
		});
	}
	
	if ( "830" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 440");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo440);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 830 a un 440?\n\nRecuerde que los campos 440 y 830 no tienen exactamente\nla misma estructura, y por lo tanto en algunos casos tendrá que realizar\ncorrecciones adicionales luego del cambio de etiqueta. Si tiene\ndudas, consulte la documentación.";
			if ( confirm(message) ) {
				map830to440(field);
			}
			killmenu();
		});
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Agregar campo...");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canAddField);
	menuFunctions.push(function() {
		killmenu();
		promptNewField();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Agregar subcampo...");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canAddSubfield);
	menuFunctions.push( function() {
		globalParameter = field;
		promptNewSubfield();
		killmenu();
	});

	// Creamos las opciones del menú
	for (var i=0; i < itemText.length; i++) {
		//alert(i + ":" + itemText[i]);
		newMenuItem = oPopup.document.createElement("div");
		newMenuItem.style.width = "100%";
		newMenuItem.style.padding = "2px 10px";
		
		if (itemEnabled[i](field)) {                 // opción habilitada
			newMenuItem.onclick = menuFunctions[i];
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
				this.style.color = "white";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
				this.style.color = "black";
			}
		} else {                                     // opción deshabilitada
			newMenuItem.style.color = "GrayText";
			newMenuItem.style.fontStyle = "italic";
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
			}
		}
		newText = oPopup.document.createTextNode(itemText[i]);
		newMenuItem.appendChild(newText);
		newMenu.appendChild(newMenuItem);
		
		// Líneas de separación
		if (i==0 || i==2 || i==4) {
			var newDiv = oPopup.document.createElement("div");
			newDiv.style.margin = "-5px";
			var newRule = oPopup.document.createElement("hr");
			newRule.style.height = "1px";
			newRule.style.color = "black";
			newDiv.appendChild(newRule);
			newMenu.appendChild(newDiv);
		}
	}

	// Menú construido
	oPopup.document.body.innerHTML = "";  // Elimina contenido previo
	oPopup.document.body.appendChild(newMenu);
	oPopup.show(0, 0, CONTEXT_MENU_WIDTH, 0);
	var realHeight = oPopup.document.body.scrollHeight;
	// Hides the dimension detector popup object.
	oPopup.hide();
	// Shows the actual popup object with correct height.
	//oPopup.show(event.srcElement.offsetWidth, 0, CONTEXT_MENU_WIDTH, realHeight, event.srcElement);
	//oPopup.show(event.offsetX+2, event.offsetY+2, CONTEXT_MENU_WIDTH, realHeight, event.srcElement);
	oPopup.show(0, event.srcElement.offsetHeight, CONTEXT_MENU_WIDTH, realHeight, event.srcElement);
}


function construirMenuChrome(field){

	//ARMAR MENU -----------------------------------------------------------

	globalParameter = field;
	var newMenu = document.createElement("div");
	newMenu.classList.add ("contextMenu");
	newMenu.style.border = "1px solid black";
	newMenu.style.backgroundColor = "white"; //"#E2DFD0";
	newMenu.style.fontFamily = "arial, verdana, sans-serif";
	newMenu.style.lineHeight = "15px";
	newMenu.style.cursor = "default";
	newMenu.style.fontSize = "12px";
	
	
	var newText;
	
	var itemText = new Array();        // el texto visible en el menú
	var itemEnabled = new Array();     // la opción está habilitada | deshabilitada
	var menuFunctions = new Array();   // la función invocada, en caso de estar habilitada la opción

	// Información para construir las opciones del menú
	itemText.push("Documentación (LC)");
	itemEnabled.push(canShowDocF);
	menuFunctions.push(function() {
		showDoc(field.tag);
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Subir");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveUpF);
	menuFunctions.push(function() {
		var mField = moveField(field,"up");
		firstSubfieldBox(mField).focus(); // ATENCION: no funciona
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Bajar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveDownF);
	menuFunctions.push(function() {
		var mField = moveField(field,"down");
		firstSubfieldBox(mField).focus(); // ATENCION: no funciona
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Duplicar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canDuplicateF);
	menuFunctions.push(function() {
		var tag = field.tag;
		var ind = getIndicators(field);
		var subfields = getSubfields(field,"","empty");
		// TO-DO: si, en lugar de una duplicación estricta, queremos que aparezca la plantilla del campo (sin datos),
		// ¿usamos los subcampos e indicadores presentes en el campo original, o los de la plantilla asociada al tag?
		var newField = createField(tag,ind,subfields);
		displayField(newField);
		lastSubfieldBox(newField).focus();  // para forzar un scroll
		firstSubfieldBox(newField).focus();
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Eliminar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canRemoveF);
	menuFunctions.push(function() {
		// window.event es null; oPopup.event es undefined... Y entonces, ¿cómo sabremos
		// dónde ubicar la ventana con el confirm?
		var fieldContent = getSubfields(field).replace(/\^/g," ^");
		if ( fieldContent.length > 80 )  fieldContent = fieldContent.substr(0,80) + " ...";
			var question = "<i>Campo " + field.tag + ":</i><br>&nbsp;&nbsp;&nbsp;" + fieldContent + "<br><br>¿Confirma su eliminación?";
			
		//(M.A) 12/04 Edito las siguientes lineas que llamaban a catalis_confirm comentada en aux-windows.js
		var winProperties = "dialogWidth:" + 380 + "px; dialogHeight:" + 160 + "px; status:no; help:no";
    	winProperties += "; dialogLeft:10px";
		var answer = window.showModalDialog(URL_CONFIRM_DIALOG, question, winProperties);

		if ( answer ) {
			removeField(top.globalParameter);
		}

		killmenu();
	});

	if ( "100" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 700");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo700);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 100 a un 700?";
			if ( confirm(message) ) {
				map100to700(field);
			}
			killmenu();
		});
	}
	
	if ( "490" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 440");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo440);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 490 a un 440?\n\nRecuerde que los campos 440 y 490 no tienen exactamente\nla misma estructura, y por lo tanto en algunos casos tendrá que realizar\ncorrecciones adicionales luego del cambio de etiqueta. Si tiene\ndudas, consulte la documentación.";
			if ( confirm(message) ) {
				map490to440(field);
			}
			killmenu();
		});
	}
	
	if ( "740" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 246");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo246);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 740 a un 246?";
			if ( confirm(message) ) {
				map740to246(field);
			}
			killmenu();
		});
	}
	
	if ( "830" == field.tag ) {
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemText.push("Convertir en 440");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		itemEnabled.push(canConvertTo440);
		menuFunctions.push(function() {
			var message = "¿Confirma la conversión del campo 830 a un 440?\n\nRecuerde que los campos 440 y 830 no tienen exactamente\nla misma estructura, y por lo tanto en algunos casos tendrá que realizar\ncorrecciones adicionales luego del cambio de etiqueta. Si tiene\ndudas, consulte la documentación.";
			if ( confirm(message) ) {
				map830to440(field);
			}
			killmenu();
		});
	}

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Agregar campo...");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canAddField);
	menuFunctions.push(function() {
		killmenu();
		promptNewField();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Agregar subcampo...");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canAddSubfield);
	menuFunctions.push( function() {
		globalParameter = field;
		promptNewSubfield();
		killmenu();
	});

	// Creamos las opciones del menú
	for (var i=0; i < itemText.length; i++) {
		//alert(i + ":" + itemText[i]);
		newMenuItem = document.createElement("div");
		newMenuItem.style.width = "100%";
		newMenuItem.style.padding = "2px 10px";
		
		if (itemEnabled[i](field)) {                 // opción habilitada
			newMenuItem.onclick = menuFunctions[i];
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
				this.style.color = "white";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
				this.style.color = "black";
			}
		} else {                                     // opción deshabilitada
			newMenuItem.style.color = "GrayText";
			newMenuItem.style.fontStyle = "italic";
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
			}
		}
		newText = document.createTextNode(itemText[i]);
		newMenuItem.appendChild(newText);
		newMenu.appendChild(newMenuItem);
		
		// Líneas de separación
		if (i==0 || i==2 || i==4) {
			var newDiv = document.createElement("div");
			newDiv.style.margin = "-5px";
			var newRule = document.createElement("hr");
			newRule.style.height = "1px";
			newRule.style.color = "black";
			newDiv.appendChild(newRule);
			newMenu.appendChild(newDiv);
		}
	}

	oPopup.innerHTML = "";
	oPopup.appendChild(newMenu);


	showPopup(0, 0, 450, 0);
    hidePopup();
    showPopup(0, event.srcElement.offsetHeight, 150, 160, event.srcElement);

}

