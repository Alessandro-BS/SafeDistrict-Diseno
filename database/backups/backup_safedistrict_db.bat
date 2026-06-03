@echo off
echo Iniciando el backup de la base de datos safedistrict_db...

:: Configurar variables
set DB_NAME=safedistrict_db
set DB_USER=postgres
set BACKUP_DIR=%~dp0
set DATE_STR=%date:~6,4%%date:~3,2%%date:~0,2%
set TIME_STR=%time:~0,2%%time:~3,2%%time:~6,2%
:: Reemplazar espacios por ceros si la hora es menor a 10
set TIME_STR=%TIME_STR: =0%
set FILE_NAME=%DB_NAME%_backup_%DATE_STR%_%TIME_STR%.sql

:: Comando para hacer el backup (requiere tener pg_dump instalado y en las variables de entorno PATH)
echo Ejecutando pg_dump para la base de datos %DB_NAME%...
pg_dump -U %DB_USER% -d %DB_NAME% -F p -f "%BACKUP_DIR%%FILE_NAME%"

echo.
echo ========================================================
echo Backup completado con exito: %FILE_NAME%
echo Guardado en: %BACKUP_DIR%
echo ========================================================
pause
