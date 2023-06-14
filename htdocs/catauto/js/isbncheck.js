// =============================================================================
//  Catalis - isbncheck.js
// =============================================================================

// -----------------------------------------------------------------------------
function displayMessage(box,type,number_OK)
// -----------------------------------------------------------------------------
{
	//var message = number_OK ? type + " válido" : type + " no válido";
	//var messageBackground = number_OK ? "#ff9" : "red";
	//var messageColor = number_OK ? "black" : "white";
	
	oPopup.document.body.innerHTML = document.getElementById("valid_" + type).innerHTML;
	var popupHeight = 26;
	showPopup(0,0,0,popupHeight);
	var realWidth = (ie) ? oPopup.document.body.scrollWidth : oPopup.offsetWidth;
	hidePopup();
	showPopup(96,box.offsetHeight-24,realWidth,popupHeight,box);
	setTimeout("hidePopup()",600);
}





// -----------------------------------------------------------------------------
function checkStandardNumber(box,type)
// TO-DO: distinguir tipos de error: número invalido, guiones/espacios, calificador
// -----------------------------------------------------------------------------
{
	switch (type) {
		case "ISBN" :
			var number_OK;
			if ( box.value == "" )
				number_OK = true;
			else if ( box.value.length == 10 || box.value.length > 10 && box.value.substr(10,2).search(/ [(:]/) != -1 ) {
					myValue = box.value.substr(0,10);
					number_OK = isNumberValid(myValue,type);
				}
			else
				number_OK = false;
			break;
			
		case "ISSN" :
			var number_OK;
			if ( box.value == "" )
				number_OK = true;
			else if ( box.value.length == 9  || box.value.length > 9 && box.value.substr(9,2).search(/ ;/) != -1 ) {
					myValue = box.value.substr(0,9);
					number_OK = isNumberValid(myValue,type);
				}
			else
				number_OK = false;
			break;
			
		default :
			alert ("ERROR: checkStandardNumber() fue llamada con type = " + type);
	}
	
	if ( number_OK ) {  // no hay error
		box.style.color = "black";
		box.style.backgroundColor = "";
		box.error = false;
		displayMessage(box,type,number_OK);
	}
	else {   // tenemos un error
		box.style.color = "white";
		box.style.backgroundColor = "red";
		box.error = true;
	}
}

// -----------------------------------------------------------------------------


// El script que sigue fue tomado de http://wwwusers.brookes.ac.uk/p0072739/libdesk.htm
// No lo he verificado en detalle. (FG, 22 de julio de 2003)

// TODO: revisar

var len = new Array(9,7,9,12);
var nom = new Array("ISBN","ISSN","ISMN","EAN");
var Mpubpref = new Array(3,4,4,4,5,5,5,6,6,7);
var chstr = new Array(300);

// data obtained from http://www.isbn.spk-berlin.de/html/prefix/

chstr[0]="00002070859095"; // English
chstr[2]="00002070849095"; // French
chstr[3]="00002070859095"; // German
chstr[4]="00002070859095"; // Japan
chstr[5]="000020708590@@92939598"; // Russia
chstr[7]="000010508090"; // China
chstr[10]="000020708590"; // Czechoslovakia
chstr[11]="000020708590"; // India - also has 93 but undefined
chstr[12]="000020709099"; // Norway
chstr[13]="000020708590"; // Poland
chstr[14]="0000207085909597"; // Spain
chstr[15]="000020708590"; // Brazil
chstr[16]="000030708090"; // Yugoslavia
chstr[17]="000040708597"; // Denmark
chstr[18]="000020708590"; // Italian
chstr[19]="000025558595"; // Korea
chstr[20]="000020507080"; // Belgium, Netherlands
chstr[21]="002050708597"; // Sweden
chstr[22]="006080909599"; // Unesco
chstr[50]="0000509099"; // Argentina
chstr[51]="0020558995"; // Finland
chstr[52]="00002050@@89@@9599"; // Finland
chstr[53]="0010156096"; // Croatia
chstr[54]="000030809095"; // Bulgaria
chstr[55]="0020558095"; // Sri Lanka
chstr[56]="00002070"; // Chile
chstr[57]="0000448297"; // Taiwan
chstr[58]="0000608095"; // Colombia
chstr[59]="00002070"; // Cuba
chstr[60]="0000207085"; // Greece
chstr[61]="0000206090"; // Slovenia
chstr[62]="00002070858790"; // Hong Kong
chstr[63]="000020708590"; // Hungary
chstr[64]="0000305590"; // Iran
chstr[65]="0000207090"; // Israel
chstr[66]="0000507090"; // Ukraine
chstr[67]="00609099"; // Malaysia -- 999 makes 5 digits but this is now accounted for later
chstr[68]="00004050@@80"; // Mexico -- don't know what happens before 10 and after 899
chstr[69]="00204080"; // Pakistan
chstr[70]="0000609091"; // Mexico
chstr[71]="0000508591"; // Philippines
chstr[72]="0020558095"; // Portugal
chstr[73]="0020558095"; // Romania
chstr[74]="0000207085"; // Thailand
chstr[75]="0000306092"; // Turkey
chstr[76]="0040608095"; // Caribbean
chstr[77]="0000205070"; // Egypt
chstr[78]="00000020308090"; // Nigeria
chstr[79]="0020408095"; // Indonesia
chstr[80]="00002060"; // Venezuela
chstr[81]="00002030"; // Singapore
chstr[82]="000010@@70@@90"; // South Pacific
chstr[83]="000002204050809099"; // Malaysia
chstr[84]="0000408090"; // Bangladesh
chstr[85]="0000406090"; // Belarus
chstr[87]="0000509095"; // Argentina
chstr[154]="00204080"; // Morocco
chstr[155]="00004090"; // Lithuania
chstr[156]="00104090"; // Cameroun
chstr[157]="00004085"; // Jordan
chstr[158]="00105090"; // Bosnia
chstr[160]="00006090"; // Saudi Arabia
chstr[161]="00508095"; // Algeria
chstr[162]="00006085"; // Panama
chstr[163]="00305575"; // Cyprus
chstr[164]="007095"; // Ghana
chstr[165]="00004090"; // Kazakstan
chstr[166]="00008096"; // Kenya
chstr[167]="00004090"; // Kyrgyzstan
chstr[168]="00107097"; // Costa Rica
chstr[170]="00004090"; // Uganda
chstr[171]="00609099"; // Singapore
chstr[172]="0000@@@@10406090"; // Peru
chstr[173]="00107097"; // Tunisia
chstr[174]="00305575"; // Uruguay
chstr[175]="00509095"; // Moldova
chstr[176]="006090"; // Tanzania + 999 is 4 digits
chstr[177]="00009099"; // Costa Rica
chstr[178]="00009599"; // Ecuador
chstr[179]="00508090"; // Iceland
chstr[180]="004090"; // Papua New Guinea
chstr[181]="00001016208095"; // Morocco
chstr[182]="00008099"; // Zambia
chstr[183]="00809599"; // Gambia -- Don't know what happens before 80
chstr[184]="00005090"; // Latvia
chstr[185]="00508090"; // Estonia
chstr[186]="000040909497"; // Lithuania
chstr[187]="00004088"; // Tanzania
chstr[188]="00305575"; // Ghana
chstr[189]="00306095"; // Macedonia
chstr[203]="002090"; // Mauritius
chstr[204]="006090"; // Netherlands Antilles
chstr[206]="003060"; // Kuwait
chstr[208]="001090"; // Malawi
chstr[209]="004095"; // Malta
chstr[210]="003090"; // Sierra Leone
chstr[211]="000060"; // Lesotho
chstr[212]="006090"; // Botswana
chstr[214]="005090"; // Suriname
chstr[215]="005080"; // Maldives
chstr[216]="003070"; // Namibia
chstr[217]="003090"; // Brunei Darussalam
chstr[218]="004090"; // Faroes
chstr[219]="004090"; // Benin
chstr[220]="005090"; // Andorra
chstr[221]="002070"; // Qatar
chstr[223]="002080"; // El Salvador
chstr[225]="004080"; // Paraguay
chstr[226]="001060"; // Honduras
chstr[227]="003060"; // Albania
chstr[228]="001080"; // Georgia
chstr[231]="005080"; // Seychelles
chstr[232]="001060"; // Malta

// -----------------------------------------------------------------------------
function isNumberValid(myNumber,myType) {
// -----------------------------------------------------------------------------
	if ( myNumber != "" ) {
		var reply1 = "";
		var reply2 = "";
		var reply3 = "";
		var isbn = getISBN(myNumber);
		//var type = gettype(isbn);
		var type = (myType == "ISBN") ? 0 : 1;  // FG
		if ( valid(isbn,type) ) {
			var ckdig = getckdig(isbn);
			reply1="This is an " + nom[type] + ".  The check digit is ";
			if (isbn.length>len[type]) {
			var cd = "" + ckdig;
			if ( isbn.charAt(len[type])!=cd ) 
				reply1 += "incorrect: it should be " + ckdig + ".";
			else reply1 += "correct.";
			}
			else reply1 += ckdig + ".";
			reply2 = "The full " + nom[type] + " is " + fullnum(isbn) + ".";
			if (type==3 && isbn.substring(0,3)=="978") reply3="It is for a book with ISBN "+fullnum(isbn.substring(3,12))+".";
			if (type==3 && isbn.substring(0,3)=="977") reply3="It is for a serial publication with ISSN "+fullnum(isbn.substring(3,10))+".";
			if (type==3 && isbn.substring(0,4)=="9790") reply3="It is for a piece of music with ISMN "+fullnum("M"+isbn.substring(4,12))+".";
		}
		else { // not valid(isbn,type)
			if (isbn.length>13 && isbn.substring(0,3)=="977" && valid (isbn.substring(0,13),3)) {
			ean = isbn.substring(0,13);
			if (ean == fullnum(ean)) {
				reply1 = ean+" is an EAN. The check digit is correct.";
				reply2 = "It is for a serial publication with ISSN " + fullnum(isbn.substring(3,10))+", issue number "+isbn.substring(13,isbn.length)+".";
			}
			else reply1 = "You have typed in too much, too little, or letters instead of numbers.";
			}
			else reply1 = "You have typed in too much, too little, or letters instead of numbers.";
		}
	}
  
	if ( reply1.search(/incorrect/) != -1 ) {
		//alert("El número ingresado no es un " + myType + " válido.");
		return false;
	}
	else {
		return true;
	}
}

// -----------------------------------------------------------------------------
function gettype(num)
// -----------------------------------------------------------------------------
{
	var x=4; // invalid default
	var l=num.length;
	var c=""+num.charAt(0);
	if (l==9 || l==10) x=0; // ISBN
	if (l==7 || l==8) x=1; // ISSN
	if (x==0 && c=="M") x=2; // ISMN
	if (l==12 || l==13) x=3; // EAN
	return x;
}

// -----------------------------------------------------------------------------
function getckdig(num)
// -----------------------------------------------------------------------------
{
  var t = gettype(num);
  var cksum = 0;
  if (t<2) {
    for (x=0;x<len[t];x++) cksum += (1+len[t]-x)*num.charAt(x);
    var ckdig = (1100-cksum)%11;
    if (ckdig==10) ckdig = "X";
  }
  else {
    if (t==2) cksum = 9;
    for (x=3-t;x<len[t];x++) cksum += (3-2*((x+t)%2))*num.charAt(x);
    var ckdig = (1000-cksum)%10;
  }
  return ckdig;
}

// -----------------------------------------------------------------------------
function fullnum(num)
// -----------------------------------------------------------------------------
{
	var numstr = num.substring(0,len[gettype(num)]) + getckdig(num);
	return hyphenate(numstr);
}

// -----------------------------------------------------------------------------
function hyphenate(str)
// -----------------------------------------------------------------------------
{
  var ourstr="";
  if (gettype(str)==2) {
    var breaker=1+Mpubpref[str.charAt(1)];
    ourstr="M-"+str.substring(1,breaker)+"-"+str.substring(breaker,9)+"-"+str.charAt(9);
  }
  if (gettype(str)==0) {
    var pref=prefix(str);
    if (pref!=10 && chstr[shp(pref)]!=null) {
      var p=chstr[shp(pref)];
      var mppl=8-pref.length;
      i=p.length/2;
      while (p.substring(i*2-2,i*2)>str.substring(pref.length,pref.length+2)) i--;
      if (i==mppl+1 && i==p.length/2) i=mppl-1; // if it's only one over, it'll be one less
      if (i>mppl && pref!=962) i+=mppl-p.length/2; // They get bigger again, at least for Russia
      if (i>mppl && (pref==84 || pref==962 || pref==978 || pref==9986)) i=2*mppl-i; // They get smaller in Hong Kong & Lithuania & Nigeria & Spain
      if (str.substring(0,6)==967999 || str.substring(0,7)==9976999) i++; // Malaysia & Tanzania have a three-digit break
      var breaker=i+pref.length;
      ourstr = pref+"-"+str.substring(pref.length,breaker)+"-"+str.substring(breaker,9)+"-"+str.charAt(9);
    }
    else ourstr=str.substring(0,9)+"-"+str.charAt(9);
  }
  if (gettype(str)==1) ourstr=str.substring(0,4)+"-"+str.substring(4,8);
  if (gettype(str)==3) ourstr=str;
  return ourstr;
}

// -----------------------------------------------------------------------------
function prefix(str)
// -----------------------------------------------------------------------------
{
  var x=10;
  if (str.charAt(0)<8) x=str.charAt(0);
  if (str.substring(0,2)>"79" && str.substring(0,2)<"94") x=str.substring(0,2);
  if (str.substring(0,2)>"94" && str.substring(0,2)<"99") x=str.substring(0,3);
  if (str.substring(0,3)>"989" && str.substring(0,3)<"999") x=str.substring(0,4);
  if (str.substring(0,3)=="999") x=str.substring(0,5);
  return x;
}

// -----------------------------------------------------------------------------
function shp(pref)
// -----------------------------------------------------------------------------
{
  var x=0;
  if (pref<8) x=pref;
  if (pref>7 && pref<99) x=pref-70; // 80-93 -> 10-22
  if (pref>100 && pref<999) x=pref-900; // 950-989 -> 50-89
  if (pref>1000 && pref<9999) x=pref-9800; // 9900-9989 -> 100-189
  if (pref>10000) x=pref-99700; // 99900-99999 -> 200-299
  return x;
}

// -----------------------------------------------------------------------------
function valid(num,type)
// -----------------------------------------------------------------------------
{
  var v=(type<4);
  for (x=0; x<len[type]; x++) {
    var c=""+num.charAt(x);
    if ((x>0 || c!="M" || type!=2) && (c<"0" || c>"9")) v=0;
  }
  return v;
}

// -----------------------------------------------------------------------------
function getISBN(istring)
// -----------------------------------------------------------------------------
{
	var i = "";
	for (x=0; x < istring.length; x++) {
		var j = istring.charAt(x);
		if ( j >= "0" && j <= "9" )
			i += j;
		else {
			if ( j=="x" || j=="X" )
				i += "X";
			else if ( j=="m" || j=="M" )
				i += "M";
		}
	}
	return i;
}

