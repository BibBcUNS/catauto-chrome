/* =============================================================================
 * Catalis - puntuacion.js
 *
 * Generación de la puntuación para algunos campos de datos MARC 21.
 *
 * (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
 *  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
 * =============================================================================
 */






// -----------------------------------------------------------------------------
function updatePunctuation(field)
// Actualiza los datos de un campo del formulario, con la puntuación generada
// automáticamente.
// -----------------------------------------------------------------------------
{
	var tag = field.tag;
	// Quitamos subcampos vacios
	//var re_empty = /\^\w(?=\^|$)/g
	var subfields = getSubfields(field); //.replace(re_empty,"");
	
	var updatedSubfields = punctuation(tag,subfields);

	//alert(newSubfields.replace(/\^/g,"\n"));
	//var container = document.getElementById("recordContainer");
	//var newField = createField(tag,ind,newSubfields);
	//alert(newField.innerHTML);
	
	// Usamos try...catch debido a que al pasar de un subcampo a otro del mismo
	// campo estaba generando un error.
	//try {container.replaceChild(newField,field)}
	//catch(err) {};
	
	
	// Actualizamos solamente los boxes no vacíos.
	// ATENCION: ¿qué se entiende por "vacío"?
	var values = updatedSubfields.substr(2).split(/\^\w/);
	// ATENCION: usamos substr(2) porque de lo contrario en Mozilla values[0] es vacío
	var boxes = field.getElementsByTagName("tr");
	var j = -1;
	for (var i=0; i < boxes.length; i++) {
		var box = childSubfieldBox(boxes[i]);
		if ( box.value.search(REGEX_EMPTY_SUBFIELD) == -1 ) {
			j = j + 1;
			box.value = values[j];
		}
	}
}


// -----------------------------------------------------------------------------
function punctuation(tag,sf)
// Genera la puntuación para un campo de datos.
// TO-DO: seguir agregando campos (e.g. notas)
//
// Fuentes: varias. Entre ellas:
//   http://tpot.ucsd.edu/Cataloging/Bib_records/punct.html
//   http://www.slc.bc.ca/cheats/marcpunc.htm
//   http://www.itcompany.com/inforetriever/punctuation.htm
//   http://ublib.buffalo.edu/libraries/units/cts/about/FINALPUNCTUATION.HTML
// -----------------------------------------------------------------------------
{
	// Como primer paso, eliminamos la puntuación presente (interna y final),
	// usando una regexp adecuada para cada campo.

	// ATENCION: usar el "g" de global (al menos en los casos de subcampos repetibles)
	// ATENCION: para la puntuación final de los campos no debe tenerse en cuenta
	// a los subcampos numéricos.
	
	switch (tag) {
		// ---------------------------------------------------------
		case "020" :
		// ---------------------------------------------------------
			var re_clean = / :(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^c/, " :^c");
			break;
			
		// ---------------------------------------------------------
		case "240" :
		// ---------------------------------------------------------
			var re_clean = / \.(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^l/g, " .^l");
			break;
			
		// ---------------------------------------------------------
		case "245" :
		// ---------------------------------------------------------
			var re_clean = /( *[:\/]|,| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/([^;=])\^b/, "$1 :^b");
			sf = sf.replace(/ *([;=])\^b/, " $1^b"); // corrijo espacio
			sf = sf.replace(/\^c/, " /^c");
			sf = sf.replace(/\^n/g, " .^n");
			var aux = (sf.search(/\^n/) != -1) ? "," : " .";
			sf = sf.replace(/\^p/g, aux + "^p");
			var re_end = /([^\.])$/;
			sf = sf.replace(re_end, "$1 .");
			break;
			
		// ---------------------------------------------------------
		case "250" :
		// ---------------------------------------------------------
			var re_clean = /( *\/| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/([^=,])\^b/, "$1 /^b");
			var re_end = /([^\.])$/;
			sf = sf.replace(re_end, "$1 .");
			// Corrección:
			//sf = sf.replace(/ ed\.?/g, " ed.");
			break;
			
		// ---------------------------------------------------------
		case "254" :
		// ---------------------------------------------------------
			var re_clean = / \.(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/$/, " .");
			break;
			
		// ---------------------------------------------------------
		case "260" :
		// ---------------------------------------------------------
			// ATENCION: paréntesis al final de $a o $b no deben eliminarse!
			var regex = "("
					  + " *[:;]"  // zero or more spaces followed by a colon or semicolon,
					  + "|[,\)]"  // or a comma or right parenthesis,
					  + "| \."    // or a space followed by a period
					  + ")"
					  + "(?="     // lookahead
					  + "\\^"     // for subfield delimiter
					  + "|$)";    // or end of string
			var re_clean1 = new RegExp(regex,"g");   // Original: /( *[:;]|[,\)]| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean1, "");
			var re_clean2 = /(\^[efg])\(/;
			sf = sf.replace(re_clean2,"$1");
			sf = sf.replace(/\^a/g, " ;^a");
			sf = sf.replace(/\^b/g, " :^b");
			sf = sf.replace(/\^c/, ",^c");
			sf = sf.replace(/\^e/, "^e(");
			var aux = (sf.search(/\^e/) != -1) ? " :^f" : "^f(";
			sf = sf.replace(/\^f/,aux);
			var aux = (sf.search(/\^[ef]/) != -1) ? ",^g" : "^g(";
			sf = sf.replace(/\^g/,aux);
			if (sf.search(/\^[efg]/) != -1) {
				sf = sf + ")";
			}
			var re_end = /([^\.\)\?\]\-])$/;
			sf = sf.replace(re_end,"$1 .");
			break;
			
		// ---------------------------------------------------------
		case "300" :
		// ATENCION: Ends with a period if there is a 4XX in the record; otherwise it ends
		// with a period unless another mark of punctuation or a closing parentheses is present.
		// TO-DO: punto final en abreviaturas, como "p." ?
		// ---------------------------------------------------------
			var re_clean = /( *[:;+]|,| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^b/, " :^b");
			sf = sf.replace(/\^c/, " ;^c");
			sf = sf.replace(/\^e/, " +^e");
			sf = sf.replace(/\^c(\d+) ?cm\.?/,"^c$1 cm.");
			
			var re_end = /([^\.\)\?\]\-])$/;
			sf = sf.replace(re_end, "$1 .");
			break;
			
		// ---------------------------------------------------------
		case "310" :
		case "321" :
		// ---------------------------------------------------------
			var re_clean = /,(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^b/, ",^b");
			break;
			
		// ---------------------------------------------------------
		case "440" :
		// ---------------------------------------------------------
			var re_clean = /( ;|,| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^n/, " .^n");
			var aux = (sf.search(/\^n/) != -1) ? "," : " .";
			sf = sf.replace(/\^p/, aux + "^p");
			sf = sf.replace(/\^v/, " ;^v");
			sf = sf.replace(/\^x/, ",^x");
			break;
			
		// ---------------------------------------------------------
		case "490" :
		// ---------------------------------------------------------
			var re_clean = /( ;|,)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^v/g, " ;^v");
			sf = sf.replace(/\^x/, ",^x");
			break;
			
		// ---------------------------------------------------------
		case "510" :
		// ---------------------------------------------------------
			var re_clean = /,(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^c/g, ",^c");
			break;
			
		// ---------------------------------------------------------
		// case "100" :
		case "700" :
		// ---------------------------------------------------------
			// Los $4 se deben mantener al margen de la puntuación
			// TO-DO: ¿podemos reescribirlo mejor?
			// Este bloque nos sirve para otros campos que usan $4. ¿Lo convertimos
			// en una function?
			//var re_relatorcode = /^(\^?[^4]*)\^4(.*)$/;
			var re_relatorcode = /^(.*?)\^4(.*)$/;   // ".*?" => non-greedy
			var relatorCodeExists = re_relatorcode.exec(sf);
			if ( relatorCodeExists ) {
				var sf1 = RegExp.$1;
				var sf2 = RegExp.$2;
				//alert(sf1 + "\n" + sf2);
			} else {
				var sf1 = sf;
			}
			
			var re_clean = /(,| \.)(?=\^|$)/g;
			sf1 = sf1.replace(re_clean, "");
			sf1 = sf1.replace(/\^c/, ",^c");
			sf1 = sf1.replace(/\^d/, ",^d");
			sf1 = sf1.replace(/\^e/, ",^e");
			var re_end = /([^\.\-\?\)])$/;
			sf1 = sf1.replace(re_end, "$1 .");
			
			sf = ( relatorCodeExists ) ? (sf1 + "^4" + sf2) : sf1;
			break;
			
		// ---------------------------------------------------------
		case "600" : //ATENCION: arreglar problema con 600$2 
		// ---------------------------------------------------------
			var re_clean = /(,| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^c/, ",^c");
			sf = sf.replace(/\^d/, ",^d");
			var re_end = /([^\.\-\?\)])$/;
			sf = sf.replace(re_end, "$1 .");
			break;
			
		// ---------------------------------------------------------
		case "110" :
		case "610" : //ATENCION: arreglar problema con 610$2 
		case "710" :
		// ---------------------------------------------------------
			var re_clean = / \.(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^b/, " .^b");
			var re_end = /([^\.\-\?\)])$/;
			sf = sf.replace(re_end, "$1 .");
			break;
			// ATENCION: revisar este caso: «^axxx. .^byyy»
			
		// ---------------------------------------------------------
		case "111" :
		case "611" : //ATENCION: arreglar problema con 611$2 
		case "711" :
		// ---------------------------------------------------------
			var re_clean1 = /( :|,|\)|\)? \.)(?=\^|$)/g;
			sf = sf.replace(re_clean1, "");
			var re_clean2 = /(\^[ndc])\(/
			sf = sf.replace(re_clean2, "$1");
			
			sf = sf.replace(/\^q/, " .^q");
			sf = sf.replace(/\^n/, "^n(");
			var aux = (sf.search(/\^n/) != -1) ? " :^d" : "^d(";
			sf = sf.replace(/\^d/,aux);
			var aux = (sf.search(/\^[nd]/) != -1) ? " :^c" : "^c(";
			sf = sf.replace(/\^c/,aux);
			if (sf.search(/\^[ndc]/) != -1) {
				sf = sf + ")";
			}
			
			var re_end = /([^\.\-\?\]\)])$/;
			sf = sf.replace(re_end, "$1 .");
			break;
			
		// ---------------------------------------------------------
		case "773" :  // ATENCION: parece necesario refinar un poco más estas reglas.
		// ---------------------------------------------------------
			// Los $7 se deben mantener al margen de la puntuación. Cf. 100/700 $4
			var re_subfield7 = /^(.*?)\^7(.*)$/;
			var subfield7Exists = re_subfield7.exec(sf);
			if ( subfield7Exists ) {
				var sf1 = RegExp.$1;
				var sf2 = RegExp.$2;
			} else {
				var sf1 = sf;
			}
			
			var re_clean = / \.(?=\^|$)/g;
			sf1 = sf1.replace(re_clean, "");
			sf1 = sf1.replace(/([^\.])\^t/, "$1 .^t");
			sf1 = sf1.replace(/([^\.])\^d/, "$1 .^d");
			sf1 = sf1.replace(/([^\.])\^b/, "$1 .^b");
			sf1 = sf1.replace(/([^\.])\^x/, "$1 .^x");
			sf1 = sf1.replace(/([^\.])\^z/, "$1 .^z");
			sf1 = sf1.replace(/([^\.])\^g/, "$1 .^g");
			var re_end = /([^\.\-\?])$/
			sf1 = sf1.replace(re_end,"$1 .");
			
			sf = ( subfield7Exists ) ? (sf1 + "^7" + sf2) : sf1;
			break;
			
		// ---------------------------------------------------------
		case "830" :
		// ---------------------------------------------------------
			var re_clean = /( ;|,| \.)(?=\^|$)/g;
			sf = sf.replace(re_clean, "");
			sf = sf.replace(/\^n/, " .^n");
			var aux = (sf.search(/\^n/) != -1) ? "," : " .";
			sf = sf.replace(/\^p/, aux + "^p");
			sf = sf.replace(/\^v/, " ;^v");
			break;
			
		default :
			// ---------------------------------------------------------
			// Algunas notas llevan punto final.
			// TO-DO: Agregar más campos de notas.
			// ---------------------------------------------------------
			if ( tag.search(/50[124]/) != -1 ) {
				var re_end = /([^\.\-\?])(?=\^5|$)/;
				sf = sf.replace(re_end,"$1.");
			}
			break;
	}
	
	// Eliminamos "puntos dobles" que puedan quedar al final de un subcampo
	// ATENCION: ¿deberíamos limitar esto a ciertos subcampos (110, 710, etc.)?
	sf = sf.replace(/\. \.(?=\^|$)/g, ".");
	
	// Limpiamos cualquier puntuación que pudiera haber sido colocada al inicio
	// (i.e. antes del primer subcampo)
	sf = sf.replace(/^[^\^]+\^/, "^");
	
	// Et c'est fini :-)
	return sf;
}
