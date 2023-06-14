// =============================================================================
//  Catalis - dom-functions.js
//
//  Funciones que dependen fuertemente de la estructura DOM del formulario
//  de edición de registros MARC, más otras funciones relacionadas con el DOM.
//
//  TO-DO: revisar las restantes funciones, en busca de "sibling", "parent",
//  "firstChild", "childNodes", "removeChild", "appendChild".
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================
// -----------------------------------------------------------------------------
function crossBrowserNodeSelector(xmlObj,path)
// Lo usamos para los casos en que se espera un FIRST_ORDERED_NODE_TYPE (9)
// Véase: Document Object Model (DOM) Level 3 XPath Specification, Version 1.0
// -----------------------------------------------------------------------------
{
 
 
 
	var node = null;
	if (ie)
		node = xmlObj.selectSingleNode(path);
	else if (moz) {
		node = xmlObj.evaluate(path,xmlObj,null,9,null).singleNodeValue;
	}
	return node;
}


// -----------------------------------------------------------------------------
function removeField(field)
// Elimina un nodo de la lista de campos.
// TO-DO: ¿undo?
// -----------------------------------------------------------------------------
{
	// Guardamos una referencia al campo siguiente, para poder darle foco
	var focusedField = nextField(field);
	field.parentNode.removeChild(field);
	if ( focusedField != null ) {   // null cuando el campo eliminado es el único del bloque
		firstSubfieldBox(focusedField).focus();
	}
	return focusedField;  // por si necesitamos darle foco desde el caller
}


// -----------------------------------------------------------------------------
function removeAllChildNodes(theObject)
// -----------------------------------------------------------------------------
{
	while ( theObject.childNodes.length > 0 ) {
		theObject.removeChild(theObject.firstChild);
	}
}



// -----------------------------------------------------------------------------
function removeSubfield(subfield)
// Elimina un nodo de la lista de subcampos.
// Cuando el subcampo eliminado es el único que queda en el campo, se
// elimina el campo completo -- ATENCION: aparece un error aquí!
// TO-DO: ¿posibilidad de undo? -- Eliminación del campo completo: cuidado con
// campos (y subcampos) obligatorios.
// -----------------------------------------------------------------------------
{	
	var field = parentField(subfield,"subfield");
	var subfieldCount = getSubfields(field,"array").length;
	if ( subfieldCount > 1 ) {
		// Guardamos una referencia al subcampo siguiente, para poder darle foco
		//var focusedSubfieldBox = nextSubfieldBox(subfield);
		subfield.parentNode.removeChild(subfield);
		//focusedSubfieldBox.focus();
		
		// Efectos colaterales del remove de un subcampo
		updatePunctuation(field);
		if ( "245" == field.tag ) {
			refreshTitleBar();
		}
		
		//return focusedSubfieldBox;  // por si lo necesitamos para darle foco desde el caller
	}
	else if ( canRemoveF(field) ) {
		removeField(field);
	}
}


// -----------------------------------------------------------------------------
function getSubfields(field, array, empty)
// Devuelve los subcampos presentes en el campo 'field'. Por defecto la salida
// es un string.
// array : indica que la función debe retornar un array
// empty : indica que los subcampos vacíos deben conservarse
// -----------------------------------------------------------------------------
{
	var subfields = ( "array" == array ) ? new Array() : new String();


	var subfieldContainers = field.getElementsByTagName("tr");
	
	for (var i=0; i < subfieldContainers.length; i++) {
		if ( subfieldContainers[i].code ) {
			//alert(subfieldContainers[i].code);
			if ( "array" == array ) {
				subfields.push(subfieldContainers[i]);
			} else {
				var code = subfieldContainers[i].code;
				// ATENCION: el uso de innerHTML en lugar de innerText hace que aparezcan entidades de HTML (&amp; &lt; &gt;)
				// ATENCION: innerText no sirve en Mozilla
				// Explicación:
				//   subfieldContainers[i]  tr
				//  .firstChild             td (code)
				//  .nextSibling            td (label)
				//  .nextSibling            td
				//  .firstChild             textarea
				var sfValue = subfieldContainers[i].firstChild.nextSibling.nextSibling.firstChild.value;
				
				// Sólo tomamos los subcampos no vacíos, a menos que "empty" == empty
				if ( sfValue.search(REGEX_EMPTY_SUBFIELD) == -1 || "empty" == empty ) {
					// TO-DO: hacer las modificaciones necesarias (en todos los .js) para admitir un '^' como parte del valor de un subcampo
					//sfValue = sfValue.replace(/\^/g,"_CARET_");
					subfields += SYSTEM_SUBFIELD_DELIMITER + code + sfValue;
				}
			}
		}
	}
	if ( "string" == typeof(subfields) ) {
		subfields = subfields.replace(/ (?=\^|$)/g,""); // quitamos espacios finales
	}
	return subfields;
}


// -----------------------------------------------------------------------------
function getIndicators(field)
// ¿Cómo conviene devolver los espacios/# ?
// ATENCION: ¿incluimos una propiedad/atributo field.indicators para
// independizarnos del DOM?
// -----------------------------------------------------------------------------
{
	// Explicación:
	//  field        tr
	// .firstChild   td
	// .nextSibling  td
	// .firstChild   div
	var indSpans = field.firstChild.nextSibling.firstChild.getElementsByTagName("span");
	// Quitamos el separador (indSpans[1])
	return indSpans[0].innerHTML + indSpans[2].innerHTML;
}


// -----------------------------------------------------------------------------
function updateIndicators(field, newValues)
// -----------------------------------------------------------------------------
{
	// Explicación:
	//   field        tr
	//  .firstChild   td
	//  .nextSibling  td
	//  .firstChild   div
	var indSpans = field.firstChild.nextSibling.firstChild.getElementsByTagName("span");
	indSpans[0].innerHTML = newValues.substr(0,1);
	indSpans[2].innerHTML = newValues.substr(1,1);
}


// -----------------------------------------------------------------------------
function getSubfieldLabel(subfield)
// -----------------------------------------------------------------------------
{
	// Explicación:
	//   subfield      tr
	//  .firstChild    td
	//  .nextSibling   td
	//  .firstChild    div
	//  .firstChild    span
	return subfield.firstChild.nextSibling.firstChild.firstChild.innerHTML;
}


// ---------------------------------------------------------------------------
function firstSubfieldBox(field)
// TO-DO: reescribir usando firstChild ??
// ---------------------------------------------------------------------------
{	//alert(field);
	var subfields = getSubfields(field, "array" ,"");
	var firstSubfield = subfields[0];
	var firstSubfieldBox = childSubfieldBox(firstSubfield);
	return firstSubfieldBox;
}


// ---------------------------------------------------------------------------
function lastSubfieldBox(field)
// Devuelve el último subfield box del campo field.
// TO-DO: reescribir usando lastChild ??
// ---------------------------------------------------------------------------
{	
	var subfields = getSubfields(field, "array");
	var lastSubfield = subfields[subfields.length - 1];
	var lastSubfieldBox = childSubfieldBox(lastSubfield);
	return lastSubfieldBox;
}


// -----------------------------------------------------------------------------
function displayField(newField,refNode)
// Coloca un campo en el árbol DOM.
//
// El parámetro opcional refNode es una referencia al nodo (campo) antes
// del cual debe ubicarse newField.
//
// TO-DO: adaptar para bloques de campos:
//    * tag --> hallar bloque al que pertenece (pattern)
//    * getDatafields(pattern)
//    * recordContainer --> depende del bloque
// -----------------------------------------------------------------------------
{
	var tag = newField.tag;
	var fieldBlock;
	if ( USE_FIELD_BLOCKS )
		fieldBlock = getFieldBlockName(tag);
	else
		fieldBlock = "noblocks";
	
	var container = document.getElementById("recordContainer_" + fieldBlock);
	
	if ( refNode != null ) {
		// Usamos el nodo de referencia pasado como parámetro
		container.insertBefore(newField, refNode);
	}
	else {
		// La ubicación del nuevo campo se decide en base a su tag
		var newPos = findNewFieldPosition(tag,fieldBlock);
		var presentFields = getDatafields(fieldBlock);
		if ( newPos < presentFields.length ) {
			// El nuevo campo debe insertarse antes del nodo (campo) refNode
			var refNode = presentFields[newPos];
			container.insertBefore(newField, refNode);
		}
		else {
			// El nuevo campo se agrega al final
			container.appendChild(newField);
		}
	}
}


// -----------------------------------------------------------------------------
function displaySubfield(newSubfield, field)
// Coloca un subcampo en el árbol DOM.
// -----------------------------------------------------------------------------
{
	// container es el TBODY donde vivirá el newSubfield
	// ATENCION: depende de la estructura DOM del formulario (¿usamos una función?)
	// Explicación:
	//   field          tr
	//  .firstChild     td
	//  .nextSibling    td
	//  .nextSibling    td
	//  .firstChild     table
	//  .firstChild     colgroup
	//  .nextSibling    tbody
	var container = field.firstChild.nextSibling.nextSibling.firstChild.firstChild.nextSibling;
	
	var code = newSubfield.code;

	//var newPos = findNewSubfieldPosition(field,code);
	
	// oldPos = posición del subcampo actualmente seleccionado
	var oldPos = indexOfSubfield(parentSubfield(selectedSubfieldBox, "subfieldBox"));

	var presentSubfields = getSubfields(field, "array"); // array of subfields
	
	//alert(code + "\n" + parentSubfield(selectedSubfieldBox, "subfieldBox").code + "\n" + oldPos + "\n" + presentSubfields.length);	
	if ( oldPos < presentSubfields.length - 1 ) {
		// el nuevo subcampo se inserta antes del nodo (subcampo) refNode
		var newPos = oldPos + 1;
		var refNode = presentSubfields[newPos];
		container.insertBefore(newSubfield, refNode);
	} else {
		// el nuevo subcampo se agrega al final
		container.appendChild(newSubfield);
	}
}


// -----------------------------------------------------------------------------
function parentField(object, objType)
// Devuelve el nodo (field) padre del objeto object
// -----------------------------------------------------------------------------
{
	switch ( objType ) {
		case "subfield" :
			return object.parentNode.parentNode.parentNode.parentNode;
		case "subfieldBox" :
			return object.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		case "subfieldLabel" :
			return object.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		case "tag" :
			return object.parentNode.parentNode;
		case "ind" :
			return object.parentNode.parentNode;
		default :
			alert("ERROR en parentField(): objType=" + objType);
	}
}


// -----------------------------------------------------------------------------
function parentSubfield(object, objType)
// Devuelve el nodo (subfield) padre del objeto object
// -----------------------------------------------------------------------------
{
	switch ( objType ) {
		case "code" :
			return object.parentNode.parentNode;
		case "label" :
			return object.parentNode.parentNode;
		case "subfieldBox" :
			return object.parentNode.parentNode;
		default :
			alert("ERROR en parentSubfield(): objType=" + objType);
	}
}


// -----------------------------------------------------------------------------
function childSubfieldBox(subfield)
// Devuelve el textbox hijo del subcampo subfield.
// -----------------------------------------------------------------------------
{
	// Explicación:
	//   subfield      tr
	//  .firstChild    td
	//  .nextSibling   td
	//  .nextSibling   td
	//  .firstChild    textarea
	var childSubfieldBox = subfield.firstChild.nextSibling.nextSibling.firstChild;
	return childSubfieldBox;
}


// -----------------------------------------------------------------------------
function nextField(field)
// Devuelve el campo que recibirá el foco tras la eliminación de un campo.
// TO-DO: ajustar para el caso en que el campo buscado está en otro
// bloque de campos.
// -----------------------------------------------------------------------------
{
	var nextField = ( field.nextSibling ) ? field.nextSibling : field.previousSibling;
	return nextField;
}


// -----------------------------------------------------------------------------
function nextSubfieldBox(subfield)
// Devuelve el subfieldBox (textarea) que recibirá el foco luego de eliminado
// el subcampo 'subfield'.
// -----------------------------------------------------------------------------
{
	var nextSubfield = ( subfield.nextSibling )
	                   ? subfield.nextSibling.firstChild.nextSibling.nextSibling.firstChild
	                   : subfield.previousSibling.firstChild.nextSibling.nextSibling.firstChild;
	return nextSubfield;
}


// -----------------------------------------------------------------------------
function isTagPresent(tag)
// Devuelve true si ya hay un campo tag, false en caso contrario.
// ATENCION: "corregido" para multiples TBODYs. No todos los TR corresponden a
// data fields, debido a los THEAD.
// -----------------------------------------------------------------------------
{
	//var dataFields = document.getElementById("recordContainer").childNodes;
	var dataFields = document.getElementById("recordDiv").getElementsByTagName("tr");
	for (var i=0; i < dataFields.length; i++) {
		if ( dataFields[i].tag && dataFields[i].tag == tag )
			return true;
	}
	return false;
}


// -----------------------------------------------------------------------------
function moveField(field, dir)
// Desplaza un campo una posición hacia arriba (dir=up) o hacia
// abajo (dir=down)
// -----------------------------------------------------------------------------
{
	// NOTA: swapNode is Microsoft (IE) only
	
	var mField;
	
	switch ( dir ) {
		case "up" :
			mField = field.swapNode(field.previousSibling);
			break;
		case "down" :
			mField = field.swapNode(field.nextSibling);
			break;
		default :
			alert("moveField error: dir=" + dir);
			break;
	}
	
	return mField;
}


// -----------------------------------------------------------------------------
function moveSubfield(subfield, dir)
// Desplaza un subcampo una posición hacia arriba (dir=up) o hacia
// abajo (dir=down).
// Devuelve una referencia al subcampo desplazado.
// -----------------------------------------------------------------------------
{
	// NOTA: swapNode is Microsoft (IE) only
	var mSubfield;
	switch ( dir ) {
		case "up" :
			mSubfield = subfield.swapNode(subfield.previousSibling);
			break;
		case "down" :
			mSubfield = subfield.swapNode(subfield.nextSibling);
			break;
		default :
			alert("moveSubfield error: dir=" + dir);
			break;
	}

	// Efectos colaterales del movimiento
	var field = parentField(mSubfield,"subfield");
	updatePunctuation(field);  // ATENCION: ¿testeamos primero si se trata de un campo para el que hay puntuación automática?
	if ( "245" == field.tag ) {
		refreshTitleBar();
	}

	return mSubfield;
}

