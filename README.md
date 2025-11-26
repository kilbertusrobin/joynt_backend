# Joynt Backend

Backend de l'application Joynt développé avec NestJS, PostgreSQL et Docker.

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/kilbertusrobin/joynt_backend.git
cd joynt_backend
```

### 2. Lancer Docker Desktop

Assurez-vous que Docker Desktop est installé et lancé sur votre machine.

### 3. Démarrer les services

```bash
docker-compose up -d --build
```

## URLs de connexion

- **API NestJS**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - User: `postgres`
  - Password: `postgres`
  - Database: `joynt_db`
- **pgAdmin**: http://localhost:5050
  - Email: `admin@admin.com`
  - Password: `admin`

### Connexion à PostgreSQL dans pgAdmin

1. **Accédez à pgAdmin**: Ouvrez votre navigateur et allez sur http://localhost:5050

2. **Connectez-vous à pgAdmin**:
   - Email: `admin@admin.com`
   - Password: `admin`

3. **Ajoutez un nouveau serveur**:
   - Cliquez sur "Add New Server" ou faites un clic droit sur "Servers" > "Register" > "Server"

4. **Onglet "General"**:
   - Name: `Joynt DB` (ou le nom que vous souhaitez)

5. **Onglet "Connection"**:
   - Host name/address: `postgres` (nom du container Docker, **PAS** localhost)
   - Port: `5432`
   - Maintenance database: `joynt_db`
   - Username: `postgres`
   - Password: `postgres`
   - Cochez "Save password" pour ne pas avoir à la retaper

6. **Cliquez sur "Save"**

Vous devriez maintenant voir votre base de données `joynt_db` dans l'arborescence de pgAdmin.

## Commandes utiles

### Arrêter les services

```bash
docker-compose down
```

### Reconstruire après des modifications

```bash
docker-compose up -d --build
```

### Voir les logs

```bash
docker-compose logs -f
```
