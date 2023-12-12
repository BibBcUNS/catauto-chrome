/* =============================================================================
 * Catalis - data-in.js
 *
 * Funciones encargadas de presentar la información de los registros
 * en el formulario de edición.
 *
 * (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
 *  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
 * =============================================================================
 */







// ATENCION: En saved-record.htm hay código que probablemente podría reubicarse aquí.

// -----------------------------------------------------------------------------
function getNewRecordParams()
// Solicita información necesaria para crear un nuevo registro
// -----------------------------------------------------------------------------
{
	var dWidth = ( screen.width == 800 ) ? 620 : 750;
	var dHeight = ( screen.width == 800 ) ? 250 : 220;

	var winProperties = "font-size: 10px; dialogWidth: " + dWidth + "px; dialogHeight: " + dHeight + "px;";
	var newRecParams = window.showModalDialog(URL_SELECT_TEMPLATE, null, winProperties);
	createRecord(newRecParams);

}


// -----------------------------------------------------------------------------
function createRecord(newRecParams)
// Prepara el formulario de edición para ingresar un nuevo registro
// -----------------------------------------------------------------------------
{
	var templateName = newRecParams[0];
	var aacrText = newRecParams[1];
	if ( "undefined" == typeof(templateName) || "" == templateName )
		return;



	// Aquí es donde debemos decidir si se ingresó un asiento AACR2 y
	// luego se canceló la operación
	
	
	if ( typeof(aacrText) == "undefined" || aacrText == "" ) {
		showEditDiv();
		//var datafields = templates[templateName].datafields.split(/\n/);
		var datafields = templates[templateName].datafields.replace(/\n$/,'').split(/\n/);
		renderDatafields(datafields);
	} else {
		// Tenemos un asiento AACR2
		var marc = aacr2marc(aacrText);
		var fieldList = marc.datafields;
		
		var dataFields = "";
		for (var i=0; i < fieldList.length; i++) {
			var tag = fieldList[i].substr(0,3);
			var ind = fieldList[i].substr(4,2);
			var subfields = fieldList[i].substr(7);
			//createField(tag,ind,subfields);
			dataFields += tag + " " + ind + subfields + "\n";
		}
		
		
		
		// Ofrecemos la ventana de edición avanzada para corregir etiquetas inválidas
		var fieldsRendered = rawEdit(dataFields,true);
		if ( !fieldsRendered ) return;
	}

	//showEditDiv();
	selectedSubfieldBox = null;
	selectedField = null;

	var form = document.getElementById("marcEditForm");

	// recordID
	form.recordID.value = "New"; // ¿Es necesario?
	
	// Leader
	var leaderData = templates[templateName].leader;
	
	renderLeader(leaderData);
	
	
	// Control fields (00x)
	form.f001.value = "[pendiente]";
	form.f003.value = "";
	form.f005.value = "";
	form.f005_nice.value = "";
	form.f008_00_05.value = "######";
	form.f008_00_05_nice.value = "";
	form.createdBy.value = "";
	
	
	renderField008(templates[templateName].f008);

	// Códigos adicionales: 041, 044, 046, 047
	// (En base a la presencia de éstos, "encender" los respectivos botones)

	// Post-it note, vacía
	postItNote = "";
	document.getElementById("postItNoteBtn").style.backgroundColor = "";
	document.getElementById("postItNoteBtn").title = "";

	// Record OK, false
	//form.recordOK.checked = false;
	//form.recordOK.parentNode.className = "recordNotOK";

	// Ejemplares, cero
	/* 2008-05-26
	ejemplares = new Array();
	if ( document.getElementById("cantEjemplares") ) {
		document.getElementById("cantEjemplares").innerHTML = "0";
	}
	if ( document.getElementById("ejemplaresBtn") ) {
		document.getElementById("ejemplaresBtn").style.backgroundColor = "";
	}
	*/
	// Original record state = el contenido de la plantilla
	originalRecord = serializeRecord(true,true,true,true);
	
	// Buttons
	document.getElementById("btnGrabar").disabled = false;
	document.getElementById("btnGrabar").style.backgroundImage = "url('" + HTDOCS + "img/stock_save-16.png')";
	document.getElementById("btnBorrar").disabled = true;

	// Ocultamos el navegadorcito de la lista de resultados
	document.getElementById("resultNavigation_block").style.visibility = "hidden";

	// Foco al primer subcampo del primer campo
	//var container = document.getElementById("recordContainer");
	//firstSubfieldBox(container.firstChild).focus();

	// Foco al subcampo 245$a
	
	
	//setTimeout('firstSubfieldBox(document.getElementById("field100")).focus()',50);
	//setTimeout('firstSubfieldBox(document.getElementById("field110")).focus()',50);
	
	// ATENCION: en la plantilla de CD-ROM, cuyo primer campo de datos es
	// el 245, el foco se coloca "a medias" (i.e. no tenemos cursor). El loop
	// parece remediar el problema sólo ocasionalmente. El timeout será mejor?

	setTimeout(function() {
		let firstRow = document.getElementById("recordDiv").querySelectorAll("tr")[1];
		firstSubfieldBox(firstRow).focus();
	}, 50);
}


// -----------------------------------------------------------------------------
function showRecordInForm(receivedRecord)
// Presenta en el formulario de edición los datos del registro recibido
// desde el servidor (via hiddenIFRAME).
//
// TO-DO: para minimizar el riesgo de que se "mezclen" dos registros, en
// caso de que el nuevo registro no termine de presentarse de manera normal
// en el formulario, ¿deberíamos dejar completamente en blanco el formulario
// antes de comenzar con el display?
// -----------------------------------------------------------------------------
{
	showEditDiv();
	postItNote = receivedRecord.postItNote;
	
	selectedSubfieldBox = null;
	selectedField = null;

	var form = document.getElementById("marcEditForm");
	
	//form.mfn.value = receivedRecord.mfn;
	form.recordID.value = receivedRecord.f001;
	
	// Datafields
	renderDatafields(receivedRecord.datafields.split(/\n/));
	
	// Leader
	renderLeader(receivedRecord.leader);
	
	// Control fields (00x)
	form.f001.value = receivedRecord.f001;
	form.f003.value = receivedRecord.f003;
	
	// fecha 005
	form.f005.value = receivedRecord.f005;
	form.f005_nice.value = receivedRecord.f005.substr(6,2) + " "
	form.f005_nice.value += MONTH_NAME[receivedRecord.f005.substr(4,2)] + " ";
	form.f005_nice.value += receivedRecord.f005.substr(0,4) + ", ";
	form.f005_nice.value += receivedRecord.f005.substr(8,2) + ":";
	form.f005_nice.value += receivedRecord.f005.substr(10,2);
	


	form.f008_00_05.value = receivedRecord.f008.substr(0,6);
	
	var century = ( receivedRecord.f008.substr(0,2) > 66 ) ? "19" : "20";
	
	form.f008_00_05_nice.value = receivedRecord.f008.substr(4,2) + " ";
	form.f008_00_05_nice.value += MONTH_NAME[receivedRecord.f008.substr(2,2)] + " ";
	form.f008_00_05_nice.value += century + receivedRecord.f008.substr(0,2);
	
	form.createdBy.value = " " + receivedRecord.createdBy;
	var leader06 = receivedRecord.leader.substr(1,1);
	renderField008(receivedRecord.f008);

	originalRecord = serializeRecord(true,true,true,true);
	
	// Post-it note
	postItNote = receivedRecord.postItNote;
	document.getElementById("postItNoteBtn").style.backgroundColor = ( postItNote != "" ) ? POSTITNOTE_BGCOLOR : "";
	document.getElementById("postItNoteBtn").title = ( postItNote != "" ) ? postItNote.substr(2).replace(/\^\w/g,"\n\n") : "";

	// Buttons
	var userCanWrite = ( g_activeDatabase.userLevel == 3 || ( g_activeDatabase.userLevel == 2 && g_currentUser == receivedRecord.createdBy ) );
	document.getElementById("btnGrabar").disabled = !userCanWrite;
	// TO-DO: usar una imagen adecuada para el botón deshabilitado.
	document.getElementById("btnGrabar").style.backgroundImage = "url('" + HTDOCS + "img/" + (userCanWrite ? "stock_save-16.png" : "") + "')";
	document.getElementById("btnBorrar").disabled = !userCanWrite;


	// Título de la ventana
	refreshTitleBar();
	
	// Navegadorcito de la lista de resultados
	var totalResults = resultSet.length;
	document.getElementById("resultSetCounter").value = g_editResultIndex + "/" + totalResults;
	document.getElementById("btnPrevResult").disabled = ( 1 == g_editResultIndex );
	document.getElementById("btnNextResult").disabled = ( totalResults == g_editResultIndex );
	document.getElementById("btnPrevResult").style.backgroundImage = ( 1 == g_editResultIndex ) ? "url('" + HTDOCS + "img/1x1.gif')" : "url('" + HTDOCS + "img/left.gif')";
	document.getElementById("btnNextResult").style.backgroundImage = ( totalResults == g_editResultIndex ) ? "url('" + HTDOCS + "img/1x1.gif')" : "url('" + HTDOCS + "img/right.gif')";

	// Quitamos el cartel de "Solicitando el registro..."
	document.getElementById("cartel").style.display = "none";

	//(M.A) Foco al primer subcampo (setea foco cuando el primer subcampo está dentro de los 100..200 sino no lo hace (to-do arreglar))
	setTimeout(function() {
		let firstRow = document.getElementById("recordDiv").querySelectorAll("tr")[1];
		firstSubfieldBox(firstRow).focus();
	}, 50);

}


// -----------------------------------------------------------------------------
function showRecordDetails(receivedRecord)
// Presenta en la pantalla de búsquedas los detalles del registro recibido
// desde el servidor vía IFRAME.
// El estilo de visualización depende de la variable global g_RecordDisplayStyle,
// que fue seteada por la función que hizo la petición del registro al servidor.
// -----------------------------------------------------------------------------
{	
	var recordDisplayStyle = g_RecordDisplayStyle;
	if ( "etiq" != recordDisplayStyle ) {
		var marcDatafields = receivedRecord.datafields.split(/\n/);
	}
	
	document.getElementById("marcDisplayDiv").style.display = "none";
	//document.getElementById("aacrDisplayDiv").style.display = "none";
	document.getElementById("etiqDisplayDiv").style.display = "none";
	document.getElementById("postItNoteDiv").style.display = "none";
	document.getElementById(recordDisplayStyle + "DisplayDiv").style.display = "block";

	// Botones
	//document.getElementById("aacrDisplayBtn").disabled = "";
	document.getElementById("marcDisplayBtn").disabled = "";
	document.getElementById("etiqDisplayBtn").disabled = "";
	document.getElementById("editRecordBtn").disabled = "";
	
	//document.getElementById("aacrDisplayBtn").style.backgroundColor = "";
	document.getElementById("marcDisplayBtn").style.backgroundColor = "";
	document.getElementById("etiqDisplayBtn").style.backgroundColor = "";
	document.getElementById("postItNoteDisplayBtn").style.backgroundColor = "";	
	document.getElementById(recordDisplayStyle + "DisplayBtn").style.backgroundColor = DISPLAY_STYLE_BGCOLOR;
	
	switch (recordDisplayStyle) {
		case "marc" :
			var leader = receivedRecord.leader;  // ATENCION: mejorar esto
			var f001 = receivedRecord.f001;
			var f003 = receivedRecord.f003;
			var f005 = receivedRecord.f005;
			var f008 = receivedRecord.f008;
			var postItNote = receivedRecord.postItNote;
			var recordDisplay = marc2marcTagged(leader, f001, f003, f005, f008, marcDatafields, postItNote);
			break;
	
		case "etiq" :
			var recordDisplay = receivedRecord.etiq;
			break;
		case "postItNote" :
			var recordDisplay = receivedRecord.postItNote.replace(/\n/g,"<br>");
			break;
		
	
	}

	var container = document.getElementById(recordDisplayStyle + "DisplayDiv");
	container.innerHTML = recordDisplay;
	
	// Deshabilitamos links *internos* (pensados para el OPAC)
	var linksArray = container.getElementsByTagName("a");
	for (var i=0; i < linksArray.length; i++) {
		if ( linksArray[i].href.indexOf("IsisScript") > 0 ) {
			linksArray[i].onclick = function() {return false};
		}
	}

	
	// Dejamos el recordID cargado en el form, por si luego se hace un submit desde
	// uno de los botones de abajo (AACR/MARC)
	document.getElementById("hiddenFORM").recordID.value = receivedRecord.f001;
	
	// Habilitamos el botón Anotaciones sólo si hay anotaciones	
	document.getElementById("postItNoteDisplayBtn").disabled = ( "" == receivedRecord.postItNote );
	
	// Quitamos el cartel de "Solicitando registro"
	document.getElementById("cartel").style.display = "none";

	// try-catch, pues a veces tenemos un error al no estar disponible el elemento donde
	// se quiere poner el foco
	/*try {
		document.getElementById(recordDisplayStyle + "DisplayDiv").focus();
	}
	catch(err) {}*/
	
	// Cambiamos el try-catch por este setTimeout (JS & DHTML Cookbook) - Mozilla no lo acepta
	//setTimeout('document.getElementById("' + recordDisplayStyle + 'DisplayDiv").focus()',0);

	// ATENCION: hay que forzar un scroll up --> ¿focus en un elemento invisible?
}


// -----------------------------------------------------------------------------
function showDictionaryKeys(dictionaryKeys,reverse)
// Presenta un listado de términos del diccionario.
//
// TO-DO: desactivar el botón "Anteriores" ("Siguientes") cuando ya se está
// viendo el primer (último) término del diccionario.
// -----------------------------------------------------------------------------
{
	document.getElementById("indexTerms").innerHTML = "";
	
	// Botón "Anteriores"
	// TO-DO: omitir botón cuando se llega al comienzo del diccionario
	var newButton = document.createElement("button");
	newButton.id = "prevKeysBtn";
	newButton.className = "marcEditButton";
	newButton.style.margin = "4px 50px";
	newButton.style.border = "1px solid #AAA";
	newButton._term = dictionaryKeys[0].key;  // custom attribute
	newButton.onclick = function() {
		updateDictionaryList(this._term,"reverse");
	}
	var newImg = document.createElement("img");
	newImg.src = HTDOCS + "img/up.gif";
	newImg.align = "top";
	newButton.appendChild(newImg);
	var newText = document.createTextNode("Anteriores");
	newButton.appendChild(newText);
	document.getElementById("indexTerms").appendChild(newButton);
	
	// Tabla con la lista de términos
	var newTable = document.createElement("table");
	newTable.cellSpacing = 0;
	newTable.cellPadding = 2;
	newTable.width = 350;
	newTable.style.fontSize = "12px";
	newTable.style.borderTop = "1px dotted #999";
	newTable.style.borderBottom = "1px dotted #999";
	
	var newTbody = document.createElement("tbody");

	for (var i=0; i < dictionaryKeys.length; i++) {
		var newRow = document.createElement("tr");
		newRow.id = "dictKeyRow" + i;
		var rowClass = (i % 2 == 0) ? "evenRow" : "oddRow";
		newRow.className = rowClass;
		
		var newCell = document.createElement("td");
		newCell.style.paddingLeft = "3px";
		newCell.style.paddingRight = "3px";
		newCell.align = "right";
		newCell.width = "20";
		newCell.valign = "top";
		var newText = document.createTextNode(dictionaryKeys[i].postings);
		newCell.appendChild(newText);
		newRow.appendChild(newCell);
		
		var newCell = document.createElement("td");
		newCell.style.fontWeight = "bold";
		newCell.style.paddingLeft = "3px";
		
		var newLink = document.createElement("a");
		newLink.href = "#";
		newLink.style.color = INDEXTERM_COLOR;
		newLink.title = dictionaryKeys[i].key;
		newLink._index = i;  // custom attribute
		newLink.onclick = function() {
			searchFromDictionary(this.title,this._index);
			return false;
		}
		//var initialUpperCase = (dictionaryKeys[i].key.substr(0,1) == "~") ? 2 : 1;
		//var displayKey = dictionaryKeys[i].key.substr(0,initialUpperCase) + dictionaryKeys[i].key.substr(initialUpperCase).toLowerCase();
		var displayKey = dictionaryKeys[i].key;
		var newText = document.createTextNode(displayKey);
		newLink.appendChild(newText);
		newCell.appendChild(newLink);
		newRow.appendChild(newCell);
		newTbody.appendChild(newRow);
	}
	newTable.appendChild(newTbody);
	document.getElementById("indexTerms").appendChild(newTable);
	
	// Botón "Siguientes"
	// TO-DO: omitir botón cuando se llega al final del diccionario
	var newButton = document.createElement("button");
	newButton.id = "nextKeysBtn";
	newButton.className = "marcEditButton";
	newButton.style.margin = "4px 50px";
	newButton.style.border = "1px solid #AAA";
	newButton._term = dictionaryKeys[i-1].key;  // custom attribute
	newButton.onclick = function() {
		updateDictionaryList(this._term);
	}
	var newImg = document.createElement("img");
	newImg.src = HTDOCS + "img/down.gif";
	newImg.align = "top";
	newButton.appendChild(newImg);
	var newText = document.createTextNode("Siguientes");
	newButton.appendChild(newText);
	document.getElementById("indexTerms").appendChild(newButton);
	
	// Quitamos el cartel de "Solicitando términos..."
	document.getElementById("cartel").style.display = "none";
	
	// ATENCION: ubicar el foco en el lugar más apropiado (arriba o abajo)
	// (uno para forzar un scroll, y otro para facilitar el uso del teclado)
	/*if ( "On" == reverse ) {
		document.getElementById("nextKeysBtn").focus();
	}
	else {
		document.getElementById("prevKeysBtn").focus();
	}*/
	document.getElementById("prevKeysBtn").focus();
	document.getElementById("indexTerms").focus();  // no vale en Mozilla
}


// -----------------------------------------------------------------------------
function duplicateRecord()
// Crea una copia (local) del registro activo.
// -----------------------------------------------------------------------------
{
	showEditDiv();
	
	var form = document.getElementById("marcEditForm");
	
	// recordID
	form.recordID.value = "New";
	
	// Leader
	form.L_05.value = "n";
	
	// Control fields (00x)
	form.f001.value = "[duplicado]";
	form.f003.value = "";
	form.f005.value = "";
	form.f005_nice.value = "";

	form.f008_00_05.value = "######";
	form.f008_00_05_nice.value = "";
	form.createdBy.value = "";

	// Códigos adicionales: 041, 044, 046, 047
	// (En base a la presencia de éstos, "encender" los respectivos botones)

	// Post-it note (se deja igual?)
	postItNote = "";
	document.getElementById("postItNoteBtn").style.backgroundColor = "";
	document.getElementById("postItNoteBtn").title = "";

	// Record OK: false
	//form.recordOK.checked = false;
	//form.recordOK.parentNode.className = "recordNotOK";
	
	// Ejemplares: cero
	/*
	ejemplares = new Array();
	if ( document.getElementById("cantEjemplares") ) {
		document.getElementById("cantEjemplares").innerHTML = "0";
	}
	if ( document.getElementById("ejemplaresBtn") ) {
		document.getElementById("ejemplaresBtn").style.backgroundColor = "";
	}
*/
	// Original record state = empty (not saved yet)
	originalRecord = "*";

	// Buttons
	document.getElementById("btnGrabar").disabled = false;
	document.getElementById("btnGrabar").style.backgroundImage = "url('" + HTDOCS + "img/stock_save-16.png')";
	document.getElementById("btnBorrar").disabled = true;

	// Ocultamos el navegadorcito de la lista de resultados
	document.getElementById("resultNavigation_block").style.visibility = "hidden";

	// Foco al primer subcampo del primer campo
	var container = document.getElementById("recordContainer_description");
	firstSubfieldBox(container.firstChild).focus();
	
	// Cartelito
	catalisMessage(document.getElementById("registroDuplicado").innerHTML, true);
	//setTimeout('document.getElementById("cartel").style.display = "none"',3000);
}



// -----------------------------------------------------------------------------
function renderDatafields(datafields)
// Presenta en el formulario los campos de datos de un registro MARC, recibidos
// en el array 'datafields'.
//
// TO-DO: El jueguito con visibility es para evitar una "demora" si se mostrara
// campo por campo. Pero en registros largos, sucede que queda un tiempo
// apreciable el cuadro en blanco.
// Buscar otra solución que use un nodo (TBODY?) temporal (?)
// -----------------------------------------------------------------------------
{
	var recordContainer = new Array();
	if ( USE_FIELD_BLOCKS ) {
		recordContainer[0] = document.getElementById("recordContainer_description");
		recordContainer[1] = document.getElementById("recordContainer_access");
		recordContainer[2] = document.getElementById("recordContainer_subject");
		recordContainer[3] = document.getElementById("recordContainer_other");
	} else {
		recordContainer[0] = document.getElementById("recordContainer_noblocks");
	}
	
	// Limpiamos el container de campos de datos
	for (var i=0; i < recordContainer.length; i++) {
		if ( recordContainer[i].hasChildNodes() ) {
			removeAllChildNodes(recordContainer[i]);
		}
	}
	
	var standardNumbers = new Array();
	var titleVariants = new Array();
	//container.style.visibility = "hidden";
	
	for (var i=0; i < datafields.length; i++) {
		var tag = datafields[i].substr(0,3);
		
		//if ( tag.search(/9[01].|008|859|981/) != -1 ) continue; // campos especiales
		
		var ind = datafields[i].substr(4,2);
		var subfields = datafields[i].substr(7);   //.replace(REGEX_SYSTEM_SUBFIELD_DELIMITER,"$");
		
		// Posponemos el display de los campos 020 & 022,
		// [y de aquellos 246 que sean estrictamente puntos de acceso -- suspendido.]
		// y de los 246, sean o no puntos de acceso.
		if ( USE_FIELD_BLOCKS ) {
			if ( tag.search(/020|022/) != -1 ) {
				standardNumbers.push(datafields[i]);
				continue;
			} else {
				var tag_ind = tag + "_" + ind;
				if ( tag_ind.search(/246_../) != -1 ) {
					titleVariants.push(datafields[i]);
					continue;
				}
			}
		}
		
		var container = recordContainer[0];
		if ( USE_FIELD_BLOCKS ) {
			var fieldBlock = getFieldBlockName(tag);
			container = document.getElementById("recordContainer_" + fieldBlock);
		}
		
		var newField = createField(tag,ind,subfields);
		container.appendChild(newField);
		
	}
	
	// Para que los números normalizados (i.e. Area 8, campos 020 & 022) aparezcan
	// al final de la descripción, los retenemos en un array auxiliar, y recién
	// al final los ubicamos en el formulario.
	for (var i=0; i < standardNumbers.length; i++) {
		var tag = standardNumbers[i].substr(0,3);
		var ind = standardNumbers[i].substr(4,2);
		var subfields = standardNumbers[i].substr(7);
		var newField = createField(tag,ind,subfields);
		recordContainer[0].appendChild(newField);
	}
	
	// Hacemos algo similar con los campos 246 que sólo generan puntos de acceso.
	for (var i=0; i < titleVariants.length; i++) {
		var tag = "246";
		var ind = titleVariants[i].substr(4,2);
		var subfields = titleVariants[i].substr(7);
		var newField = createField(tag,ind,subfields);
		recordContainer[1].appendChild(newField);
	}
	
	//container.style.visibility = "visible";

	// Foco al primer subcampo del primer campo
	//firstSubfieldBox(recordContainer[0].firstChild).focus();
	// TO-DO: al crear registros desde una plantilla, ¿el foco debería ir
	// inicialmente al 245$a ? Se puede hacer configurable.
	
	// Para Mozilla: intentamos ajustar altura de textareas.
	if (moz) {
		var subfieldBoxes = document.getElementById("recordDiv").getElementsByTagName("textarea");
		for (var i=0; i < subfieldBoxes.length; i++) {
			subfieldBoxes[i].style.height = 1;
			subfieldBoxes[i].style.height = subfieldBoxes[i].scrollHeight;
		}
	}
}


// -----------------------------------------------------------------------------
function renderLeader(leaderData)
// leaderData: sólo los 3 elementos que nos interesan (05,06,17)
// -----------------------------------------------------------------------------
{
	var form = document.getElementById("marcEditForm");
	form.L_05.value = leaderData.substr(0,1);
	form.L_06.value = leaderData.substr(1,1);
	form.L_17.value = leaderData.substr(2,1);
	
	var myPath = "/" + "/dataElement[@pos='L_06']/option[@code='" + form.L_06.value + "']";
	// habia un problema lo parche, ojojojojojojojojo
	form.L_06.title = "Registro con datos de autoridades";
	
}


// -----------------------------------------------------------------------------
function renderField008(f008)
// -----------------------------------------------------------------------------
{
	var form = document.getElementById("marcEditForm");
	//alert(f008);
	form.f008_06.value = f008.substr(6,1);
	form.f008_07.value = f008.substr(7,1);
	form.f008_08.value = f008.substr(8,1);
	form.f008_09.value = f008.substr(9,1);
	form.f008_10.value = f008.substr(10,1);
	form.f008_11.value = f008.substr(11,1);
	form.f008_12.value = f008.substr(12,1);
	form.f008_13.value = f008.substr(13,1);
	form.f008_14.value = f008.substr(14,1);
	form.f008_15.value = f008.substr(15,1);
	form.f008_16.value = f008.substr(16,1);
	form.f008_17.value = f008.substr(17,1);
	form.f008_28.value = f008.substr(28,1);
	form.f008_29.value = f008.substr(29,1);
	//form.f008_31.value = f008.substr(31,1);
	form.f008_32.value = f008.substr(32,1);
	form.f008_33.value = f008.substr(33,1);	
	form.f008_38.value = f008.substr(38,1);
	form.f008_39.value = f008.substr(39,1);
	


	
	// TO-DO: colocar los tooltips para los elementos restantes
}

