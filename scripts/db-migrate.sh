#!/bin/bash
# ===========================================
# LSPU KMIS - Database Export/Import Scripts
# ===========================================
# Use these scripts to migrate your existing database to Docker
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================="
echo "LSPU KMIS Database Migration Tool"
echo -e "==========================================${NC}"

# Default values
DOCKER_CONTAINER="lspu-kmis-db"
DOCKER_USER="${DB_USER:-kmis_user}"
DOCKER_DB="${DB_NAME:-lspu_kmis}"
BACKUP_FILE="lspu_kmis_backup.sql"

show_help() {
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  export-local     Export from LOCAL PostgreSQL to backup file"
    echo "  import-docker    Import backup file into DOCKER PostgreSQL"
    echo "  export-docker    Export from DOCKER PostgreSQL to backup file"
    echo "  import-local     Import backup file into LOCAL PostgreSQL"
    echo "  help             Show this help message"
    echo ""
    echo "Options:"
    echo "  --file FILE      Backup file name (default: lspu_kmis_backup.sql)"
    echo "  --local-db DB    Local database name (default: lspu_kmis)"
    echo "  --local-user USER Local database user (default: postgres)"
    echo "  --local-host HOST Local database host (default: localhost)"
    echo "  --local-port PORT Local database port (default: 5432)"
    echo ""
    echo "Examples:"
    echo "  # Export your local database and import to Docker"
    echo "  $0 export-local --local-db lspu_kmis --local-user postgres"
    echo "  $0 import-docker"
    echo ""
    echo "  # Export Docker database for backup"
    echo "  $0 export-docker --file my_backup.sql"
    echo ""
}

# Parse arguments
COMMAND=$1
shift || true

LOCAL_DB="lspu_kmis"
LOCAL_USER="postgres"
LOCAL_HOST="localhost"
LOCAL_PORT="5432"

while [[ $# -gt 0 ]]; do
    case $1 in
        --file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --local-db)
            LOCAL_DB="$2"
            shift 2
            ;;
        --local-user)
            LOCAL_USER="$2"
            shift 2
            ;;
        --local-host)
            LOCAL_HOST="$2"
            shift 2
            ;;
        --local-port)
            LOCAL_PORT="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

export_local() {
    echo -e "${YELLOW}📦 Exporting local database...${NC}"
    echo "   Database: $LOCAL_DB"
    echo "   User: $LOCAL_USER"
    echo "   Host: $LOCAL_HOST:$LOCAL_PORT"
    echo "   Output: $BACKUP_FILE"
    echo ""
    
    PGPASSWORD=$LOCAL_PASSWORD pg_dump \
        -h "$LOCAL_HOST" \
        -p "$LOCAL_PORT" \
        -U "$LOCAL_USER" \
        -d "$LOCAL_DB" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        -f "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Export complete: $BACKUP_FILE${NC}"
    echo ""
    echo "Next step: Run '$0 import-docker' to import into Docker"
}

import_docker() {
    echo -e "${YELLOW}📥 Importing into Docker database...${NC}"
    echo "   Container: $DOCKER_CONTAINER"
    echo "   Database: $DOCKER_DB"
    echo "   Input: $BACKUP_FILE"
    echo ""
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
        echo "   Run 'export-local' first or specify --file"
        exit 1
    fi
    
    # Check if container is running
    if ! docker ps | grep -q "$DOCKER_CONTAINER"; then
        echo -e "${RED}❌ Docker container '$DOCKER_CONTAINER' is not running${NC}"
        echo "   Run 'docker-compose up -d' first"
        exit 1
    fi
    
    # Copy backup to container and restore
    docker cp "$BACKUP_FILE" "$DOCKER_CONTAINER:/tmp/backup.sql"
    docker exec -i "$DOCKER_CONTAINER" psql -U "$DOCKER_USER" -d "$DOCKER_DB" -f /tmp/backup.sql
    docker exec "$DOCKER_CONTAINER" rm /tmp/backup.sql
    
    echo -e "${GREEN}✅ Import complete!${NC}"
    echo ""
    echo "Your local database has been migrated to Docker."
    echo "Restart the app container to use the new data:"
    echo "   docker-compose restart app"
}

export_docker() {
    echo -e "${YELLOW}📦 Exporting Docker database...${NC}"
    echo "   Container: $DOCKER_CONTAINER"
    echo "   Database: $DOCKER_DB"
    echo "   Output: $BACKUP_FILE"
    echo ""
    
    # Check if container is running
    if ! docker ps | grep -q "$DOCKER_CONTAINER"; then
        echo -e "${RED}❌ Docker container '$DOCKER_CONTAINER' is not running${NC}"
        exit 1
    fi
    
    docker exec "$DOCKER_CONTAINER" pg_dump -U "$DOCKER_USER" -d "$DOCKER_DB" --no-owner --no-acl > "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Export complete: $BACKUP_FILE${NC}"
}

import_local() {
    echo -e "${YELLOW}📥 Importing into local database...${NC}"
    echo "   Database: $LOCAL_DB"
    echo "   User: $LOCAL_USER"
    echo "   Input: $BACKUP_FILE"
    echo ""
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
    
    PGPASSWORD=$LOCAL_PASSWORD psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" -f "$BACKUP_FILE"
    
    echo -e "${GREEN}✅ Import complete!${NC}"
}

case $COMMAND in
    export-local)
        export_local
        ;;
    import-docker)
        import_docker
        ;;
    export-docker)
        export_docker
        ;;
    import-local)
        import_local
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac
