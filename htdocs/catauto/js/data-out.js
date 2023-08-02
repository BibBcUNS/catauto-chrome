/* =============================================================================
 * Catalis - data-out.js
 *
 * Funciones encargadas de generar los distintos tipos de salidas a
 * partir del registro bibliográfico activo.
 *
 * (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
 * Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
 * =============================================================================
 */

// -----------------------------------------------------------------------------
function padWithZeros(num, totalLength)
// Rellena num con ceros a la izquierda, hasta completar totalLength posiciones
// -----------------------------------------------------------------------------
{
	var dummy;
	dummy = "00000".substr(0,totalLength).concat(num);   // ATENCION: ¿concat() no es standard?

	dummy = dummy.substr(dummy.length-totalLength,totalLength);
	return dummy;
}

// -----------------------------------------------------------------------------
function invalidChars(subfield)
// Detecta caracteres que no son admisibles en un subcampo.
// -----------------------------------------------------------------------------
{
	var invalidChars = "";
	for (var i=0; i < subfield.length; i++) {
		if ( subfield.charCodeAt(i) < 32 ) {
			invalidChars = subfield.charCodeAt(i);
			break;
		}
	}
	return invalidChars;
	
}


// -----------------------------------------------------------------------------
function serialize008()
// Construye el campo 008 a partir de los datos esparcidos por el formulario
// -----------------------------------------------------------------------------
{
	var form = document.getElementById("marcEditForm");
	var f008 = "";
	f008 += form.f008_00_05.value;
	// Registro nuevo: asignamos fecha de creación ==> esto debe hacerse en el servidor
	//<field action="replace" tag="9800"><pft>if a(v9800) then s(date)*2.6 fi</pft></field>
	f008 += form.f008_06.value;
	f008 += form.f008_07.value;
	f008 += form.f008_08.value;
	f008 += form.f008_09.value;	
	f008 += form.f008_10.value;
	f008 += form.f008_11.value;
	f008 += form.f008_12.value;
	f008 += form.f008_13.value;
	f008 += form.f008_14.value;
	f008 += form.f008_15.value;
	f008 += form.f008_16.value;
	f008 += form.f008_17.value;
	f008 += "##########";
	f008 += form.f008_28.value;
	f008 += form.f008_29.value;
	f008 += "##";
	f008 += form.f008_32.value;
	f008 += form.f008_33.value;
	f008 += "####";
	f008 += form.f008_38.value;
	f008 += form.f008_39.value;
	return f008;
}




// -----------------------------------------------------------------------------
function serializeRecord(leader, controlFields, dataFields, localData)
// Los parámetros son variables booleanas.
// -----------------------------------------------------------------------------
{
	var form = document.getElementById("marcEditForm");
	var marcFields = "";

	if ( leader ) {
		// Datos del leader
		marcFields += "\n905 " + form.L_05.value;
		marcFields += "\n906 " + form.L_06.value;
		marcFields += "\n917 " + form.L_17.value;
	}

	if ( controlFields ) {
		// Campo 008
		var f008 = serialize008();
		marcFields += "\n008 " + f008;
	}

	// Campos de datos
	var fieldContainers = getDatafields();
	
	for (var i=0; i < fieldContainers.length; i++) {
	
		var subfields = getSubfields(fieldContainers[i]).replace(/ \.(?=\^|$)/g,".");
		if ( subfields.search(REGEX_EMPTY_SUBFIELD) == -1 ) {  // Ignoramos campos sin datos
			var tag = fieldContainers[i].tag;
			var ind = getIndicators(fieldContainers[i]);
			/*
			if ( tag.search(/245|440/) != -1 ) {
				// remove non sorting delimiters
				subfields = subfields.replace(/[{}]/g,"");
			}
			*/
			if ( invalidChars(subfields) != "" ) {
				alert("El campo " + tag + " contiene caracteres no aceptables (código ASCII = " + invalidChars(subfields) + "). Debe quitarlos para poder continuar.\n\nPosible explicación: si usted copió y pegó texto procedente de alguna fuente externa, asegúrese de que en el mismo no queden caracteres de tabulación o saltos de línea.");
				return false;
			} else {
				marcFields += "\n" + tag + " " + ind + subfields;
			}
		}

		// 980: PostIt note

/*		if ( postItNote != "" ) {
			marcFields += "\n980 " + postItNote.replace(/\r\n/g,"\\r\\n");
			// ATENCION: \r\n solo en Windows?
		}
	*/	

	/* 991 esto lo sa1que el 25 de agosto de 2008.... pone el usuario
		marcFields += ( form.createdBy.value != "" )
		             ? "\n991 " + form.createdBy.value.replace(/\s|\[|\]/g,"")		            
					 : "\n991 " + form.userid.value;
	*/
	
		
	}
	return marcFields.replace(/^\n/,"");  // quitamos salto de línea inicial
}


// -----------------------------------------------------------------------------
function buildISO2709()
// Devuelve leader, directory, fields.
//
// TO-DO: agregar campos 001, 003, 005, 006, 007 -- Reemplazar # por space
// -----------------------------------------------------------------------------
{
	var form = document.getElementById("marcEditForm");

	// Creamos un array con un elemento para cada campo
	var fields = new Array();
	var f008 = serialize008().replace(/#/g," ");	//TO-DO: corregir pos. 00-05
	fields.push("008 " + f008);
	var fieldContainers = getDatafields();
	for (var i=0; i < fieldContainers.length; i++) {
		var subfields = getSubfields(fieldContainers[i]).replace(/ \.(?=\^|$)/g,".");
		if ( subfields.search(REGEX_EMPTY_SUBFIELD) == -1 ) {  // Ignoramos campos sin datos
			var tag = fieldContainers[i].tag;
			var ind = getIndicators(fieldContainers[i]).replace(/#/g," ");
			/*
			if ( "245" == tag ) {  // remove non sorting delimiters
				subfields = subfields.replace(/[{}]/g,"");
			}
			*/
			fields.push(tag + " " + ind + subfields);
		}
	}

	var startPos = "00000";
	var directory = new Array();
	var body = "";
	for (var i=0; i < fields.length; i++) {
		var tag = fields[i].substr(0,3);
		var fieldValue = fields[i].substr(4).replace(REGEX_SYSTEM_SUBFIELD_DELIMITER, ISO_SUBFIELD_DELIMITER);
		var fieldLength = padWithZeros(fieldValue.length + 1,4);
		directory.push(tag.concat(fieldLength, startPos));  // 3 + 4 + 5  // ATENCION: concat() no es standard?
		body += fieldValue + ISO_FIELD_TERMINATOR;
		startPos = padWithZeros(parseFloat(startPos) + parseFloat(fieldLength), 5);
	}
	
	// Ordenamos el directorio por tag.
	// "Order of entries.  Directory entries for control fields precede entries for data fields.
	// Entries for control fields are sequenced by tag in increasing numerical order.
	// Entries for data fields are arranged in ascending order according to the first character
	// of the tag, with numeric characters preceding alphabetic characters."
	// Fuente: http://www.loc.gov/marc/specifications/specrecstruc.html#direct
	function directorySort(d1,d2) {
		var firstChar1 = d1.substr(0,1);
		var firstChar2 = d2.substr(0,1);
		if ( firstChar1 == "0" && firstChar2 == "0" )
			return d1.substr(0,3) - d2.substr(0,3);   // both control fields --> use complete tag
		else
			return d1.substr(0,1) - d2.substr(0,1);   // both data fields, or mixed --> use 1st character
	}
	directory = directory.sort(directorySort);
	
	directory = directory.join("");  // conversión de Array a String
	
	directory += ISO_FIELD_TERMINATOR;
	body += ISO_RECORD_TERMINATOR;
	
	// Leader components
	var recordLength = padWithZeros(24 + directory.length + body.length,5);
	var recordStatus = form.L_05.value;
	var recordType = form.L_06.value;
//	var codingScheme = form.L_09.value;
	var codingScheme = "#";
	var baseDataAddress = padWithZeros(24 + directory.length,5);
	var encLevel = form.L_17.value;

	var leader = recordLength + recordStatus 
				+ recordType + "##" 
	            + codingScheme + "22" + baseDataAddress
	            + encLevel + "##4500";

	leader = leader.replace(/#/g," ");
	
	//alert(leader + "\n\n" + directory + "\n\n" + body);
	
	var isoRecord = new Object();
	isoRecord.leader = leader;
	isoRecord.directory = directory;
	isoRecord.body = body;
	
	return isoRecord;
}


// -----------------------------------------------------------------------------
function exportRecord()
// Abre una ventana en la cual presenta el registro ISO2709 construido
// a partir del registro actual.
// -----------------------------------------------------------------------------
{
	var isoRecord = buildISO2709();
	var isoString = isoRecord.leader + isoRecord.directory + isoRecord.body;
	var winProperties = "width=700, height=400, top=50%, left=50%, resizable=yes, scrollbars=yes, menubar=yes";
	newWin = window.open("", "", winProperties);
	newWin.focus();
	
	//newWin.document.write("<title>Exportación de registros</title>");
	//newWin.document.write("<pre>" + isoString + "</pre>");
	
	// Queremos mostrar solo ASCII, y no HTML, de modo que se
	// pueda usar el File->Save del browser para guardar el registro
	
	/*var newPRE = document.createElement("pre");
	newWin.document.body.appendChild(newPRE);
	newPRE.innerHTML = isoString;
	return;*/
	
	// ATENCION: es importante el orden de las dos líneas siguientes
	newWin.document.write('<h1 style="font-size: 110%;">Exportación del registro</h1>');
    newWin.document.write('<p>Para utilizarlo en otra aplicación, seleccione y copie el contenido del área coloreada.</p>');
    newWin.document.write('<textarea rows="20" cols="90" style="background: #FED;">' + isoString + '</textarea>');
    newWin.document.title = "Exportación";
	
	// TO-DO: usar para el title el número de registro
	// Deshabilitar line-wrap?
}


// -----------------------------------------------------------------------------
function viewRecord()
// Presenta una ventana con la ficha AACR2 y la lista de campos MARC
// -----------------------------------------------------------------------------
{
	// 1. Construcción de la ficha
	
	var fieldContainers = getDatafields();
	var marcDatafields = new Array();
	for (var i=0; i < fieldContainers.length; i++) {
		var subfields = getSubfields(fieldContainers[i]).replace(/ \.(?=\^|$)/g,".");
		if ( subfields.search(REGEX_EMPTY_SUBFIELD) == -1 ) {	// Ignoramos campos sin datos
			var tag = fieldContainers[i].tag;
			var ind = getIndicators(fieldContainers[i]);
			/*
			if ( tag.search(/245|440/) != -1 ) {	// remove non sorting delimiters
				subfields = subfields.replace(/[{}]/g,"");
			}
			*/
			marcDatafields.push(tag + " " + ind + subfields);
		}
	}
	
	var form = document.getElementById("marcEditForm");
	var f001 = form.f001.value;
	var f005 = form.f005.value;
	var f008 = serialize008();
	var fichaHTML = marc2aacr(f001,f005,f008,marcDatafields);
	

	// 2. Construcción de la lista de campos MARC

	var form = document.getElementById("marcEditForm");
	var leader = form.L_05.value + form.L_06.value +  form.L_17.value;
	var f001 = form.f001.value;
	var f003 = form.f003.value;
	var f005 = form.f005.value;
	var f008 = serialize008();
	var marcTagged = marc2marcTagged(leader, f001, f003, f005, f008, marcDatafields);


	// Capturamos el error que se produce al usar la referencia a la ventana cuando ésta ya fue cerrada
	try {
		var tmp = modelessWin.document;
	}
	catch(err) {
		displayWindowClosed = true;
	}

	// Creamos la ventana
	if ( displayWindowClosed ) {
		var dialogHeight = 350;
		var dialogWidth = 660;
		var winProperties = "dialogHeight: " + dialogHeight + "px; ";
		winProperties += "dialogWidth: " + dialogWidth + "px; ";
		winProperties += "dialogTop: 25px; ";
		//winProperties += "dialogLeft: " + (screen.width - 553) + "px; ";
		winProperties += "resizable: yes; scroll: yes; status: no; help: no";
		//alert(winProperties);
		modelessWin = showModelessDialog(URL_RECORD_VISUALIZATION, window, winProperties);
		displayWindowClosed = false;
	}

	// Este loop es para librarnos del error al abrir la ventanita por primera vez
	var popupOK = false;
	while( !popupOK ) {
		try {
			var tmp = modelessWin.document.getElementById("aacrDiv").innerHTML;
			popupOK = true;
		}
		catch (err) {   // Sólo se ejecuta si se produjo un error
			popupOK = false;
		}
	}
	
	
	// Actualizamos el contenido de la ventana
	modelessWin.document.getElementById("aacrDiv").innerHTML = fichaHTML;
	
	modelessWin.document.getElementById("chkAccess").checked = true;
	modelessWin.document.getElementById("chkDescription").checked = true;
	modelessWin.document.getElementById("marcDiv").innerHTML = marcTagged;
	modelessWin.document.getElementById("chkSubfieldSplit").checked = false;
	
	// Y ajustamos su altura, para que se aprecie mejor el contenido.
	updateDialogHeight(modelessWin);
}


// -----------------------------------------------------------------------------
function saveRecord()
// Envía el registro al servidor para su grabación.
// -----------------------------------------------------------------------------
{
	// Sólo grabamos si hubo alguna modificación
	if ( !modifiedRecord() ) {
		var msg = "El registro no ha sido modificado, y por lo tanto no es necesario volver a grabarlo.";
		catalisMessage(msg,true);
		return;
	}
	
		
	// Llamamos a una función de validación
	var msg = marcValidate();
	if ( msg != "" ) {
		msg = "Hay algunos problemas con este registro: <ol>" + msg + "</ol>";
		catalisMessage(msg,true);
		return;
	}
	
		
	var marcFields = serializeRecord(true,true,true,true);
	//alert(marcFields);
	if ( !marcFields ) {  // en caso de que haya caracteres no válidos
		alert("Error en saveRecord()");
		return;
	}
	
	var message = "DATOS QUE SE ENVIAN PARA SER GRABADOS<p>\nNï¿½mero de registro: " + document.getElementById("marcEditForm").f001.value;
    message += "<div id='dataToBeSaved'><pre>" + marcFields + "</pre></div>";

    // suspendemos el cuadro de confirmaciï¿½n (FG, 06/sep/2005)
    // lo volvemos a activar, ya que de lo contrario se pueden llegar a grabar datos en forma accidental (FG, 16/sep/2005)

    //-------------(M.A) Funcion copiada de aux-windows.js:
    var winProperties = "dialogWidth:" + 640 + "px; dialogHeight:" + 460 + "px; status:no; help:no";
    //if ( "left" == pos ) winProperties += "; dialogLeft:10px";

    // Mostramos la ventana
    var answer = window.showModalDialog(URL_CONFIRM_DIALOG, message, winProperties);
    //---------------

    if (answer == true) {
    
        //if ( !catalis_confirm(message,640,460) ) {
        //    return false;
        //}
    
        // Cartelito
        catalisMessage(document.getElementById("grabandoRegistro").innerHTML);
    
        var form = document.getElementById("hiddenFORM");
        form.marcFields.value = serializeRecord(true,true,true,true);//marcFields;
    
        form.recordID.value = document.getElementById("marcEditForm").f001.value;
        form.tarea.value = "GRABAR_REG";
        form.method = "POST";  // method="GET" genera errores, como es de esperar
        form.target = "hiddenIFRAME";
        //form.debug = "1";
    
        form.submit();
    }
}
