/* =============================================================================
 * Catalis - import.js
 *
 * Funciones encargadas de la importaci�n de registros MARC.
 *
 * (c) 2003-2005  Fernando J. G�mez - CONICET - INMABB
 *  V�ase el archivo LICENCIA.TXT incluido en la distribuci�n de Catalis
 * =============================================================================
 */









// -----------------------------------------------------------------------------
function getIsoRecord()
// Presenta un cuadro de di�logo para ingresar un registro ISO 2709.
// -----------------------------------------------------------------------------
{
	if (ie) {
		var winProperties = "font-size:10px; dialogWidth:580px; dialogHeight:330px; status:no; help:no; resizable:yes";
		var isoRecord = showModalDialog(URL_IMPORT_RECORD, null, winProperties);
		if ( "undefined" == typeof(isoRecord) ) {
			return;  // abortamos
		}
		importRecord(isoRecord);
	} else if (moz) {
		openSimDialog(URL_IMPORT_RECORD, 580, 330, importRecord);
		return;
		
		// La ventana de di�logo pasa el control a importRecord()
	}
	
}


// -----------------------------------------------------------------------------
function importRecord(isoRecord)
// Llama a la funci�n que hace el parsing del registro, y presenta el
// registro en el formulario de edici�n.
// -----------------------------------------------------------------------------
{
	if ( "" == isoRecord ) {
		return;	
	}
	
	// TO-DO: rechazar inputs "equivocados" 
	
	// Hacemos el parsing del registro
	var importedRecord = parseISO2709(isoRecord);
	
	// Y ahora lo presentamos en el formulario
	
	showEditDiv();

	selectedSubfieldBox = null;
	selectedField = null;

	var form = document.getElementById("marcEditForm");
	
	// Datafields
	renderDatafields(importedRecord.datafields.split(/\n/));

	// recordID
	form.recordID.value = "New";
	
	// Leader
	var leaderData = "";
	leaderData += importedRecord.leader.substr(5,1);
	leaderData += importedRecord.leader.substr(6,1);
	leaderData += importedRecord.leader.substr(17,1);
	renderLeader(leaderData);

	// Control fields (00x)
	form.f001.value = "[pendiente]";
	form.f003.value = "";
	form.f005.value = "";
	form.f005_nice.value = "";
	// ATENCION: �nos interesa conservar como "fecha de creaci�n" la que
	// trae el registro importado?
	form.f008_00_05.value = importedRecord.f008.substr(0,6);
	var century = ( importedRecord.f008.substr(0,2) > 66 ) ? "19" : "20";
	form.f008_00_05_nice.value = importedRecord.f008.substr(4,2) + " ";
	form.f008_00_05_nice.value += MONTH_NAME[importedRecord.f008.substr(2,2)] + " ";
	form.f008_00_05_nice.value += century + importedRecord.f008.substr(0,2);
	form.createdBy.value = "";
	//var leader06 = importedRecord.leader.substr(6,1);
	//var leader07 = importedRecord.leader.substr(7,1);
	//var materialType = getMaterialType(leader06,leader07);

	renderField008(importedRecord.f008);
	
	// C�digos adicionales: 041, 044, 046, 047
	// (En base a la presencia de �stos, "encender" los respectivos botones)

	// Post-it note: vac�a
	postItNote = "";
	document.getElementById("postItNoteBtn").style.backgroundColor = "";
	document.getElementById("postItNoteBtn").title = "";


	// Record OK: false
	//form.recordOK.checked = false;
	//form.recordOK.parentNode.className = "recordNotOK";
	
	// Ejemplares: cero
	
	// Buttons
	
	document.getElementById("btnGrabar").disabled = false;
	document.getElementById("btnGrabar").style.backgroundImage = "url('" + HTDOCS + "img/stock_save-16.png')";
	document.getElementById("btnBorrar").disabled = true;
	
	// Actualizamos el navegadorcito de la lista de resultados
	document.getElementById("resultNavigation_block").style.visibility = "hidden";

	refreshTitleBar();
	
	// Original record state = "empty" (not saved yet)
	originalRecord = "*";

	// Advertencia en caso de importar registros pre-AACR2
	/*
	var leader_18 = importedRecord.leader.substr(18,1);
	if ( "a" != leader_18 ) {
			var descCatalForm;
			switch (leader_18) {
				case "#" :
					descCatalForm = "no ISBD";
					break;
				case "i" :
					descCatalForm = "ISBD";
					break;
				case "u" :
					descCatalForm = "desconocido";
					break;
				default :
					descCatalForm = "valor incorrecto";
			}
		var message = "";
		message += "Atenci�85n: este registro parece no haber sido creado usando AACR2:";
		message += " la posici�n 18 de la cabecera tiene el valor '" + leader_18 + "' (" + descCatalForm + ").";
		message += "<br><br>El registro es v�lido, pero debe revisarlo atentamente (especialmente en cuanto a puntuaci�n y/o puntos de acceso),";
		message += " para que resulte consistente con AACR2.";
		message += "<br><br>Para su comodidad, algunas correcciones ya han sido realizadas autom�ticamente.";
		
		catalisMessage(message, true);
	
	}
	*/
	// Foco al primer subcampo del primer campo
	var container = document.getElementById("recordContainer_access");
	firstSubfieldBox(container.firstChild).focus();
}

// -----------------------------------------------------------------------------
function DGM_translate(dgm)
// Tabla de conversi�n English-castellano, usada al importar registros.
// TO-DO: Completar la lista.
// -----------------------------------------------------------------------------
{
	var newDgm = dgm;
	switch (dgm) {
		case "graphic"               : newDgm = "gr�fico"; break;
		case "sound recording"       : newDgm = "grabaci�n sonora"; break;
		case "videorecording"        : newDgm = "videograbaci�n"; break;
		case "cartographic material" : newDgm = "material cartogr�fico"; break;
		case "electronic resource"   : newDgm = "recurso electr�nico"; break;
		case "computer file"         : newDgm = "archivo de computadora"; break;
	}
	return newDgm;
}



// -----------------------------------------------------------------------------
function modifyImportedField(tag,ind,sf)
// Modificaci�n de campos de datos: incluye correcciones por cambios en las
// reglas (registros pre-AACR2), por cambios en el formato MARC, y traducciones
// al espa�ol.
//
// TO-DO: cada modificaci�n deber�a tener un nombre asignado, y deber�a poder
// configurarse el sistema para que s�lo se apliquen las modificaciones deseadas.
// Adem�s, el sistema debe generar un log con las modificaciones que hizo, para
// que el catalogador pueda verificarlas si quisiera hacerlo.
//
// TO-DO:
//   nombres personales con 1st indicator = 2 --> 1
//   Editor/compilador en campo 100 (pre-1974?)
//   "Edited by" --> "edited by" en 245$c.
//   245 $h [GMD] --> viene sin corchetes en registros viejos (pre-1994?)
// -----------------------------------------------------------------------------
{
	switch (tag) {
		
		case "020" :
			// Si hay m�s de un subcampo $a, creamos campos 020 adicionales
			if ( sf.search(/\^a.+\^a/) != -1 ) {
				sf = sf.substr(0,4) + sf.substr(4).replace(/\^a/g,"\n020 ##^a");
			}
			break;
			
		case "100" :
			ind = ind.replace(/2(.)/,"1$1");  // 1st ind = 2 is obsolete
			break;
		
		case "700" :
			sf = sf.replace(/,\^ejoint author\.?/,".").replace(/\.\.$/,".");
			sf = sf.replace(/\^e(.+)(?=\^|$)/g,"^e$1^4");
			// TO-DO: algunos $e se pueden mapear directamente a $4; e.g. "ed." a "edt".
			ind = ind.replace(/2(.)/,"1$1");  // 1st ind = 2 is obsolete
			break;
	}
	
	var modifiedField = { indicators : ind, subfields : sf };
	return modifiedField;
}


// -----------------------------------------------------------------------------
function parseISO2709(isoRecord)
// Input: string con un registro ISO 2709
// Output: array (string leader, string fields)
// -----------------------------------------------------------------------------
{
	var REGEX_DGM = new RegExp(ISO_SUBFIELD_DELIMITER + "h\\[(.+)\\]");
	var leader, f001, f003, f005, f008;
	var datafields = "";
	
	var leader = isoRecord.substr(0,24).replace(/ /g,"#");
	var baseAddress = leader.substr(12,5) * 1;
	var pos = 12;
	
	// Campos que *no* queremos importar
	//   a) en general  (LC 249 en SER?)
	var NO_IMPORT_TAGS = "001|035|09.|590|9..";
	//   b) dependiendo de la base (ATENCION: esto debe almacenarse en un archivo de config.)

	var REGEX_NO_IMPORT_TAGS = new RegExp(NO_IMPORT_TAGS);
	
		loadAnselToLatin1Maps();
	
	// Loop sobre los elementos del directorio
	while ( pos + 12 < baseAddress - 1 ) {
		pos += 12;
		var directoryEntry = isoRecord.substr(pos,12);
		var tag = directoryEntry.substr(0,3);
		if ( tag.search(REGEX_NO_IMPORT_TAGS) != -1 ) {
			continue;
		}
		var fieldLength = directoryEntry.substr(3,4) * 1;
		var startPos = directoryEntry.substr(7,5) * 1;
		
		var fieldContent = isoRecord.substr(baseAddress + startPos, fieldLength - 1);
		
		// Si el campo contiene alg�n '^', le anteponemos una barra para no confundirlo
		// luego con un delimitador de subcampo
		// TO-DO: esto reci�n funcionar� cuando se revise en todos los scripts el uso
		// de '^' como delimitador de subcampo
		/*if ( "^" == SYSTEM_SUBFIELD_DELIMITER ) {
			fieldContent = fieldContent.replace(/\^/g,"\x5C" + "\x5E");
		}*/
		
		// Y ahora, entra en escena el '^', delimitador de subcampos de ISIS
		fieldContent = fieldContent.replace(REGEX_ISO_SUBFIELD_DELIMITER,SYSTEM_SUBFIELD_DELIMITER);
		
		// ATENCION: revisar el c�digo que sigue.
		// TO-DO: en el campo 008/00-06, poner la fecha de hoy
		
		if ( tag.search(/00\d/) != -1 ) {  // controlfields
			
			switch (tag) {
				case "001" :
					f001 = fieldContent.replace(/ /g,"#") + "\n";
					break;
				case "003" :
					f003 = fieldContent.replace(/ /g,"#") + "\n";
					break;
				case "005" :
					f005 = fieldContent.replace(/ /g,"#") + "\n";
					break;
				case "008" :
					f008 = fieldContent.replace(/ /g,"#") + "\n";
					break;
				default :
					datafields += tag + " " + fieldContent.replace(/ /g,"#") + "\n";
					break;
			}
			
		} else {    // datafields
			
			// Conversi�n MARC-8 (ANSEL) -> Latin-1
			fieldContent = anselToLatin1(fieldContent);
			if ( "010" == tag ) {
				fieldContent = fieldContent.replace(/ /g,'#');
			}
			
			var indicators = fieldContent.substr(0,2).replace(/ /g,'#');
			var subfields = fieldContent.substr(2);
			
			// Modificaci�n de datos (para registros pre-AACR2 y en general)
			if ( /*"a" != leader.substr(18,1) && MODIFY_NOT_AACR2 &&*/ tag.search(/020|041|100|260|700/) != -1 ) {
				var modifiedField = modifyImportedField(tag,indicators,subfields);
				indicators = modifiedField.indicators;
				subfields = modifiedField.subfields;
			}
			
			datafields += tag + " " + indicators + subfields + "\n";
		}
	}
	
	// Campos extra agregados al importar (dependen de la base)
	var extraDatafields = new Array();
	
	for ( var i=0; i < extraDatafields.length; i++ ) {
		datafields += extraDatafields[i].substr(0,3) + " ";
		datafields += extraDatafields[i].substr(4,2).replace(/ /g,'#');
		datafields += extraDatafields[i].substr(6);
		datafields += "\n";
	}

	var importedRecord = {
		leader     : leader,
		f005       : f005,
		f008       : f008,
		datafields : datafields
	};
	
	return importedRecord;
}

// -----------------------------------------------------------------------------
function loadAnselToLatin1Maps()
// Basado en la norma ANSI/NISO Z39.47-1993(R2002), Extended Latin Alphabet Coded
// Character Set for Bibliographic Use (tambi�n conocida como "ANSEL"). El documento
// est� disponible en la Web.
//
// �Qu� hacemos con los diacr�ticos y s�mbolos que no est�n en Latin-1? Podr�amos
// reemplazarlos tambi�n por sus nombres, y que luego el catalogador haga lo que
// considere apropiado. Atenci�n: algunos de esos caracteres s� est�n en Windows 1252,
// p. ej. la ligadura OE.
// -----------------------------------------------------------------------------
{
	anselToName = new Object();
	anselToName = {
		// diacr�ticos (s�lo los presentes en Latin-1)
		'\xE1' : '{GRAVE_ACCENT}',
		'\xE2' : '{ACUTE_ACCENT}',
		'\xE3' : '{CIRCUMFLEX_ACCENT}',
		'\xE4' : '{TILDE}',
		'\xE8' : '{DIAERESIS}',
		'\xEA' : '{CIRCLE_ABOVE}',
		'\xF0' : '{CEDILLA}',
		
		// caracteres especiales (s�lo los presentes en Latin-1)
		'\xA2' : '{SLASH_O_UPPERCASE}',
		'\xA3' : '{SLASH_D_UPPERCASE}',
		'\xA4' : '{THORN_UPPERCASE}',
		'\xA5' : '{LIGATURE_AE_UPPERCASE}',
		'\xA8' : '{MIDDLE_DOT}',
		'\xAA' : '{PATENT_MARK}',
		'\xAB' : '{PLUS_OR_MINUS}',
		'\xB2' : '{SLASH_O_LOWERCASE}',
		'\xB3' : '{SLASH_D_LOWERCASE}',
		'\xB4' : '{THORN_LOWERCASE}',
		'\xB5' : '{LIGATURE_AE_LOWERCASE}',
		'\xB9' : '{BRITISH_POUND}',
		'\xC0' : '{DEGREE_SIGN}',
		'\xC3' : '{COPYRIGHT_MARK}',
		'\xC5' : '{INV_QUESTION_MARK}',
		'\xC6' : '{INV_EXCLAMATION_MARK}'
	};

	nameToLatin1 = new Object();
	nameToLatin1 = {
		// diacr�ticos (s�lo consideramos las combinaciones presentes en Latin-1)
		'{ACUTE_ACCENT}A' : '�',
		'{ACUTE_ACCENT}a' : '�',
		'{ACUTE_ACCENT}E' : '�',
		'{ACUTE_ACCENT}e' : '�',
		'{ACUTE_ACCENT}I' : '�',
		'{ACUTE_ACCENT}i' : '�',
		'{ACUTE_ACCENT}O' : '�',
		'{ACUTE_ACCENT}o' : '�',
		'{ACUTE_ACCENT}U' : '�',
		'{ACUTE_ACCENT}u' : '�',
		'{ACUTE_ACCENT}Y' : '�',
		'{ACUTE_ACCENT}y' : '�',
		
		'{GRAVE_ACCENT}A' : '�',
		'{GRAVE_ACCENT}a' : '�',
		'{GRAVE_ACCENT}E' : '�',
		'{GRAVE_ACCENT}e' : '�',
		'{GRAVE_ACCENT}I' : '�',
		'{GRAVE_ACCENT}i' : '�',
		'{GRAVE_ACCENT}O' : '�',
		'{GRAVE_ACCENT}o' : '�',
		'{GRAVE_ACCENT}U' : '�',
		'{GRAVE_ACCENT}u' : '�',
		
		'{CIRCUMFLEX_ACCENT}A' : '�',
		'{CIRCUMFLEX_ACCENT}a' : '�',
		'{CIRCUMFLEX_ACCENT}E' : '�',
		'{CIRCUMFLEX_ACCENT}e' : '�',
		'{CIRCUMFLEX_ACCENT}I' : '�',
		'{CIRCUMFLEX_ACCENT}i' : '�',
		'{CIRCUMFLEX_ACCENT}O' : '�',
		'{CIRCUMFLEX_ACCENT}o' : '�',
		'{CIRCUMFLEX_ACCENT}U' : '�',
		'{CIRCUMFLEX_ACCENT}u' : '�',
		
		'{DIAERESIS}A' : '�',
		'{DIAERESIS}a' : '�',
		'{DIAERESIS}E' : '�',
		'{DIAERESIS}e' : '�',
		'{DIAERESIS}I' : '�',
		'{DIAERESIS}i' : '�',
		'{DIAERESIS}O' : '�',
		'{DIAERESIS}o' : '�',
		'{DIAERESIS}U' : '�',
		'{DIAERESIS}u' : '�',
		'{DIAERESIS}y' : '�',
		
		'{TILDE}A' : '�',
		'{TILDE}a' : '�',
		'{TILDE}O' : '�',
		'{TILDE}o' : '�',
		'{TILDE}N' : '�',
		'{TILDE}n' : '�',
		
		'{CEDILLA}C' : '�',
		'{CEDILLA}c' : '�',
		
		'{CIRCLE_ABOVE}A' : '�',
		'{CIRCLE_ABOVE}a' : '�',
		
		// caracteres especiales
		'{INV_EXCLAMATION_MARK}'  : '�',
		'{INV_QUESTION_MARK}'     : '�',
		'{BRITISH_POUND}'         : '�',
		'{COPYRIGHT_MARK}'        : '�',
		'{PATENT_MARK}'           : '�',
		'{DEGREE_SIGN}'           : '�',
		'{PLUS_OR_MINUS}'         : '�',
		'{MIDDLE_DOT}'            : '�',
		'{LIGATURE_AE_UPPERCASE}' : '�',
		'{LIGATURE_AE_LOWERCASE}' : '�',
		'{SLASH_D_UPPERCASE}'     : '�',
		'{SLASH_O_UPPERCASE}'     : '�',
		'{SLASH_O_LOWERCASE}'     : '�',
		'{SLASH_D_LOWERCASE}'     : '�',
		'{THORN_LOWERCASE}'       : '�',
		'{THORN_UPPERCASE}'       : '�'
	};
}


// -----------------------------------------------------------------------------
function anselToLatin1 (text) {
// Conversi�n de caracteres codificados en ANSEL a LATIN 1.
// Necesitamos dos pasos para evitar la conversi�n de caracteres ya convertidos.
// -----------------------------------------------------------------------------
	// Paso 1: Reemplazamos caracteres especiales ANSEL por sus nombres
	for (c in anselToName) {
		var re = new RegExp (c,'g');
		text = text.replace(re,anselToName[c]); 
	}
	
	// Paso 2: Reemplazamos los nombres por caracteres LATIN-1
	for (c in nameToLatin1) {
		var re = new RegExp (c,'g');
		text = text.replace(re,nameToLatin1[c]);
	}
	
	return text;
}

