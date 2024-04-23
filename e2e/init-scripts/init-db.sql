CREATE USER cats_admin WITH PASSWORD 'password very strong';
CREATE DATABASE cats_adoption_database;
ALTER DATABASE cats_adoption_database OWNER TO cats_admin;
GRANT ALL PRIVILEGES ON DATABASE cats_adoption_database TO cats_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO cats_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cats_admin;
