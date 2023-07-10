// =============================================================================
//  Catalis - eventsHandlers.js
//
//  Event handler definitions for some (static) UI elements.
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================



// -----------------------------------------------------------------------------
function setSearchFormEvents()
// -----------------------------------------------------------------------------
{

	document.getElementById("searchTab").onclick = function() {
		showSearchForm("search");
	}
	
	document.getElementById("indexTab").onclick = function() {
		showSearchForm("index");
	}
	
	document.getElementById("kwSearchForm").onsubmit = function() {
		handleKwSearch();
		return false;
	}
	
	document.getElementById("kwSearchHelpLink").onclick = function() {
		generalHelpPopup("keyword_search");
	}
	
	document.getElementById("mfnSearchHelpLink").onclick = function() {
		generalHelpPopup("mfn_search");
	}
	
	document.getElementById("testConditionSearchHelpLink").onclick = function() {
		generalHelpPopup("testcondition_search");
	}
	
	document.getElementById("indexHelpLink").onclick = function() {
		generalHelpPopup("dictionary_keys");
	}
	
	document.getElementById("indexForm").onsubmit = function() {
		updateDictionaryList(this.dictkey.value);
		return false;
	}
	

	
	document.getElementById("etiqDisplayBtn").onclick = function() {
		viewRecordDetails(event,null,"etiq");
	}
	
	document.getElementById("marcDisplayBtn").onclick = function() {
		viewRecordDetails(event,null,"marc");
	}
	
	document.getElementById("editRecordBtn").onclick = function() {
		editRecord(null,event);
	}
	
	document.getElementById("btnNewRecords").onclick = showNewRecords;
}


// -----------------------------------------------------------------------------
function setEditionFormEvents()
// -----------------------------------------------------------------------------
{
	document.getElementById("postItNoteBtn").onclick = function() {
		//this.blur();
		editPostItNote();
	}

	document.getElementById("btnDocHideShow").onclick = docIframeShow;
	
	document.getElementById("docForm").onsubmit = function() {
		showDoc(this.docItem.value);
		return false;
	}
}


// -----------------------------------------------------------------------------
function setControlFormEvents()
// -----------------------------------------------------------------------------
{
	// Queremos que un ENTER en los textboxes equivalga a un TAB, y que un F12
	// abra la ventana con los códigos, si la hay.
	// ATENCION: no funciona la deshabilitación del Backspace (en IE6-home parece que sí)
	var inputFields = document.getElementById("control").getElementsByTagName("input");
	for (var i=0; i < inputFields.length; i++) {
		if ( "text" == inputFields[i].type ) {
			inputFields[i].onkeydown = function(evt) {
				var evt = (evt) ? evt : window.event;
				if ( evt.keyCode == 13 ) {
					evt.keyCode = 9;     // ATENCION: keyCode es read-only en Mozilla
					return true;
				} 
				
				else if ( evt.keyCode == 123 && this.name.search(/f008_07_10|f008_11_14/) == -1 ) {
					editCodedData(this.name);
					return false;   // 123 = F12
				}
				else if ( evt.keyCode == 8 ) {  // Backspace
					//alert();
					window.event.cancelBubble = true;
					return false;
				}
			}
		}
	}
	
	
	// Un click sobre una celda abre la ventana con los códigos
	var allCells = document.getElementById("control").getElementsByTagName("td");
	for (var i=0; i < allCells.length; i++) {
		if ( allCells[i].id.search(/^TD_f008_|^TD_L_/) != -1 ) {
			//alert(allCells[i].id);
			allCells[i].onclick = function() {
				window.top.globalParameter = this.id.substr(3);
				console.log(window.top.globalParameter);
				editCodedData();
			}
			allCells[i].onmouseover = function() {
				this.style.backgroundColor = FIXEDFIELD_HL_BGCOLOR;
			}
			allCells[i].onmouseout = function() {
				this.style.backgroundColor = "#FED";  // este color aparece en catalis.css
			}
		}
	}
	
	// Fechas
/*
	document.getElementById("f008_07_10").onchange = function() {
		if ( this.value.length > 0 ) {
			this.value = this.value.concat("uuuu").substr(0,4);
		} else {
			this.value = "####";
		}
		this.value = this.value.replace(/ /g,"u");
	}
	document.getElementById("f008_11_14").onchange = function() {
		if ( this.value.length > 0 ) {
			this.value = this.value.concat("uuuu").substr(0,4);
		} else {
			this.value = "####";
		}
		this.value = this.value.replace(/ /g,"u");
	}
*/
}	


// -----------------------------------------------------------------------------
function setWindowEvents()
// -----------------------------------------------------------------------------
{
	// Queremos emular en Mozilla el comportamiento del objeto popup de IE.
	// ATENCION: ¿hay que agregar cada posible evt.target asociado a un popup?
	// TO-DO: si el click es en el IFRAME...
	if (moz) {
		window.onclick = function(evt) {
			if ( evt.target != document.getElementById("btnNuevo") ) hidePopup();
		}
		//window.onblur = hidePopup;  // efecto indeseado: no funciona el menú "Nuevo"
	}
}


// -----------------------------------------------------------------------------
function setToolbarEvents()
// -----------------------------------------------------------------------------
{
	document.getElementById("btnNuevo").onclick = function(e) {
		this.blur();
		console.log(e)
		showNewRecordMenu(e);
	}
	
	document.getElementById("btnImport").onclick = function() {
		this.blur();
		top.globalParameter = "newImport";
		checkModified();
	}
	
	document.getElementById("toggleLabels").onclick = function() {
		this.blur();
		toggleSubfieldLabels();
	}
	

	
	document.getElementById("btnExportar").onclick = function() {
		this.blur();
		exportRecord();
	}
	
	document.getElementById("btnGrabar").onclick = function() {
		this.blur();
		saveRecord();
	}
	
	
	document.getElementById("btnRawEdit").onclick = function() {
		this.blur();
		//rawEdit(serializeRecord(false,false,true,false));
		top.globalParameter = serializeRecord(false, false, false, false);
		console.log("globalParameter: ----------------------------------------------------------------------------");
		console.log(top.globalParameter);
		rawEdit();
	}
	
	document.getElementById("btnBorrar").onclick = function() {
		this.blur();
		deleteRecord();
	}
	
	document.getElementById("btnKeys").onclick = showKeys;
	
	document.getElementById("fieldTagForm").onsubmit = function() {
		newFieldShortcut();
		return false;
	}
	
	document.getElementById("subfieldCodeForm").onsubmit = function() {
		newSubfieldShortcut(selectedField);
		return false;
	}
	
	document.getElementById("btnNewField").onclick = function() {
		this.blur();
		promptNewField();
	}
	
	 document.getElementById("btnNewSubfield").onclick = function() {
			this.blur();
    		globalParameter = selectedField;
    		promptNewSubfield();
  	};
	
	document.getElementById("btnPrevResult").onclick = function() {
		top.globalParameter = this.id;
   		checkModified();
	}
	
	document.getElementById("btnNextResult").onclick = function() {
		top.globalParameter = this.id;
		checkModified();
	}
	
	document.getElementById("resultSetCounter").onfocus = function() {
		this.blur();
	}
	
	document.getElementById("btnBuscar").onclick = function() {
		top.globalParameter = this.id;
		checkModified();
	}
	
	document.getElementById("btnEditar").onclick = showEditDiv;
}

	
// -----------------------------------------------------------------------------
function setHeaderEvents()
// -----------------------------------------------------------------------------
{
	document.getElementById("btnFinSesion").onclick = function() {
		top.globalParameter = this.id;
		checkModified();
	}
	
	document.getElementById("selDatabase").onchange = function() {
		top.globalParameter = this.id;
		checkModified();
	}
	
	document.getElementById("showHiddenData").onclick = showHiddenData;
}


// -----------------------------------------------------------------------------
function setEventHandlers()
// -----------------------------------------------------------------------------
{
	setHeaderEvents();
	setToolbarEvents();
	setSearchFormEvents();
	setEditionFormEvents();
	setControlFormEvents();
}
