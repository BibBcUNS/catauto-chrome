// =============================================================================
//  Catalis - aacr2marc.js
//
//  Conversor de asientos AACR2 a "proto-MARC".
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================








// -----------------------------------------------------------------------------
function aacr2marc (aacrText)
// -----------------------------------------------------------------------------
{
	// Input:  String con un asiento AACR2.
	// Output: Array con elementos del formulario.

	// Sería bueno que aceptara como separadores de áreas tanto al 
	// "--" como al "\r\n"
	
	// ATENCION: hay que trasladar los números normalizados (ISBN, ISSN) hacia
	// arriba en la lista?
	
	// Algunas de las expresiones regulares que necesitaremos

	var RE_AREA_SEP = /\s[\u2013\u2014]\s|\s--\s/;
	var RE_SUBDIV   = /\s?[\u2013\u2014]\s?|\s?--\s?/g;
	var RE_DATES    = /, (\d{4})-|, (ca\. ?\d{4})-/;
	
	// Cómo quedan separados los campos (no necesitamos separar si devolvemos un array)
	var FIELD_SEP = "";  //"\r\n";
	
	// Cómo se visualiza el delimitador de subcampos
	var DISP_SF_DELIM = SYSTEM_SUBFIELD_DELIMITER;
	
	// Inicializamos el array que será devuelto por esta función
	var marc = new Array();
	marc["datafields"] = new Array();
	marc["f008_06"] = "s";
	//marc["f008_07_10"] = "####";
	//marc["f008_11_14"] = "####";
	
	//marc["f008_15_17"] = "xx#";
	
	var tag, ind;
	
	// Eliminamos saltos de línea dobles, y espacios o tabs múltiples
	aacrText = aacrText.replace(/\r\n\r\n/g,"\r\n").replace(/ +|\t+/g," "); // usamos /\s+/ ?
	
	// Aceptamos un guión simple como separador de áreas (a pedido de AOE)
	aacrText = aacrText.replace(/\. - /g,". -- ");

	// TO-DO: ¿hay que hacer una limpieza de caracteres "extraños", tales como
	// comillas dobles, simples, etc?
	// Ejemplos: “(8220)  ”(8221)  ‘(8216)  ’(8217)
	
	// Para examinar qué caracteres están presentes en el asiento:
	/*
	output = "<table border=1 cellpadding=10>";
	for (var i=0; i<aacrText.length; i++) {
		output += "<tr><td>" + aacrText.charAt(i) + "</td><td>" + aacrText.charCodeAt(i) + "</td></tr>\n";
	}
	output += "</table>";
	document.write(output);
	*/
	
	var paragraphs = aacrText.split(/\r\n/);

	// ¿Tenemos un campo 1xx? (i.e. un párrafo inicial sin separador de áreas)
	if ( paragraphs[0].search(RE_AREA_SEP) == -1 )	{ 
		var indexArea1 = 1; 
		var mainEntryHeading = paragraphs[0].replace(/^ /,'');
	}
	else {
		var indexArea1 = 0;
	}

	var titlePar = paragraphs[indexArea1].replace(/^ /,'');
	var physDescPar = paragraphs[indexArea1+1].replace(/^ /,'');
		
	if ( mainEntryHeading )	{ 
		tag = '1' + UNK + UNK;
		ind = UNK + UNK;
		marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + mainEntryHeading.replace(RE_DATES, "," + DISP_SF_DELIM + "d$1$2-").replace(/, ed.$/,"," + DISP_SF_DELIM + "eed.") + FIELD_SEP);
	}

	var areas = titlePar.split(RE_AREA_SEP);
	
	// Título
	// 2do indicador: non sorting characters
	if ( areas[0].search(/^ ?El |^ ?La /) != -1 ) 
		var ind2 = '3';
	else
	if ( areas[0].search(/^ ?Los |^ ?Las /) != -1 )
		var ind2 = '4';
	else
		var ind2 = '0';


	// Los reemplazos solo se hacen en la primera ocurrencia detectada
	marc["datafields"].push('245 1' + ind2 + ' ' + DISP_SF_DELIM + 'a' + areas[0].replace(/ \/ /,' /' + DISP_SF_DELIM + 'c').replace(/ : /,' :' + DISP_SF_DELIM + 'b') + FIELD_SEP);

	// Edición
	if ( areas.length == 3 )
		marc["datafields"].push('250 ## ' + DISP_SF_DELIM + 'a' + areas[1].replace(/ \/ /,' /' + DISP_SF_DELIM + 'b') + FIELD_SEP);
	
	// Publicación
	areas.reverse();
	var imprint = areas[0];
	var fabricacion = ""; var firstFabricSubfield = "";
	var startFabricacion = imprint.search(/\(.+\)\.?$/);
	if ( startFabricacion != -1 ) {
		var publicacion = imprint.substr(0,startFabricacion-1); 
		var fabricacion = imprint.substr(startFabricacion);
		fabricacion = fabricacion.replace(/ : /g,' :' + DISP_SF_DELIM + 'f').replace(/, (\d{4})/,"," + DISP_SF_DELIM + "g$1");
		// TO-DO: \$ --> usar DISP_SF_DELIM
		if ( fabricacion.search(/ :\$f/) != -1 ) { 
			var firstFabricSubfield = DISP_SF_DELIM + 'e';
		}
		else {
			var firstFabricSubfield = DISP_SF_DELIM + UNK;
		}
	}
	else {
		var publicacion = imprint;
	}
	// TO-DO: falta ajustar detalles en los datos de fabricación
	var field260 = '260 ## ' + DISP_SF_DELIM + 'a' + publicacion.replace(/ : /g,' :' + DISP_SF_DELIM + 'b').replace(/ ; /g,' ;' + DISP_SF_DELIM + 'a').replace(/,\s(c?\d{3,4})/, "," + DISP_SF_DELIM + "c$1");
	field260 += firstFabricSubfield + fabricacion + FIELD_SEP;
	marc["datafields"].push(field260);

	// Tratamos de detectar la fecha para el 008/07-10
	if ( /\$c(\d{4})\./.exec(field260) != null ) {
		marc["f008_06"] = "s";
	//	marc["f008_07_10"] = RegExp.$1;
		//marc["f008_11_14"] = "####";
	}
	// Otros casos? (ver Marc Magician...)
	
	// Tratamos de detectar el lugar para el 008/15-17
	// TO-DO: subcampo $a inicial
	// Idea: el sistema podría "aprender" en base a los registros ya
	// presentes en la base de datos 
	if ( /Buenos Aires|Bahía Blanca|Santa Fe|Rosario|Córdoba/i.exec(field260) != null ) {
		marc["f008_15_17"] = "ag#";
	}
	else if ( /New York|Washington|Boston|Princeton/i.exec(field260) != null ) {
		marc["f008_15_17"] = "xxu";
	} 
	else if ( /Madrid|Barcelona/i.exec(field260) != null ) {
		marc["f008_15_17"] = "sp#";
	}
	else if ( /Bogotá|Medellín/i.exec(field260) != null ) {
		marc["f008_15_17"] = "ck#";
	}
	// Etc. 

	var areas = physDescPar.split(RE_AREA_SEP);
	
	// Si hay una expresión entre paréntesis al final de la descripción física,
	// preguntamos si se trata de una mención de serie (que no fue precedida por
	// raya/guión) (Sugerencia de AOE)
	if ( areas.length == 1 ) {
		var re = /(.+)\s+(\([^\(]+\))$/;
		var match = re.exec(physDescPar);
		if ( match != null && confirm(RegExp.$2 + " es una mención de serie?") ) {
			areas[0] = RegExp.$1;
			areas[1] = RegExp.$2;
			//alert(areas[0] + "\n" + areas[1]);
		}
	}
	
	// ---------------------------------------------------------------------------
	// Descripción física
	// ---------------------------------------------------------------------------
	marc["datafields"].push('300 ## ' + DISP_SF_DELIM + 'a' + areas[0].replace(/ : /,' :' + DISP_SF_DELIM + 'b').replace(/ ; /,' ;' + DISP_SF_DELIM + 'c').replace(/ \+ /,' +' + DISP_SF_DELIM + 'e') + FIELD_SEP);
	
	
	// ---------------------------------------------------------------------------
	// Serie (TO-DO: ¿campo 490? Si la mención incluye un responsable, 
	// no puede ir al 440, debe ser un 490)
	// ---------------------------------------------------------------------------
	if ( areas.length == 2 ) {
		var series = areas[1].split(/\) ?\(/);
		for (var i=0; i < series.length; i++) {
			var serie = series[i].replace(/^\(|\)\.? ?$/g,''); 
		// 2do indicador: non sorting characters
		if ( serie.search(/^ ?El |^ ?La / ) != -1) 
			var ind2 = '3';
		else
		if ( serie.search(/^ ?Los |^ ?Las /) != -1 )
			var ind2 = '4';
		else
			var ind2 = '0';
		marc["datafields"].push('4'+UNK+'0 #' + ind2 + ' ' + DISP_SF_DELIM + 'a' + serie.replace(/\. (\w)/,'.' + DISP_SF_DELIM + UNK + '$1').replace(/ ; /,' ;' + DISP_SF_DELIM + 'v') + FIELD_SEP); //areas[1].substr(1,areas[1].length-3)
			// ATENCION: revisar problema con "Bd. 1", pues se genera un UNK
		}
	}
	
	// ---------------------------------------------------------------------------
	// ISBN, notas, trazado
	// ---------------------------------------------------------------------------
	for (var i=indexArea1+2; i < paragraphs.length; i++) {
		var paragraph = paragraphs[i].replace(/^ /,'');
		if (paragraph.length < 3) continue;
		
		if ( paragraph.search(/^En: /) != -1 ) {
			// Analíticas
			// TO-DO: setear leader
			tag = '773'; 
			ind = UNK + UNK;
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + UNK + paragraph.replace(/^En: /,'') + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^ISBN /) != -1 ) {
			// TO-DO: detección de números incorrectos?
			var areas = paragraph.split(RE_AREA_SEP);
			tag = "020";
			ind = "##";
			for (var j=0; j < areas.length; j++) {
				var isbn = areas[j].replace(/ISBN\s+/,"");  // quitamos "ISBN"
				if ( isbn.substr(0,10).search(/[ \-]/) != -1 ) {
					// quitamos guiones/espacios
					isbn = isbn.substr(0,13).replace(/[ \-]/g,"") + isbn.substr(13);
				}
				isbn = isbn.replace(/\.$/,""); // posible punto final
				marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + isbn + FIELD_SEP);
			}
		}
		else
		
		if ( paragraph.search(/^ISSN /) != -1 ) {
			tag = '022';
			ind = '##';
			var issn = paragraph.replace(/ISSN\s+/,''); // quitamos "ISSN"
			issn = issn.replace(/\.$/,""); // posible punto final
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + issn + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^[ÍI]ndice anal[íi]tico:/) != -1 ) {
			tag = '500';
			ind = '##';
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + paragraph + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^[ÍI]ndice onom[áa]stico:/) != -1 ) {
			tag = '500';
			ind = '##';
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + paragraph + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^Glosario:/) != -1 ) {
			tag = '500';
			ind = '##';
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + paragraph + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^Bibliograf[íi]a|^Bibliography|^Incluye referencias bibliogr[áa]ficas/) != -1 ) {
			tag = '504';
			ind = '##';
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + paragraph + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^Contenido:/) != -1 ) {
			// TO-DO: a veces va $g antes de $t
			tag = '505';
			ind = UNK + UNK;
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + UNK + paragraph.replace(/^Contenido:\s+/,'').replace(/ \/ /g,' /' + DISP_SF_DELIM + 'r').replace(/ (;) | (--) /g," $1$2" + DISP_SF_DELIM + "t") + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^T[íi]tulo alternativo:/) != -1 ) {
			tag = '246';
			ind = UNK + UNK;
			marc["datafields"].push(tag + ind + ' ' + DISP_SF_DELIM + 'a' + paragraph.replace(/^T[í|i]tulo alternativo:\s+/,'') + FIELD_SEP);
		}
		else
		
		if ( paragraph.search(/^Traducido de:|^Traducci[óo]n de:/) != -1 ) {
			// TO-DO: el traductor!
			tag = '765';
			ind = UNK + UNK;
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + UNK + paragraph.replace(/^Traducido de:\s+|^Traducci[óo]n de:\s+/,'') + FIELD_SEP);
		}
		else
		
		// Trazado (comienza con '1. ' o con 'I. ')
		// TO-DO: ver el caso de un heading por línea, como en el OPAC.
		// Esto nos obliga a considerar que cualquier número (no necesariamente 
		// un '1' o un 'I') puede estar al comienzo del párrafo. 
		
		if ( paragraph.search(/^\d{1,2}\. |^[IVX]+\. /) != -1 ) {
			// Separamos en subject y non-subject
			nonSubjBegin = paragraph.search(/^[IVX]+\. | I\. /);
			if ( nonSubjBegin == -1 ) {
				var subjectString = paragraph;
			}	
			else {
				var subjectString = paragraph.substr(0,nonSubjBegin-1);
				var nonSubjectString = paragraph.substr(nonSubjBegin);
			}
			
			if ( subjectString ) {
				var subjectArray = subjectString.split(/^\d{1,2}\. | \d{1,2}\. /);
				for (var j=0; j<subjectArray.length; j++) {
					tag = '6' + UNK + UNK;
					ind = UNK + UNK;
					marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + subjectArray[j].replace(RE_SUBDIV,DISP_SF_DELIM + UNK) + FIELD_SEP);
				}
			}
			
			if ( nonSubjectString ) {
				var nonSubjectArray = nonSubjectString.split(/^[IVX]+\. | [IVX]+\. /);
				for (var j=0; j < nonSubjectArray.length; j++) {
					// ATENCION: revisar Títulos y series
					if ( nonSubjectArray[j].search(/^T[íi]tulo\.|^Title\.|^Serie\.|^Series\./) != -1 )
						continue;
					tag = '7' + UNK + UNK;
					ind = UNK + UNK;
					marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + 'a' + nonSubjectArray[j].replace(RE_DATES, "," + DISP_SF_DELIM + "d$1-") + FIELD_SEP);
				}
			}
		}
		else {  // Y como último recurso...
			tag = UNK + UNK + UNK;
			ind = UNK + UNK;
			marc["datafields"].push(tag + ' ' + ind + ' ' + DISP_SF_DELIM + UNK + paragraph + FIELD_SEP);
		}
	}
	
	return marc;
} // End aacr2marc()
