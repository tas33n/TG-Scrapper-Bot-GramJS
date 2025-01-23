@echo off

:: Check if Node.js is already installed
echo Checking for Node.js installation...
node -v >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed.
    goto check_version
)

:: Download Node.js installer
echo Node.js is not installed. Downloading Node.js installer...
bitsadmin /transfer "NodeJS" https://nodejs.org/dist/v20.18.2/node-v20.18.2-x64.msi %temp%\nodejs.msi
if %errorlevel% neq 0 (
    echo Failed to download Node.js installer. Exiting.
    exit /b 1
)

:: Install Node.js
echo Installing Node.js...
msiexec /i %temp%\nodejs.msi /quiet /norestart
if %errorlevel% neq 0 (
    echo Node.js installation failed. Exiting.
    exit /b 1
)

:: Verify installation
echo Verifying Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js installation failed. Please install Node.js manually.
    exit /b 1
)

:check_version
:: Check Node.js version
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (
    set major=%%a
    set minor=%%b
)

if %major% lss 16 (
    echo Node.js version 16 or higher is required. Please update Node.js.
    exit /b 1
)

:: Check if node_modules folder exists
if not exist "node_modules" (
    echo node_modules folder not found. Running npm install...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies. Exiting.
        exit /b 1
    )
)

:: Run the app
echo Starting the app...
npm start
if %errorlevel% neq 0 (
    echo Failed to start the app. Exiting.
    exit /b 1
)
