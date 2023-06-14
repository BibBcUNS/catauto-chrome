:: ---------------------------------------------------------------------
:: fullinv - Generación del archivo invertido para las bases
:: bibliográficas de Catalis.
:: ---------------------------------------------------------------------
::
:: Uso: [path\to\]fullinv <database>
::
:: Ejemplo:
::    cd \httpd\catalis_pack\catalis\demo
::    \httpd\cgi-bin\catalis_pack\fullinv biblio
::
:: IMPORTANTE:
::    1. El directorio de los utilitarios cisis debe estar en el PATH.
::    2. Configurar la ruta al archivo fullinv.cip
::    3. Configurar las rutas *dentro* del archivo fullinv.cip
:: ---------------------------------------------------------------------

@echo off

set CIPAR=\httpd\cgi-bin\catalis_pack\fullinv.cip
mx cipar=%CIPAR% db=%1 gizmo=DICTGIZ fst=@BIBLIO.FST actab=AC-ANSI.TAB uctab=UC-ANSI.TAB stw=@BIBLIO.STW fullinv=%1 tell=500
