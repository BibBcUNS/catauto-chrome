/* =============================================================================
 *  Catalis - templates.js
 *
 *  Plantillas usadas para crear registros nuevos. 
 *
 *  ATENCION: ver templates.pft
 *
 *  Modificaciones a este archivo:
 *    a. si se agregan o quitan plantillas: ver selectTemplate.htm
 *    b. si se modifican plantillas: tener cuidado, pues los cambios 
 *       pueden afectar a más usuarios de lo deseado. 
 *
 *  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
 *  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
 * =============================================================================
 */ 
 
 

/* Campo 008: lo mostramos separado en bloques: 00-17, 18-34, 35-39 */


/* Datos comunes a todas las plantillas */
//'a001~[pendiente]~', /* Control number */
//'a905~n~', /* Record status. Code n: New */	
//'a909~#~', /* Character coding scheme. Code #: MARC-8 */	
//'a917~5~', /* Encoding level. Code 5: Partial (preliminary) level */
//'a918~a~', /* Descriptive cataloging form. Code a: AACR2 */	
//'a919~#~', /* Linked record requirement. Code #: Related record not required */	



var templates = new Object();

//------------------------------------------------------------------------------
function loadTemplates() {
//------------------------------------------------------------------------------

<!--  Plantilla para autores -->
	templates["NOMBRE PERSONAL"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'100 1#^a^d\n' +
			'400 1#^a^d\n' +
			'670 ##^a^b\n' 
			
	}
	<!--  Plantilla para autores -->
	templates["NOMBRE CORPORATIVO"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'110 1#^a^d\n' +
			'410 1#^a^d\n' +
			'670 ##^a^b\n' 
			
	}
	
	<!--  Plantilla para autores -->
	templates["NOMBRE REUNION"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'111 1#^a^d\n' +
			'411 1#^a^d\n' +
			'670 ##^a^b\n' 
			
	}
	
	
		<!--  Plantilla de Autoridad para Título -->

	templates["TITULO UNIFORME"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'130 #0^a^d\n' +
			'430 #0^a\n' +
			'670 ##^a^b\n' 
			
	}
	<!--  Plantilla de Autoridad para Temas-->
	templates["TEMATICO"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'150 ##^a\n' +
			'450 ##^a\n' +
			'670 ##^a^b\n' 
			
	}
	<!--  Plantilla de Autoridad para Temas-->
	templates["NOMBRE GEOGRAFICO"] = {
		html_help : "",
		leader : 'nzo',
		f001   : "[pendiente]",
		f008   : '######n|#ac|nnaabn' + '##########' + '|a#|ac#####d',
		
		datafields :
			'151 ##^a\n' +
			'451 ##^a\n' +
			'670 ##^a^b\n' 
			
	}
	
	

}


//------------------------------------------------------------------------------
function loadLocalTemplateData() {
//------------------------------------------------------------------------------
	// Campos que dependen de la base de datos
	
}