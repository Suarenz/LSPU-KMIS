# ===========================================
# LSPU KMIS - Database Migration Tool (PowerShell)
# ===========================================
# Use this script to migrate your existing database to Docker
# ===========================================

param(
    [Parameter(Position=0)]
    [ValidateSet("export-local", "import-docker", "export-docker", "import-local", "help")]
    [string]$Command = "help",
    
    [string]$BackupFile = "lspu_kmis_backup.sql",
    [string]$LocalDb = "lspu_kmis",
    [string]$LocalUser = "postgres",
    [string]$LocalHost = "localhost",
    [int]$LocalPort = 5432,
    [string]$LocalPassword = ""
)

$DockerContainer = "lspu-kmis-db"
$DockerUser = if ($env:DB_USER) { $env:DB_USER } else { "kmis_user" }
$DockerDb = if ($env:DB_NAME) { $env:DB_NAME } else { "lspu_kmis" }

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "`n=========================================="
    Write-ColorOutput "LSPU KMIS Database Migration Tool"
    Write-ColorOutput "==========================================`n"
    
    Write-Host @"
Usage: .\db-migrate.ps1 [COMMAND] [OPTIONS]

Commands:
  export-local     Export from LOCAL PostgreSQL to backup file
  import-docker    Import backup file into DOCKER PostgreSQL
  export-docker    Export from DOCKER PostgreSQL to backup file
  import-local     Import backup file into LOCAL PostgreSQL
  help             Show this help message

Options:
  -BackupFile      Backup file name (default: lspu_kmis_backup.sql)
  -LocalDb         Local database name (default: lspu_kmis)
  -LocalUser       Local database user (default: postgres)
  -LocalHost       Local database host (default: localhost)
  -LocalPort       Local database port (default: 5432)
  -LocalPassword   Local database password (optional)

Examples:
  # Export your local database and import to Docker
  .\db-migrate.ps1 export-local -LocalDb lspu_kmis -LocalUser postgres
  .\db-migrate.ps1 import-docker

  # Export Docker database for backup
  .\db-migrate.ps1 export-docker -BackupFile my_backup.sql

"@
}

function Export-LocalDb {
    Write-ColorOutput "`n📦 Exporting local database..." "Yellow"
    Write-Host "   Database: $LocalDb"
    Write-Host "   User: $LocalUser"
    Write-Host "   Host: ${LocalHost}:${LocalPort}"
    Write-Host "   Output: $BackupFile`n"
    
    $env:PGPASSWORD = $LocalPassword
    
    try {
        & pg_dump -h $LocalHost -p $LocalPort -U $LocalUser -d $LocalDb --no-owner --no-acl --clean --if-exists -f $BackupFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Export complete: $BackupFile" "Green"
            Write-Host "`nNext step: Run '.\db-migrate.ps1 import-docker' to import into Docker"
        } else {
            Write-ColorOutput "❌ Export failed" "Red"
            exit 1
        }
    }
    catch {
        Write-ColorOutput "❌ Error: $_" "Red"
        Write-Host "`nMake sure PostgreSQL bin folder is in your PATH"
        Write-Host "Typically: C:\Program Files\PostgreSQL\16\bin"
        exit 1
    }
    finally {
        $env:PGPASSWORD = ""
    }
}

function Import-DockerDb {
    Write-ColorOutput "`n📥 Importing into Docker database..." "Yellow"
    Write-Host "   Container: $DockerContainer"
    Write-Host "   Database: $DockerDb"
    Write-Host "   Input: $BackupFile`n"
    
    if (-not (Test-Path $BackupFile)) {
        Write-ColorOutput "❌ Backup file not found: $BackupFile" "Red"
        Write-Host "   Run 'export-local' first or specify -BackupFile"
        exit 1
    }
    
    # Check if container is running
    $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern $DockerContainer
    if (-not $containerRunning) {
        Write-ColorOutput "❌ Docker container '$DockerContainer' is not running" "Red"
        Write-Host "   Run 'docker-compose up -d' first"
        exit 1
    }
    
    try {
        # Copy backup to container and restore
        docker cp $BackupFile "${DockerContainer}:/tmp/backup.sql"
        docker exec -i $DockerContainer psql -U $DockerUser -d $DockerDb -f /tmp/backup.sql
        docker exec $DockerContainer rm /tmp/backup.sql
        
        Write-ColorOutput "`n✅ Import complete!" "Green"
        Write-Host "`nYour local database has been migrated to Docker."
        Write-Host "Restart the app container to use the new data:"
        Write-Host "   docker-compose restart app"
    }
    catch {
        Write-ColorOutput "❌ Import failed: $_" "Red"
        exit 1
    }
}

function Export-DockerDb {
    Write-ColorOutput "`n📦 Exporting Docker database..." "Yellow"
    Write-Host "   Container: $DockerContainer"
    Write-Host "   Database: $DockerDb"
    Write-Host "   Output: $BackupFile`n"
    
    $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern $DockerContainer
    if (-not $containerRunning) {
        Write-ColorOutput "❌ Docker container '$DockerContainer' is not running" "Red"
        exit 1
    }
    
    try {
        docker exec $DockerContainer pg_dump -U $DockerUser -d $DockerDb --no-owner --no-acl | Out-File -FilePath $BackupFile -Encoding UTF8
        Write-ColorOutput "✅ Export complete: $BackupFile" "Green"
    }
    catch {
        Write-ColorOutput "❌ Export failed: $_" "Red"
        exit 1
    }
}

function Import-LocalDb {
    Write-ColorOutput "`n📥 Importing into local database..." "Yellow"
    Write-Host "   Database: $LocalDb"
    Write-Host "   User: $LocalUser"
    Write-Host "   Input: $BackupFile`n"
    
    if (-not (Test-Path $BackupFile)) {
        Write-ColorOutput "❌ Backup file not found: $BackupFile" "Red"
        exit 1
    }
    
    $env:PGPASSWORD = $LocalPassword
    
    try {
        & psql -h $LocalHost -p $LocalPort -U $LocalUser -d $LocalDb -f $BackupFile
        Write-ColorOutput "✅ Import complete!" "Green"
    }
    catch {
        Write-ColorOutput "❌ Import failed: $_" "Red"
        exit 1
    }
    finally {
        $env:PGPASSWORD = ""
    }
}

# Main execution
switch ($Command) {
    "export-local" { Export-LocalDb }
    "import-docker" { Import-DockerDb }
    "export-docker" { Export-DockerDb }
    "import-local" { Import-LocalDb }
    "help" { Show-Help }
    default { Show-Help }
}
