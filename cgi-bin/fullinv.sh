#!/bin/bash 
# ---------------------------------------------------------------------
# fullinv - Generación del archivo invertido para las bases
# bibliográficas de Catalis.
# ---------------------------------------------------------------------
#
# Uso: [path/to/]fullinv <database>
#
# Ejemplo:
#    cd /var/www/bases/catalis_pack/catalis/demo
#    /var/www/cgi-bin/catalis_pack/fullinv biblio
#
# IMPORTANTE:
#   1. Este archivo debe tener permiso de ejecución.
#   2. El directorio de los utilitarios cisis debe estar en el PATH.
#   3. Configurar la ruta al archivo fullinv.cip
#   4. Configurar las rutas *dentro* del archivo fullinv.cip
# ---------------------------------------------------------------------

CIPAR=/var/www/catauto/cgi-bin/catalis/fullinv.cip
mx cipar=$CIPAR db=$1 gizmo=DICTGIZ fst=@BIBLIO.FST actab=AC-ANSI.TAB uctab=UC-ANSI.TAB stw=@BIBLIO.STW fullinv=$1 tell=500
