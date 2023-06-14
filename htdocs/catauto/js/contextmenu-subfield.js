// =============================================================================
// Catalis - contextmenu-subfield.js
//
// Menú contextual para subcampos -- En base a createPopup()
//
// (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================



// -----------------------------------------------------------------------------
function canMoveUpSf(subfield) 
// Determina si el subcampo subfield puede ubicarse una posición más arriba
// -----------------------------------------------------------------------------
{
	var answer = ( indexOfSubfield(subfield) != 0 ); 
	return answer;
}

// -----------------------------------------------------------------------------
function canMoveDownSf(subfield)
// Determina si el subcampo subfield puede ubicarse una posición más abajo 
// -----------------------------------------------------------------------------
{      
	var field = parentField(subfield,"subfield");
	
	var lastIndex = getSubfields(field,"array").length - 1;
	var answer = (indexOfSubfield(subfield) != lastIndex); 
	return answer;
}

// -----------------------------------------------------------------------------
function canRemoveSf(subfield) 
// Criterio a usar: code es oblig y field contiene una sola occ de code --> false
// TO-DO: contar ocurrencias presentes
// TO-DO: la obligatoriedad de un subcampo depende de la plantilla elegida
// (i.e., del material catalogado)
// -----------------------------------------------------------------------------
{
	var tag = parentField(subfield,"subfield").tag;
	var code = subfield.code;
	var oblig;
	try {
		var path = "//datafield[@tag='" + tag + "']/subfield[@code='" + code + "']/@oblig";
		if (ie)
			oblig = xmlMARC21.selectSingleNode(path).nodeValue;
		else if (moz)
			oblig = xmlMARC21.evaluate(path,xmlMARC21,null,2,null).stringValue;
	}
	catch(err) {
		var oblig = "";
	}
	var answer = ( "ALL" != oblig );
	return answer;
}


// -----------------------------------------------------------------------------
function canDuplicateSf(subfield)
// -----------------------------------------------------------------------------
{
	var tag = parentField(subfield,"subfield").tag;
	var code = subfield.code;
	var repet;
	try {
		repet = xmlMARC21.selectNodes("//datafield[@tag='" + tag + "']/subfield[@code='" + code + "']/@repet")[0].value;
	}
	catch(err) {
		repet = "NR";
	}
	var answer = (repet == "R");
	return answer;
}

// -----------------------------------------------------------------------------
function canShowDocSf(subfield) 
// -----------------------------------------------------------------------------
{
	return true;
}

// -----------------------------------------------------------------------------
function canAddSubfield(subfield)
// true excepto cuando solo hay subcampos no repetibles, y todos están 
// presentes 
// -----------------------------------------------------------------------------
{
	return true;
}


// -----------------------------------------------------------------------------
function showSubfieldMenu(subfield)
// TO-DO: reubicar el foco luego de cada acción
// -----------------------------------------------------------------------------
{
	var field = parentField(subfield,"subfield");

	// Construimos el menú
	var newMenu = oPopup.document.createElement("DIV");
	//newMenu.className = "menuSkin";
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
	var newText;
	var itemText = new Array();
	var itemEnabled = new Array();
	var menuFunctions = new Array();

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Documentación (LC)");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canShowDocSf);
	menuFunctions.push(function() {
		showDoc(field.tag); killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Subir");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveUpSf);
	menuFunctions.push(function() {
		mSubfield = moveSubfield(subfield,"up");
		killmenu();
		childSubfieldBox(mSubfield).focus();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Bajar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canMoveDownSf);
	menuFunctions.push(function() {
		mSubfield = moveSubfield(subfield,"down");
		killmenu();
		childSubfieldBox(mSubfield).focus();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Duplicar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canDuplicateSf);
	menuFunctions.push(function() {
		var code = subfield.code;
		var label = getSubfieldLabel(subfield);
		var text = ""; //childSubfieldBox(subfield).value;
		var newSubfield = createSubfield(code,text,label,field.tag);
		selectedSubfieldBox = childSubfieldBox(subfield);  // para que sea tomado como referencia al definir la posición
		displaySubfield(newSubfield,field);
		childSubfieldBox(newSubfield).focus();
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Eliminar");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canRemoveSf);
	menuFunctions.push(function() {
		// TO-DO: obviar la pregunta si el subcampo está vacío
		if (confirm("¿Confirma la eliminación del subcampo " + field.tag + "$" + subfield.code + "?")) {
			var focusTarget = nextSubfieldBox(subfield);
			removeSubfield(subfield);
			focusTarget.focus();
		}
		killmenu();
	});

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemText.push("Agregar subcampo...");
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	itemEnabled.push(canAddSubfield);
	menuFunctions.push(function() {
		promptNewSubfield(field); killmenu();
	});

	// Recorremos los items del menú
	for (var i=0; i<itemText.length; i++) {
		newMenuItem = oPopup.document.createElement("DIV");
		newMenuItem.style.width = "100%";
		newMenuItem.style.padding = "2px 10px";
		
		if (itemEnabled[i](subfield)) {
			//newMenuItem.className = "menuitems";
			newMenuItem.onclick = menuFunctions[i];
			newMenuItem.onmouseover = function() {
				this.style.backgroundColor = "highlight";
				this.style.color = "white";
			}
			newMenuItem.onmouseout = function() {
				this.style.backgroundColor = "";
				this.style.color = "black";
			}
		}
		else
		{
			//newMenuItem.className = "menuitemsDisabled";
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
			var newDiv = oPopup.document.createElement("DIV");
			newDiv.style.margin = "-5px";
			var newRule = oPopup.document.createElement("HR");
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

	return false;
}

// -----------------------------------------------------
function killmenu()
// -----------------------------------------------------
{
	hidePopup();
}

