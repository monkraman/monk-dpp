@echo off
echo ===================================================
echo Setting up DPP Platform Database (PostgreSQL 17)...
echo ===================================================

set PG_DIR=C:\Program Files\PostgreSQL\17
set PG_DATA=%PG_DIR%\data
set PG_BIN=%PG_DIR%\bin

if not exist "%PG_DATA%\pg_hba.conf" (
    echo [ERROR] PostgreSQL 17 data directory not found at %PG_DATA%!
    pause
    exit /b 1
)

echo [1/5] Backing up pg_hba.conf...
copy /Y "%PG_DATA%\pg_hba.conf" "%PG_DATA%\pg_hba.conf.bak" >nul

echo [2/5] Setting temporary trust mode...
powershell -NoProfile -Command "(Get-Content '%PG_DATA%\pg_hba.conf') -replace 'scram-sha-256', 'trust' | Set-Content '%PG_DATA%\pg_hba.conf'"

echo [3/5] Restarting PostgreSQL 17 Service...
powershell -NoProfile -Command "Restart-Service postgresql-x64-17"

echo [4/5] Creating Database and User...
"%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
"%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_database WHERE datname = 'dpp_platform';" | findstr "1" >nul
if errorlevel 1 (
    echo Creating database dpp_platform...
    "%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE dpp_platform;"
) else (
    echo Database dpp_platform already exists.
)

"%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_roles WHERE rolname = 'dpp_admin';" | findstr "1" >nul
if errorlevel 1 (
    echo Creating user dpp_admin...
    "%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE USER dpp_admin WITH ENCRYPTED PASSWORD 'dpp_password';"
) else (
    echo Updating user dpp_admin password...
    "%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "ALTER USER dpp_admin WITH ENCRYPTED PASSWORD 'dpp_password';"
)

"%PG_BIN%\psql.exe" -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE dpp_platform TO dpp_admin; ALTER DATABASE dpp_platform OWNER TO dpp_admin;"

echo [5/5] Restoring original security configuration...
copy /Y "%PG_DATA%\pg_hba.conf.bak" "%PG_DATA%\pg_hba.conf" >nul
del "%PG_DATA%\pg_hba.conf.bak" >nul
powershell -NoProfile -Command "Restart-Service postgresql-x64-17"

echo ===================================================
echo SUCCESS! PostgreSQL setup is complete!
echo Database: dpp_platform
echo User:     dpp_admin
echo Password: dpp_password
echo Port:     5432
echo ===================================================
pause
