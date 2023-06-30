// -----------------------------------------------------------------------------
function createFieldList(tags)
// Recibe una lista de tags y, luego de validarlos, llama repetidamente a
// createField()
// -----------------------------------------------------------------------------
{
  console.log(tags)
  if ( tags.length == 0 ) {
    alert("ATENCION - Error del sistema: createFieldList() fue llamada con tags.length = 0");
    return;
  }
  
  // Si la lista contiene tags inválidos, los dejamos afuera.
  var validTags = [];
  var errorMsg = "";
  for (var i=0; i < tags.length; i++) {
    if ( tags[i].search(/^\d{3}$/) == -1 ) {
      errorMsg += tags[i] + " no es válido como número de campo.\n";
    } else if ( tags[i].search(MARC_TAGS_ALL) == -1 ) {
      errorMsg += tags[i] + " no aparece en la lista de campos MARC definidos en el sistema.\n";
    } else if ( tags[i].search(MARC_TAGS_NR) != -1 && isTagPresent(tags[i]) ) {
      errorMsg += "El campo " + tags[i] + " no es repetible.\n";
    } else {
      validTags.push(tags[i]);
    }
  }
  
  if ( errorMsg != "") alert(errorMsg);

  if ( validTags.length == 0 ) return;  // ningún tag válido: no hay nada más que hacer

  for (var i=0; i < validTags.length; i++) {
    var newField = createField(validTags[i]);
    if ( !newField ) {  // por si el campo no se pudo crear (campos no repetibles?)
      alert("ATENCION: No se pudo crear un campo " + validTags[i] + ".");
    }
    else {
      displayField(newField);
      // Guardamos info para luego colocar el foco
      if ( 0 == i ) {
        var firstField = newField;
      }
      if ( validTags.length - 1 == i ) {
        var lastField = newField;
      }
    }
  }

  // El foco va al primero de los campos creados.
  // ATENCION: ¿primero en el orden del formulario o primero en el orden en que
  // los tags son pasados por el usuario?
  lastSubfieldBox(lastField).focus();   // para forzar un scroll vertical
  firstSubfieldBox(firstField).focus();

  return 3;
}


// -----------------------------------------------------------------------------
function createSubfieldList(field,codes)
// Recibe una lista de códigos de subcampo y, luego de validarlos, llama
// repetidamente a createSubfield()
// -----------------------------------------------------------------------------
{
  if ( codes.length === 0 ) {
    //alert("ATENCION: createSubfieldList() fue llamada con codes.length = 0");
    console.log("Atencion: createSubfieldList() fue llamada con codes.length = 0");
    return;
  }

  var tag = field.tag;
  var path = "marc21_bibliographic/datafield[@tag='" + tag + "']";
  var xmlDatafield = crossBrowserNodeSelector(xmlData.xmlMARC21,path);

  // Si la lista contiene códigos inválidos, los dejamos afuera.
  // ATENCION: falta verificar la *repetibilidad* de subcampos (??)
  var validCodes = [];
  for (var i=0; i < codes.length; i++) {
    try {
      var repetible;
      if(ie){
        repetible = xmlDatafield.selectNodes("subfield[@code = '" + codes[i] + "']/@repet")[0].value;
      }else{
        repetible = window.top.selectNodesChrome(path+"/subfield[@code = '"+codes[i]+"']/@repet", window.top.xmlData.xmlMARC21)[0].value;
      }
    }
    catch (err) {
      alert("No está definido el subcampo $" + codes[i] + " para el campo " + tag + ".\n\nSi considera que se trata de un error, por favor póngase en contacto con fjgomez@gmail.com.");
      continue;
    }
    
    if ( "NR" == repetible && isSubfieldPresent(field,codes[i]) ) {
      alert("El subcampo $" + codes[i] + " no es repetible.");
    } else {
      validCodes.push(codes[i]);
    }
  }

  if ( validCodes.length == 0 )
    return;

  for (var i=0; i < validCodes.length; i++) {

    var label;
    if(ie){
      label = xmlDatafield.selectNodes("subfield[@code = '" + validCodes[i] + "']/@label-" + LANG)[0].value; 
    }else{
      label = window.top.selectNodesChrome(path+"/subfield[@code = '"+ validCodes[i] + "']/@label-"+LANG, window.top.xmlData.xmlMARC21)[0].value;
    }

    //findNewSubfieldPosition(field,codes[i]); return;
    
    var newSubfield = createSubfield(validCodes[i], "", label, tag);
    
    if ( !newSubfield ) {
      // si el subcampo no se pudo crear (subcampos no repetibles)
      alert("ATENCION: El subcampo $" + validCodes[i] + " no pudo crearse.");
    } else {
      displaySubfield(newSubfield,field);
      highlightSubfieldBox(childSubfieldBox(newSubfield)); // para actualizar el nodo tomado como referencia; no funciona bien usando childSubfieldBox(newSubfield).focus()
      
      // Guardamos info para luego colocar el foco
      if ( 0 == i ) {
        var firstSubfield = newSubfield;
      }
      if ( validCodes.length - 1 == i ) {
        var lastSubfield = newSubfield;
      }
    }
  }

  
  if ( 1 == validCodes.length && "4" == validCodes[0] ) {
    childSubfieldBox(firstSubfield).click();
  } else {
    // El foco, al primero de los subcampos creados.
    // ATENCION: dará error si no se pudo crear algún subcampo.
    childSubfieldBox(lastSubfield).focus();    // para forzar un scroll vertical
    childSubfieldBox(firstSubfield).focus();
    // TO-DO: si el campo creado queda como el último visible en el formulario,
    // pero debajo del él hay aún más campos, forzar un poco de scroll para que
    // no se vea como último.
  }
}


// -----------------------------------------------------------------------------
function createField(tag, ind, subfields)
// Crea un nuevo campo. Devuelve una referencia al objeto creado.
// El parámetro tag es obligatorio.
// TO-DO: ¿podríamos separar la *creación* del objeto, de su *ubicación*
// en una determinada posición? (estamos en eso...)
// TO-DO: la verificación de "legitimidad" debe hacerse fuera de esta función
// -----------------------------------------------------------------------------
{
  if ( !tag ) {
    console.log("La función createField() no recibió el parámetro tag");
    return;
  }
  
  // Datos de xmlMARC21 para: a) armar una plantilla, y b) averiguar si hay
  // indicadores editables
  var path = "marc21_bibliographic/datafield[@tag='" + tag + "']";
  var xmlDatafield = crossBrowserNodeSelector(xmlData.xmlMARC21,path);
  
  /*
  // Esta verificación ya no parece necesaria, pues se realiza desde la función llamadora
  if ( xmlDatafield == null ) {
    alert("El campo " + tag + " no figura en la tabla de campos MARC 21 utilizada.");
    return false;
  }
  */

  // Plantilla para el campo (cuando es creado manualmente)
  if ( !ind && !subfields ) {
    var template = xmlDatafield.getAttribute("template");
    // ATENCION: hay algunos casos en que la plantilla debería adaptarse al momento
    // de la ejecución, en función del contexto. Ejemplo: cuando se crea un campo
    // 246 asociado a un 245 que posee subcampo $h (GMD), el 246 debe incluir un $h
    // también, y con el mismo valor (véase discusión en AUTOCAT, 20-21 de julio de 2004).
    /*if ( tag == "246" ) {
      var field245 = fields_byTag["245"][0];  <== arreglar esto!
      var GMD = extractSubfield(field245,"h");
      if ( GMD != "" ) {
        template = template.replace(/h/,"h" + GMD);
      } else {
        template = template.replace(/h/,"");
      }
    }*/
    
    var ind1 = template.substr(0,1);
    var ind2 = template.substr(1,1);
    var codes = template.substr(2);
    var subfields = "";
    for (var i=0; i < codes.length; i++) {
      subfields += SYSTEM_SUBFIELD_DELIMITER + codes.substr(i,1);
      
      // Caso especial: al crear un 041/044 usamos el código asociado del campo 008
      // TO-DO: el foco debe ir al subcampo siguiente
      // TO-DO: revisar la idea de "field templates".
      if ( tag.search(/041/) != -1 && i == 0 ) {
        subfields += document.getElementById("marcEditForm").f008_35_37.value;
      } else if ( tag.search(/044/) != -1 && i == 0 ) {
        subfields += document.getElementById("marcEditForm").f008_15_17.value;
      }
    }
    var fieldTemplate = ind1 + ind2 + subfields;
  }

  // El container para el campo
  var newField = document.createElement("tr");
  newField.tag = tag;
  if ( "245" == tag ) {
    newField.id = "field245"; // para poder usar refreshTitleBar()
  }
  //max_fieldId++;
  //newField.id = "fieldId" + max_fieldId;

  // El tag
  var newTag = document.createElement("div");
  newTag.className = "fieldTag";
  newTag.innerHTML = tag;
  newTag.oncontextmenu = function() {
    showFieldMenu(parentField(this,"tag"));
    return false;
  };
  newTag.onclick = function() {
    showFieldMenu(parentField(this,"tag"));
    return false;
  };
  try  {
    newTag.title = tag + " - " + xmlDatafield.getAttribute("label-" + LANG);
  }
  catch(err) {}

  var newCell = document.createElement("td");
  newCell.className = "tagCell";   // tag cell
  newCell.vAlign = "top";
  newCell.appendChild(newTag);
  newField.appendChild(newCell);
  
  // Los indicadores
  var newIndPair = document.createElement("div");
  newIndPair.className = "indicators indicatorsDisabled";
  
  // ¿El campo tiene algún indicador definido?
  if ( xmlDatafield && xmlDatafield.getElementsByTagName("i").length > 0 ) {
    newField.hasIndicators = true;
    newIndPair.onclick = function() {
      globalParameter = parentField(this, "ind");
      editIndicators();
    };
    newIndPair.title = "Ver/modificar los indicadores";
    newIndPair.className = "indicators";
    var oneIndicatorOnly = false;

    for (var j=0; j <= 1; j++) {
      var newInd = document.createElement("span");
      if ( xmlDatafield && xmlDatafield.getElementsByTagName("indicator")[j].getElementsByTagName("i").length == 0 ) {
        newInd.style.visibility = "hidden";
        oneIndicatorOnly = true;
      }
      newInd.innerHTML = ( ind ) ? ind.substr(j,1) : fieldTemplate.substr(j,1);
      newIndPair.appendChild(newInd);
      if ( 0 == j ) {
        newIndPair.innerHTML += "<span class='indSeparator'>|</span>";
      }
    }
    if ( oneIndicatorOnly ) {
      newIndPair.innerHTML = newIndPair.innerHTML.replace("|"," ");
    }
  } else {   // ambos indicadores indefinidos
    newIndPair.innerHTML = "<span>#</span><span>|</span><span>#</span>";
  }

  var newCell = document.createElement("td");
  newCell.className = "indCell";   // indicators cell
  newCell.vAlign = "top";
  newCell.appendChild(newIndPair);
  newField.appendChild(newCell);

  // Los subcampos
  var SPLIT_SUBFIELDS = true;
  if ( SPLIT_SUBFIELDS ) {
    var newTable = document.createElement("table");
    newTable.width = "100%";
    newTable.cellSpacing = "0";
    newTable.cellPadding = "0";
    //newTable.border = "1";
    
    // COLGROUP & COL, para definir el ancho de las columnas (ver .css)
    var newColgroup = document.createElement("colgroup");
    
    var newCol = document.createElement("col");
    newCol.className = "subfieldCodeColumn";
    newColgroup.appendChild(newCol);
    
    var newCol = document.createElement("col");
    newCol.className = "subfieldLabelColumn";
    newColgroup.appendChild(newCol);
    
    var newCol = document.createElement("col");
    newCol.className = "subfieldBoxColumn";
    newColgroup.appendChild(newCol);
    newTable.appendChild(newColgroup);
    
    var newTBody = document.createElement("tbody");
    if ( typeof(subfields) == "undefined" ) {
      subfields = fieldTemplate.substr(2);
    }
    subfields = subfields.replace(/^\^/, '');  // un '^' inicial ocasiona un elemento vacío al comienzo del array
    var subfieldsArray = subfields.split(REGEX_SYSTEM_SUBFIELD_DELIMITER);
    for (var i=0; i < subfieldsArray.length; i++) {
      var code = subfieldsArray[i].substr(0,1);
      var sfText = subfieldsArray[i].substr(1);
      var label;
      var path = "subfield[@code = '" + code + "']/@label-" + LANG;
      try {
        if (ie) {
          label = xmlDatafield.selectNodes(path)[0].value;
        } else if (moz) {
          label = xmlData.xmlMARC21.evaluate(path,xmlDatafield,null,2,null).stringValue;
        }
      }
      catch(err) {
        label = "";
      }
      var newSubfield = createSubfield(code,sfText,label,tag);
      newTBody.appendChild(newSubfield);
    }
    newTable.appendChild(newTBody);
    
  } else {  // SPLIT_SUBFIELDS = false  (EXPERIMENTO, 22/sep/03)
    var newTable = document.createElement("textarea");
    newTable.className = "subfieldBox";
    newTable.style.height = newTable.scrollHeight;  // autoajuste de la altura del Textarea
    newTable.onfocus = highlightSubfieldBox;
    newTable.onkeydown = checkKey;
    newTable.value = subfields;
  }
  
  var newCell = document.createElement("td");   // subfields cell
  newCell.className = "subfieldsCell";
  newCell.appendChild(newTable);
  newField.appendChild(newCell);
  // Listo: newField es el nuevo campo

  return newField;
}


/*
  // Ahora vemos en qué posición hay que ubicar al nuevo campo
  // TO-DO: separar esta porción del resto del código de la función
  if (append)  // El campo de agrega al final de la lista
  {
    // Comentado, para que esta funcion no se ocupe del rendering
    //document.getElementById("recordContainer").appendChild(newContainer);
  }
  else  // La ubicación depende del tag
  {
*/


// -----------------------------------------------------------------------------
function createSubfield( code, sfText, label, fieldTag )
// code = código de subcampo
// sfText = contenido del subcampo
// label = nombre del subcampo [opcional]
// fieldTag = tag del campo [opcional]
// -----------------------------------------------------------------------------
{
  // ATENCION: ¿debemos validar en algún sentido el valor de la variable sfText?
  // Podemos detectar aquí la presencia de caracteres "extraños" que, de alguna
  // manera, lograron llegar hasta este punto. Ejemplos: ASCII < 32, '^'.
  
  var newSubfield = document.createElement("tr");
  newSubfield.code = code;

  var newCell = document.createElement("td");
  newCell.className = "subfieldTagCell";

  var newCode = document.createElement("div");
  newCode.className = "subfieldTag";
  newCode.innerHTML = code;
  newCode.onclick = function() {
    showSubfieldMenu(parentSubfield(this, "code"));
    return false;
  }
  newCode.oncontextmenu = newCode.onclick;
  try  {
    newCode.title = code + " : " + label;
  }
  catch(err) {}
  newCell.appendChild(newCode);
  newSubfield.appendChild(newCell);

  var newCell = document.createElement("td");
  newCell.className = "subfieldLabelCell";
  if ( !DISPLAY_SUBFIELD_LABELS ) {
    newCell.style.display = "none";
  }
  
  var newLabel = document.createElement("div");
  newLabel.className = "subfieldLabel";
  newLabel.oncontextmenu = function() {
    showSubfieldMenu(parentSubfield(this, "label"));
    return false;
  }
  
  var newSpan = document.createElement("span");
  newSpan.style.cursor = "hand";
  newSpan.onmouseover = function() {
    this.style.textDecoration = "underline";
  }
  newSpan.onmouseout = function() {
    this.style.textDecoration = "none";
  }
  newSpan.onclick = function() {
    marcHelpPopup(/*parentField(this.parentNode, "subfieldLabel").tag*/fieldTag, code);
  }

  newSpan.innerHTML = label.substr(0,30);
  newLabel.appendChild(newSpan);

  // Botón para verificación de URIs
  if ( "URI" == label || "856u" == fieldTag + code ) {
    var btnCheck = document.createElement("button");
    function checkURI() {
      var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
      box.focus();
      if ( box.value != "" ) {
        var checkWin = window.open("","checkWin","");
        checkWin.location = box.value;  // gracias https://stackoverflow.com/a/45449035
        checkWin.focus();
      }
    }
    btnCheck.onclick = checkURI;
    btnCheck.innerHTML = "verificar";
    btnCheck.title = "Verificar URL en una ventana auxiliar";
    btnCheck.className = "checkButton";
    btnCheck.tabIndex = -1;
    newLabel.appendChild(btnCheck);
  }


        // Botón para verificación de códigos MSC (para bibima)
        if ( g_activeDatabase.name == "bibima" && "084a" == fieldTag + code ) {
                var btnCheck = document.createElement("button");
                function checkMSC() {
      var baseUrl = "http://www.ams.org/mathscinet/search/mscdoc.html?code=";
                        var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
                        box.focus();
                        if ( box.value != "" ) {
        var url = baseUrl + box.value.replace(/ +/g, ",");
                                var checkWin = window.open(url, "checkWin", "");
                                checkWin.focus();
                        }
                }
                btnCheck.onclick = checkMSC;
                btnCheck.innerHTML = "verificar";
                btnCheck.title = "Verificar códigos MSC en una ventana auxiliar";
                btnCheck.className = "checkButton";
                btnCheck.tabIndex = -1;
                newLabel.appendChild(btnCheck);
        }

        // Botón para acceder a MathSciNet (para bibima)
        if ( g_activeDatabase.name == "bibima" && "510c" == fieldTag + code ) {
                var btnCheck = document.createElement("button");
                function openMathSciNet() {
                        var baseUrl = "http://www.ams.org/mathscinet-getitem?mr=";
                        var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
                        box.focus();
                        if ( box.value != "" ) {
                                var url = baseUrl + box.value.replace(/ #/g, ":");
                                var checkWin = window.open(url, "checkWin", "");
                                checkWin.focus();
                        }
                }
                btnCheck.onclick = openMathSciNet;
                btnCheck.innerHTML = "ver";
                btnCheck.title = "Ver en MathSciNet, en una ventana auxiliar";
                btnCheck.className = "checkButton";
                btnCheck.tabIndex = -1;
                newLabel.appendChild(btnCheck);
        }


  // Botón para verificación de ISBN
  // TO-DO: este código se encuentra (casi) duplicado en createSubfield(); unificar.
  if ( "ISBN" == label ||  "020a" == fieldTag + code ) {
    var btnCheck = document.createElement("button");
    btnCheck.onclick = function() { 
      var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
      if ( box.value != "" ) {
        checkStandardNumber(box,"ISBN");
      } else if ( box.error ) {
        box.style.color = "black";
        box.style.backgroundColor = "";
        box.error = false;
      }
      box.focus();
    }
    btnCheck.innerHTML = "verificar";
    btnCheck.title = "Verificar la validez del ISBN";
    btnCheck.className = "checkButton";
    btnCheck.tabIndex = -1;
    newLabel.appendChild(btnCheck);
    
    // consulta en xISBN de OCLC
    /*
    var btnxISBN = document.createElement("button");
    btnxISBN.onclick = function() {
      var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
      if ( box.value != "" ) {
        window.open("http:/" + "/labs.oclc.org/xisbn/" + box.value.substr(0,10),"","");
      }
    }
    btnxISBN.innerHTML = "xISBN";
    btnxISBN.title = "Consultar xISBN";
    btnxISBN.className = "checkButton";
    btnxISBN.style.width = "40px";
    btnxISBN.tabIndex = -1;
    newLabel.appendChild(btnxISBN);
    */
  }

  // Botón para verificación de ISSN
  if ( "ISSN" == label || "022a" == fieldTag + code ) {
    var btnCheck = document.createElement("button");
    btnCheck.onclick = function() {
      var box = childSubfieldBox(this.parentNode.parentNode.parentNode);
      if ( box.value != "" ) {
        checkStandardNumber(box,"ISSN");
      } else if ( box.error ) {
        box.style.color = "black";
        box.style.backgroundColor = "";
        box.error = false;
      }
      box.focus();
    }
    btnCheck.innerHTML = "verificar";
    btnCheck.title = "Verificar la validez del ISSN";
    btnCheck.className = "checkButton";
    btnCheck.tabIndex = -1;
    newLabel.appendChild(btnCheck);
  }
  
  newCell.appendChild(newLabel);
  newSubfield.appendChild(newCell);

  var newCell = document.createElement("td");
  newCell.className = "subfieldBoxCell";
  
  var newSubfieldBox = document.createElement("textarea");
  newSubfieldBox.code = code;
  newSubfieldBox.value = sfText;
  newSubfieldBox.className = "subfieldBox";
  
  // Autoajuste de la altura del textarea
  // Ver esto para navegadores modernos: http://bdadam.com/blog/automatically-adapting-the-height-textarea.html
  // FG 2019.04.07
  if (ie) {
    newSubfieldBox.style.height = newSubfieldBox.scrollHeight;
  } else if (moz) {
    newSubfieldBox.style.minHeight = SUBFIELDBOX_MIN_HEIGHT; //"26px";
    // ???
  }
  
  //newSubfieldBox.style.width = "100%";
  
  // Parece necesario fijar el valor de 'width' para evitar problemas con URL largos
  // Volver a mirar word-wrap, en  http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/wordwrap.asp
  newSubfieldBox.style.width = g_Dimensions.subfieldTextarea.width;
  
  newSubfieldBox.onfocus = function() { highlightSubfieldBox(this) };
  
  if (ie)
    newSubfieldBox.onkeydown = checkKey;
  else if (moz)
    newSubfieldBox.onkeypress = checkKey;
    
  newSubfieldBox.onhelp = function() {
    marcHelpPopup(fieldTag,code);
    return false;
  }
  //newSubfieldBox.style.wordWrap = "break-word";  // IE only (¿lo necesitamos?)

  var tag_code = fieldTag + code;  // i.e., "245a", "260b", "700d", etc.
  
  // Para los datos que deben venir de una base de autoridades...
  if ( AUTHORITY_CONTROL && tag_code.search(/[17]00[^e4]/) != -1 ) {
    newSubfieldBox.readOnly = true;
    newSubfieldBox.ondblclick = function() {
      authorityHandle(getSubfields(parentField(this,"subfieldBox")));
      return false;
    }
  }
  
  // Subcampos cuyos valores se toman de tablas
  if ( "4" == code ) {   // Relator code
    newSubfieldBox.readOnly = true;  // ATENCION: esta propiedad produce un bug al subir/bajar un subcampo $4 vacío
    newSubfieldBox.onclick = function() {
      top.globalParameter = "relator";
      window.top.globalObject = event.srcElement;
      editCodedData();
    }
    newSubfieldBox.style.fontFamily = "lucida console, monospace";
    newSubfieldBox.style.fontSize = "14px";
    newSubfieldBox.style.lineHeight = "17px";
  }
  else if ( fieldTag.search(/041|044/) != -1 ) {   // Language & country codes
    newSubfieldBox.readOnly = true;  // ATENCION: esta propiedad produce un bug al subir/bajar un subcampo $4 vacío
    newSubfieldBox.onclick = function() {
      top.globalParameter = "f" + fieldTag;
      window.top.globalObject = event.srcElement;
      editCodedData();
    }
    newSubfieldBox.style.fontFamily = "lucida console, monospace";
    newSubfieldBox.style.fontSize = "14px";
    newSubfieldBox.style.lineHeight = "17px";
  }
  else if ( "2" == code ) {   // Source of heading or term
    //newSubfieldBox.readOnly = true;
    //newSubfieldBox.ondblclick = function() {showCodeTable("source")}
    //newSubfieldBox.style.width = "5em";
  }
  else if ( "245h" == tag_code ) {    // DGM
    newSubfieldBox.readOnly = true;
  }
  else if ( "5" == code ) {   // Institution code
    newSubfieldBox.value = g_MARCOrganizationCode;
    newSubfieldBox.readOnly = (g_MARCOrganizationCode != "");
  }
  else if ( "7" == code ) {   // Control subfield for 76x-78x
    newSubfieldBox.readOnly = true;
    newSubfieldBox.onclick = function() {
      top.globalParameter = "subfield7";
      window.top.globalObject = event.srcElement;
      editCodedData();
    }
    newSubfieldBox.style.fontFamily = "lucida console, monospace";
    newSubfieldBox.style.fontSize = "14px";
    newSubfieldBox.style.lineHeight = "17px";
  }
  
  
  // ------------------------------------------------------------------------------
  // Juntamos aquí todas las tareas que deben dispararse onchange para un subcampo
  // ------------------------------------------------------------------------------
  
  newSubfieldBox.onchange = function() {
    
    //for ( var pp in this ) alert(pp + "=" + this[pp]);
    //alert(this.scrollHeight + " -- " + this.offsetHeight);
    
    // ATENCION: tenemos lo que parece ser un bug, detectado al jugar con
    // el campo 773. Por un lado, el onchange del $z no anda, y por otro,
    // se dispara un onchange del $d sin motivo apreciable.
    
    // Corrección: eliminamos espacios múltiples y espacios en los extremos
    // ATENCION: ¿es siempre correcto eliminar espacios iniciales? Véase e.g. 050$b en OCLC
    this.value = this.value.replace(/\s+/g," ");
    this.value = this.value.replace(/^\s/,"");
    this.value = this.value.replace(/\s$/,"");
    
    // Sustitución: EM DASH -> guión doble
    this.value = this.value.replace(/\u2014/g,"--");
    
    // Sustitución: typographic double quotes (¿deberíamos advertir del cambio?)
    this.value = this.value.replace(/\u201C|\u201D/g,'"');
    
    // Sustitución: typographic single quotes (¿deberíamos advertir del cambio?)
    this.value = this.value.replace(/\u2018|\u2019/g,"'");
    
    // Sustitución: caracteres especiales en URIs (según OCLC)
    if ( "URI" == label || "856u" == tag_code ) {
      //this.value = this.value.replace(/_/g,"%5F").replace(/~/,"%7E");
      // modif. FG, 2009-11-09
      this.value = this.value.replace(/_/g,"%5F").replace(/~/,"%7E").replace(/\^/,"%5E");
    }
    
    // Corrección: raya sin espacios alrededor en una nota de contenido
    if ( "505" == fieldTag ) {
      if ( g_activeDatabase.name == "bibima" ) {
        // para TOCs copiadas de MathSciNet en bibima
        this.value = this.value.replace(/ MR\d{7}/g, '');  // FG, 2011-06-02
        this.value = this.value.replace(/ \((pp\.\\? )?\d+--\d+\);?/g, '--');
        this.value = this.value.replace(/ \((pp\.\\? )?\d+\u2013\d+\);?/g, '--');  // FG, 2012-08-07 (en dash, \u2013)
      }
      this.value = this.value.replace(/(\S)--/g,"$1 --").replace(/--(\S)/g, "-- $1");
    }
    
    // Corrección: eliminamos espacio que precede a una coma
    this.value = this.value.replace(/\s,/g,",");
    
    // Corrección en 300 $a: 245 p --> 245 p.
    if ( "300a" == tag_code ) {
      this.value = this.value.replace(/(\d+)\s*([ph])$/,"$1 $2.");
    }
    
    // Corrección en 300 $b: il.col. --> il. col.
    if ( "300b" == tag_code ) {
      this.value = this.value.replace(/^il(?=$| )/,"il.");
    }
    
    // TO-DO: luego de mostrar una advertencia como las que siguen, el foco debe
    // permanecer en el mismo textarea.
    
    // Advertencia: no podemos (por ahora) aceptar un '^' en un subcampo
    if ( this.value.indexOf("^") != -1 ) {
      catalisMessage("ATENCION: por el momento no es posible almacenar el carácter '^' dentro de un subcampo.", true);
      return;
    }
    
    // Advertencia: puntuación ISBD dentro de un subcampo del 260
    if ( tag_code.search(/260[ab]/) != -1 && this.value.search(/\S ([;:]) (.+$)/) != -1 ) {
      var msg = "ATENCION: no es correcto usar la puntuación «&nbsp;" + RegExp.$1 + "&nbsp;» dentro de este subcampo. Coloque «" + RegExp.$2 + "» en otro subcampo $" + code + ", o bien corrija la puntuación."    
      catalisMessage(msg, true);
      return;
    }
    
    // ATENCION: esta regex nos da la lista de tags que admiten ajuste automático
    // de la puntuación. ¿No sería mejor definirla en otro sitio, más cercano al
    // código donde se maneja la puntuación de tales campos?
    
    var AUTO_PUNCT_TAGS = /020.|[167]00.|[167]10.|[1678]11.|24[05].|250.|254.|26[04].|300.|310.|321.|4[49]0.|50[0124]a|510.|773[^xz]|830./;
    
    if ( AUTOMATIC_PUNCTUATION && tag_code.search(AUTO_PUNCT_TAGS) != -1 ) {
      updatePunctuation(parentField(this, "subfieldBox"));
    }
    
    // ----------------------------------
    // Campo 245
    // ----------------------------------
    if ( "245" == fieldTag ) {
      refreshTitleBar();
      if ( "a" == code ) {  // Ajuste del 2do indicador (REVISAR)
        //var nonfilchars =
      }
    }
        else if (tag_code == "255c") {
            // Expresión regular para el 255$c.
            // Pensada para la catalogación de cartas topográficas de la mapoteca del Depto. de
            // Geografía y Turismo de la UNS. Hay que adaptarla para casos más generales.
            // ATENCIÓN: estamos considerando solamente longitud oeste y latitud sur, y sin segundos.
            COORDS_255 = /\(O \d{1,3}°\d{2}'--O \d{1,3}°\d{2}'\/S \d{1,2}°\d{2}'--S \d{1,2}°\d{2}'\)/;

            // Si el formato no es correcto, corregimos algunos errores usuales.
            if (!COORDS_255.test(this.value)) {
                // Corrección de errores comunes
                this.value = this.value.replace(/º/g,"°")
                                       .replace(/´/g, "'")
                                       .replace(/ ?-- ?/g, "--")
                                       .replace(/ ?\/ ?/, "/")
                                       .replace(/° (\d)/g, '°$1')
                                       .replace(/(°\d\d)''/g, "$1'")
                                       .replace(/(°\d\d)--/g, "$1'--")
                                       .replace(/(°\d\d)\)/g, "$1')")
                                       .replace(/(°\d\d)\//g, "$1'/");
            }
            // Si aun así el formato sigue siendo incorrecto, avisamos al catalogador.
            if (!COORDS_255.test(this.value)) {
                alert("El formato usado al cargar las coordenadas no es el correcto. Por favor, revise ese campo.");
            }
        }
      
    // ----------------------------------
    // Campo 260
    // ----------------------------------
    else if ( "260" == fieldTag || "264" == fieldTag ) {
            if ( "c" == this.code ) {
                // Ajuste de la fecha en el campo 008
                // OLD: var re = /^\[?c?(\d{4})(?=\]? ?[\.,]?$)/;   // REVISAR, especialmente para el caso "fecha1-fecha2" (código "m")
                
                // FROM demo-devel-BC
                // Casos a considerar:
                // ---------------------------------------------------
                //    260$c            008/06    008/07-10  008/11-14
                // ---------------------------------------------------
                //*   1998                s/i      1998      ####/1998   i: inclusive dates of collection (Leader/07 "c")
                //*   c1998               s        1998      ####
                //*   p1983               s        1983      ####
                //*   [1998]              s        1998      ####
                //*   [1998?]             s        1998      ####
                //*   [ca. 1960]          s        1960      ####
                //*   [1971 o 1972]       s        1971      ####
                //*   1697 [i.e. 1967]    s        1967      ####
                
                //*   [199-]              s        199u      ####
                //*   [199-?]             s        199u      ####
                //*   [18--]              s        18uu      ####
                //*   15--?]              s        15uu      ####
                
                //*   1967, c1965         t/r      1967      1965      El código r en 008/06 está asociado a una nota 500, Edition and history note (Fritz, 3.2-88)
                //*   [1985], c1983       t/r      1985      1983
                //*   [1982?], c1949      t/r      1982      1949
                
                //*   [198-], c1967       t/r      198u      1967
                
                //*   1991-1994           d/m/i    1991      1994   i: inclusive dates of collection (Leader/07 "c")
                //*   1997-[2000]         d/m      1997      2000   d: recurso continuo (Leader/07 "s")
                //*   [1988-1991]         d/m      1988      1991   d: recurso continuo (Leader/07 "s")
                //*   1986-               c/m      1986      9999   c: recurso continuo (Leader/07 "s")
                //*   [1998]-             c/m      1998      9999   c: recurso continuo (Leader/07 "s")
                //*   -1997               d/m      uuuu      1997   d: recurso continuo (Leader/07 "s")
                
                //*   [entre 1906 y 1912] q        1906      1912   q: questionable date
                
                //   sin dígitos         s        ####      ####  --> ¿mensaje de advertencia?
                //   default             DEJAR TODO COMO ESTABA
                
                // En todos los casos, el corchete inicial puede estar en un subcampo previo.
                // En todos los casos, "c" y "p" son equivalentes: e.g. c2001, p2001
                // Hay un riesgo al modificar automáticamente el campo 008: que se altere una información que era
                // correcta (e.g. un código "r" en 008/06).
                // Al final puede haber punto (tal vez precedido de un espacio), que no nos interesa tomar en cuenta.
                
                // Array con los casos a considerar
                var casosFecha = [
                    {
                        regex : "^\\[?[cp]?(\\d{4})(?=\\??\\]? ?[\\.,]?$)",  // 2001 | c2001 | p2001 | [2001] | [2001?]
                        f008_06 : '(document.getElementById("marcEditForm").L_07.value == "c") ? "i" : "s"',
                        f008_07_10 : 'RegExp.$1',  // 2001
                        f008_11_14 : '"####"'
                    },
                    {
                        regex : "^\\[?ca\\. (\\d{4})\\]",  // [ca. 1960]
                        f008_06 : '"s"',
                        f008_07_10 : 'RegExp.$1',  // 1960
                        f008_11_14 : '"####"'
                    },
                    {
                        // TO-DO: independizar del idioma
                        regex : "^\\[?(\\d{4}) [oó]r? \\d{4}\\]",  // [1971 o 1972] 
                        f008_06 : '"s"',
                        f008_07_10 : 'RegExp.$1',  // 1971
                        f008_11_14 : '"####"'
                    },
                    {
                        regex : "^\\d{4} \\[i\\.e\\.,? (\\d{4})\\]",  // 1697 [i.e. 1967]
                        f008_06 : '"s"',
                        f008_07_10 : 'RegExp.$1',  // 1967
                        f008_11_14 : '"####"'
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{3})(?=-\\??\\] ?[\\.,]?$)",  // [200-] | [200-?]
                        f008_06 : '"s"',
                        f008_07_10 : 'RegExp.$1 + "u"',  // 200u
                        f008_11_14 : '"####"'
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{2})--\\??\\]",  // [18--] | [18--?]
                        f008_06 : '"s"',
                        f008_07_10 : 'RegExp.$1 + "uu"',  // 18uu
                        f008_11_14 : '"####"'
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{4})\\]?-\\[?(\\d{4})\\]?",  // 1991-1994 | [1991-1994] | [1991]-1994 | 1991-[1994]
                        f008_06 : '(document.getElementById("marcEditForm").L_07.value == "s") ? "d" : (document.getElementById("marcEditForm").L_07.value == "c") ? "i" : "m"',
                        f008_07_10 : 'RegExp.$1',  // 1991
                        f008_11_14 : 'RegExp.$2'   // 1994
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{4})\\]?-",  // 1991- | [1991]-
                        f008_06 : '(document.getElementById("marcEditForm").L_07.value == "s") ? "c" : "m" ',
                        f008_07_10 : 'RegExp.$1',  // 1991
                        f008_11_14 : '"9999"'
                    },
                    // ----------------------------
                    {
                        regex : "^-(\\d{4})",  // -1997
                        f008_06 : '(document.getElementById("marcEditForm").L_07.value == "s") ? "d" : "m" ',
                        f008_07_10 : '"uuuu"',
                        f008_11_14 : 'RegExp.$1'  // 1997
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{4})\\??\\]?, [cp](\\d{4})",  //  1967, c1965 | [1967], c1965 | [1967?], c1965
                        f008_06 : '(document.getElementById("marcEditForm").f008_06.value == "r") ? "r" : "t"',
                        f008_07_10 : 'RegExp.$1',  // 1967
                        f008_11_14 : 'RegExp.$2'   // 1965
                    },
                    // ----------------------------
                    {
                        regex : "^\\[?(\\d{3})-\\], [cp](\\d{4})",  //  [198-], c1967
                        f008_06 : '(document.getElementById("marcEditForm").f008_06.value == "r") ? "r" : "t"',
                        f008_07_10 : 'RegExp.$1 + "u"',  // 198u
                        f008_11_14 : 'RegExp.$2'   // 1967
                    },
                    // ----------------------------
                    {
                        // TO-DO: independizar del idioma
                        regex : "^\\[?entre (\\d{4}) y (\\d{4})\\]",  //  [entre 1906 y 1912]
                        f008_06 : '"q"',
                        f008_07_10 : 'RegExp.$1',  // 1906
                        f008_11_14 : 'RegExp.$2'   // 1912
                    }
                ];
                
                // Recorremos los casos en busca de uno que se aplique
                for (var i=0; i < casosFecha.length; i++) {
                    var re = new RegExp(casosFecha[i].regex);
                    var matchArray = re.exec(this.value);
                    if ( matchArray != null ) {
                        document.getElementById("marcEditForm").f008_06.value = eval(casosFecha[i].f008_06);
                        document.getElementById("marcEditForm").f008_07_10.value = eval(casosFecha[i].f008_07_10);
                        document.getElementById("marcEditForm").f008_11_14.value = eval(casosFecha[i].f008_11_14);
                        break; // salimos del loop
                    }
                }
                
            }
      else if ( "a" == this.code ) {
        // Ajuste del país en el campo 008
        // ATENCION: restringir a la PRIMERA ocurrencia del subcampo $a
        // TO-DO: enviar todo esto a una tabla externa
        var re = /^\[?(Buenos Aires|Bahía Blanca)\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "ag#";
          document.getElementById("marcEditForm").f008_15_17.title = "Argentina";
        }
        var re = /^\[?New York\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "nyu";
          document.getElementById("marcEditForm").f008_15_17.title = "New York (State)";
        }
        var re = /^\[?(London|Oxford)\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "enk";
          document.getElementById("marcEditForm").f008_15_17.title = "England";
        }
        var re = /^\[?Paris\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "fr#";
          document.getElementById("marcEditForm").f008_15_17.title = "Francia";
        }
        var re = /^\[?(Roma|Milano|Firenze)\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "it#";
          document.getElementById("marcEditForm").f008_15_17.title = "Italia";
        }
        var re = /^\[?México\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "mx#";
          document.getElementById("marcEditForm").f008_15_17.title = "México";
        }
        var re = /^\[?(Madrid|Barcelona|Sevilla)\]?/;
        var result = re.exec(this.value);
        if ( result ) {
          document.getElementById("marcEditForm").f008_15_17.value = "sp#";
          document.getElementById("marcEditForm").f008_15_17.title = "España";
        }
      } // end 260a
    } // end 260
      
    // ----------------------------------
    // Campo 300
    // ----------------------------------
    else if ( "300" == fieldTag ) {
      if ( "b" == this.code ) {
        // Ilustraciones: actualizamos f008_BK_18_21
        var re = /^il\. ?;?$/;
        var hasIllustrations = re.test(this.value);
        if ( hasIllustrations ) {
          document.getElementById("marcEditForm").f008_BK_18_21.value = "a###";
        } else if ( "" == this.value ) {
          document.getElementById("marcEditForm").f008_BK_18_21.value = "####";
        }
      }
    } // end 300
      
    // Campo 111: actualizamos f008_BK_29
    else if ( "111a" == tag_code ) {
      document.getElementById("marcEditForm").f008_BK_29.value = ( this.value != "" ) ? "1" : "0";
    }
    
    // ----------------------------------
    // Campo 504
    // actualizamos f008_BK_24_27
    // ----------------------------------
    // TO-DO: hay que hacer también el ajuste cuando el campo 504 es *eliminado*
    // ATENCION: la correspondencia entre 504 y "b" no es exacta; cuando hay
    // discografías también se usa un 504, pero el código en el 008 es "k".
    else if ( "504" == fieldTag ) {
      var currentCodedValues = document.getElementById("marcEditForm").f008_BK_24_27.value;
      if ( "" == this.value ) {
        // Campo 504 vacío => quitamos el código "b"
        // ATENCION: a veces, p.ej. si la obra es en sí misma una bibliografía,
        // el código "b" debe permanecer, aun cuando no exista un 504.
        // También hay que verificar que no haya *otro* campo 504 presente
        // en el registro!
        document.getElementById("marcEditForm").f008_BK_24_27.value = currentCodedValues.replace(/b/,"") + "#";
      } else {
        // Si no hay un "b", colocamos uno en la primera posición no ocupada (24 o 25)
        // TO-DO: revisar para el caso en que haya otros códigos presentes
        if ( currentCodedValues.search(/b/) == -1 ) {
          document.getElementById("marcEditForm").f008_BK_24_27.value = "b" + currentCodedValues.substr(0,3);
        }
      }
    } // end 504
    
    // ----------------------------------
    // Verificación de ISBN
    // ----------------------------------
    else if ( tag_code.search(/020a|7[6-8][0-9]z/) != -1 ) {
      if ( this.value != "" ) {
        if ( this.value.substr(0,10).indexOf("-") != -1 ) {
          catalisMessage("Ingrese el ISBN sin guiones.", true);
        } else {
          checkStandardNumber(this,"ISBN");
        }
      } else if ( this.error ) {
        this.style.color = "black";
        this.style.backgroundColor = "";
        this.error = false;
      }
    }
    
    // ----------------------------------
    // Verificación de ISSN
    // ----------------------------------
    else if ( tag_code.search(/022a|4[49]0x|7[6-8][0-9]x/) != -1 ) {
      if ( this.value != "" ) {
        checkStandardNumber(this,"ISSN");
      } else if ( this.error ) {
        this.style.color = "black";
        this.style.backgroundColor = "";
        this.error = false;
      }
    }
    
    // Idioma con mayúscula (para títulos uniformes)
    else if ( tag_code.search(/(100|110|111|130|240|243|600|610|611|630|700|710|711|830)l/) != -1 ) {
      this.value = this.value.substr(0,1).toUpperCase() + this.value.substr(1);
    }
    
  } // end newSubfieldBox.onchange

  
  // Y terminamos de armar el newSubfield
  newCell.appendChild(newSubfieldBox);
  newSubfield.appendChild(newCell);
  
  // Subcampos con links a la base de autoridades: no se muestran
  if ( "9" == code ) {
    newSubfield.style.display = "none";
  }
  
  // Devolvemos el objeto creado
  return newSubfield;
}
/* End function createSubfield() */
