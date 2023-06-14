// =============================================================================
//  Catalis - validate.js
//
//  (c) 2003-2005  Fernando J. Gómez - CONICET - INMABB
//  Véase el archivo LICENCIA.TXT incluido en la distribución de Catalis
// =============================================================================



// -----------------------------------------------------------------------------
function marcValidate() {
// -----------------------------------------------------------------------------

	var msg = "";
	

	
	return msg;
	
	// ----------------------------------
	// Validaciones para agregar
	// ----------------------------------
	// Fecha en 260 obligatoria ($c, $g)
	// No más de un 1xx
	// 245 1st ind <--> 1xx
	// 490 1 <--> 8xx
	// 546 --> 041
	// 041 0x <--> 546 ?
	// 041$a <--> 008/35-37
	// 008/35-37 "und" ?
	// 008/15-17 "xx#" <--> 260$a ?
	// Código en 008/06 vs. cantidad de fechas
	// 246 [01]# <--> 246$i
	// 246 [23][01] (porción de título, título paralelo: no se genera nota)
	// Título paralelo <--> 246 x1
	// Idioma + artículo inicial en 245/440 + 2nd ind
	// 856 x[12] <--> 856$3. Sugerir uso de 856$y ?
	// 856 oblig para recursos remotos (e.g. website)
	// Uso de relator codes/terms
	// 240 <--> 100, 110, 111
	// Y varias más...
}