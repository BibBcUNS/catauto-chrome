:: ===============================================
:: Creación de una base vacía en Catalis
:: ===============================================

@echo off

:: directorio para alojar los archivos de la base
mkdir %1
cd %1

:: crea archivo maestro y archivo invertido
mx seq=nul create=biblio
mx biblio "fst=1 0 v1" fullinv=biblio

:: crea contador de registros, inicialmente en cero
echo 000000 >cn.txt

:: genera un texto mínimo para describir la base
echo Base %1 >db-descr.txt

cd ..

echo.
echo Base %1 creada.
echo.