// =============================================================================
//  Catalis - marc2marcTagged.js
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================

// =============================================================================
function marc2marcTagged(leader, f001, f003, f005, f008, marcDatafields)
//
// (c) 2003-2004  Fernando J. Gómez - CONICET - INMABB
//
// 'marcDatafields' y 'ejemplares' son arrays
//

// ATENCION: Las columnas de los indicadores se ensanchan cuando
// la columna de los subcampos no llegan a tener "líneas completas".
//
// El atributo class="subfield" es utilizado para poder reconocer los subampos
// y así presentar uno por línea.
//
// ATENCION: el uso de '&nbsp;' en las celdas con el número de campo es para
// obligar a que haya un espacio cuando se copia el listado al portapapeles.
// =============================================================================
{
	var HTMLstring = "<table id='marcTaggedTable' width='100%' cellspacing='0' cellpadding='2' border='0'>";
	
	// leader: el parámetro sólo contiene posiciones 05,06,17
		
	var fullLeader = "";
	fullLeader += "·····";           /* Record length */
	fullLeader += leader.charAt(0);  /* Record status */
	fullLeader += leader.charAt(1);  /* Type of record */
	fullLeader += "##";              /* Posiciones no definidas */
	fullLeader += ".";               /* Esquema de codificación */
	fullLeader += "22";              /* Indicator count, Subfield code count */
	fullLeader += "·····";           /* Base address of data */
	fullLeader += leader.charAt(2);  /* Codification level */
	fullLeader += "··";              /* Posiciones no definidas */
	fullLeader += "4500";            /* Entry map */
	
	if ( fullLeader.length == 24 ) {
		HTMLstring += "<tr>";
		HTMLstring += "<td class='marctag'>LDR&nbsp;</td>";
		HTMLstring += "<td colspan='3'>" + fullLeader + "</td>";
		HTMLstring += "</tr>";
	} else {
		alert("Error en marc2marcTagged(): el leader tiene " + fullLeader.length + " posiciones, en lugar de 24. Necesita efectuar una corrección en el registro, y posiblemente en toda la base de datos.");
	}
	HTMLstring += "<tr><td class='marctag'>001&nbsp;</td>";
	HTMLstring += "<td colspan='3'>" + f001 + "</td></tr>";
	
	if ( f003 != "" ) {
		HTMLstring += "<tr><td class='marctag'>003&nbsp;</td>";
		HTMLstring += "<td colspan='3'>" + f003 + "</td></tr>";
	}
	
	HTMLstring += "<tr><td class='marctag'>005&nbsp;</td>";
	HTMLstring += "<td colspan='3'>" + f005 + "</td></tr>";
	
	HTMLstring += "<tr><td class='marctag'>008&nbsp;</td>";
	HTMLstring += "<td colspan='3'>" + f008 + "</td></tr>";

	// Campos de datos
	var lineas = marcDatafields;
	for (var i=0; i < lineas.length; i++) {
		HTMLstring += "<tr>";
		// tag
		HTMLstring += "<td class='marctag'>" + lineas[i].substr(0,3) + "&nbsp;</td>";
		// indicador 1
		HTMLstring += "<td class='indicator'>" + lineas[i].substr(4,1) + "</td>";
		// indicador 2
		HTMLstring += "<td class='indicator'>" + lineas[i].substr(5,1) + "</td>";
		// subcampos
		// ATENCION: usamos replace(/\/(?=\S)/g,"/<wbr>") para sugerir posibles line breaks luego de una barra, algo que necesitamos para las URLs largas. Sin embargo, <wbr> es no estándar.
		HTMLstring += "<td class='fieldContent'><span class='subfield'>" + lineas[i].substr(6).replace(/\/(?=\S)/g,"/<wbr>").replace(/\^(\w)/g," </span><span class='subfield'><b>$</b><b>$1</b> ") + "</span></td>";
		HTMLstring += "</tr>";
	}
	
	// Ejemplares
	// TO-DO: actualizar la lista de subcampos!!
	/*if ( ejemplares ) {
		for ( var i=0; i < ejemplares.length; i++ ) {
			HTMLstring += "<tr>";
			HTMLstring += "<td class='marctag'>859</td>";		
			HTMLstring += "<td align='center' style='width: 12px; padding-right: 0px;'>#</td>";
			HTMLstring += "<td align='center' style='width: 12px; padding-left: 0px;'>#</td>";
			HTMLstring += "<td>";
			HTMLstring += "<b>$a</b> " + ejemplares[i]["inventario"];
			HTMLstring += ( ejemplares[i]["signatura1"] != "" )  ? " <b>$s</b> " + ejemplares[i]["signatura1"]  : "";
			HTMLstring += ( ejemplares[i]["signatura2"] != "" )  ? " <b>$t</b> " + ejemplares[i]["signatura2"]  : "";
			HTMLstring += ( ejemplares[i]["signatura3"] != "" )  ? " <b>$u</b> " + ejemplares[i]["signatura3"]  : "";
			HTMLstring += ( ejemplares[i]["signatura4"] != "" )  ? " <b>$v</b> " + ejemplares[i]["signatura4"]  : "";
			HTMLstring += ( ejemplares[i]["notaInterna"] != "" ) ? " <b>$x</b> " + ejemplares[i]["notaInterna"] : "";
			HTMLstring += ( ejemplares[i]["notaPublica"] != "" ) ? " <b>$z</b> " + ejemplares[i]["notaPublica"] : "";
			HTMLstring += "</td>";
			HTMLstring += "</tr>";
		}
	}*/

		// PostIt notes
/*
	if ( postItNote ) {
		HTMLstring += "<tr>";
		HTMLstring += "<td class='marctag'>980&nbsp;</td>";		
		HTMLstring += "<td class='indicator'>#</td>";
		HTMLstring += "<td class='indicator'>#</td>";
		HTMLstring += "<td class='fieldContent'><span class='subfield'>" + postItNote.replace(/\^(\w)/g," </span><span class='subfield'><b>$</b><b>$1</b> ") + "</span></td>";
		HTMLstring += "</tr>";
	}
	*/
	HTMLstring += "</table>";
	
	return(HTMLstring);
}