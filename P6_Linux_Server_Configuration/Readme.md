# Linux Server Configuration

This poject is part of udacity full stack nano degree. You can view this project's result at *54.227.50.84*

## 1. Update all package on ubuntu.

```{bash}
sudo apt upgrade
sudo apt update
```

## 2. Change the SSH port from 22 to 2200.

Change ssh configuration
```{bash}
vi /etc/ssh/sshd_config
```
and restart ssh
```{bash}
service ssh restart
```

## 3. Configure the Uncomplicated Firewall (UFW) to only allow incoming connections for SSH (port 2200), HTTP (port 80), and NTP (port 123).

Allow all outgoing and deny all incoming
```{bash}
sudo ufw default deny incoming
sudo ufw default allow outgoing
```
Configuration ufw
```{bash}
sudo ufw allow 2200/tcp
sudo ufw allow HTTP
sudo ufw allow NTP
```
Enable ufw
```{bash}
sudo ufw enable
```

## 4. Create a new user account named grader.

```{bash}
sudo adduser grader
```

## 5. Give grader the permission to sudo.

```{bash}
sudo su
visudo
```
Then do configuration.

## 6. Create an SSH key pair for grader using the ssh-keygen tool.

Switch to user *grader* account.
```{bash}
su grader
```
Use puttygen to generate key. Copy and paste the key.
```{bash}
mkdir .ssh
touch .ssh/authorized_keys
```
Change authorization on those files.
```{bash}
chmod 700 .ssh
chmod 664 .ssh/authorized_keys
```

## 7. Configure the local timezone to UTC.

```{bash}
sudo  timedatectl set-timezone Etc/UTC
```
Reference Documentation:*https://www.server-world.info/en/note?os=Ubuntu_16.04&p=timezone*

## 8. Install and configure Apache to serve a Python mod_wsgi application.

Install apache and python mod_wsgi
```{bash}
sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi-py3
```
configuration apahce and mod_wsgi. In */etc/apache2/sites-enabled/000-default.conf* file add
```{bash}
WSGIScriptAlias / /var/www/Item_Catalog/myapp.wsgi
    <Directory /var/www/Item_Catalog/>

        Order allow,deny
        Allow from all
    </Directory>

Alias /static /var/www/Item_Catalog/static
<Directory /var/www/Item_Catalog/static/>
        Order allow,deny
        Allow from all
</Directory>
```

## 9. Install and configure PostgreSQL

Install PostgreSQL
```{bash}
sudo apt-get install postgresql postgresql-contrib
```
By default the remote connection are not allowed on ubuntu.

Set up *catalog* database
```{bash}
sudo -u postgres psql postgres
\password postgres
sudo su - postgres
psql
CREATE USER catalog WITH PASSWORD 'your_passwd';
ALTER ROLE catalog WITH LOGIN;
ALTER USER catalog CREATEDB;
CREATE DATABASE catalog WITH OWNER catalog;
\c catalog
REVOKE ALL ON SCHEMA public FROM public;
GRANT ALL ON SCHEMA public TO catalog;
\q
```

Then restart postgresql
```{bash}
sudo service postgresql restart
```

## 10. Install git.
```{bash}
sudo apt install git
```

## 11. Clone and setup your Item Catalog project from the Github repository you created earlier in this Nanodegree program.

```{bash}
cd /var/www
git clone https://github.com/KieranHu/Item_Catalog.git
```
Change file *items_db.py*, *lotsofitems.py* and *main.py*
Replace
```{python}
engine = create_engine('sqlite:///item.db')
```
with
```{python}
engine = create_engine('postgresql://catalog:test@localhost/catalog')
```

```{bash}
cd Item_Catalog
```
Create a python file named myapp.wsgi. Add following lines in this file
```{python}
import os, sys
sys.path.insert(0,'/var/www/Item_Catalog')
from main import app as application
```

# All required package

```{bash}
pip3 install flask
pip3 install sqlalchemy
pip3 install oauth2client
pip3 install httplib2
pip3 install requests
pip3 install json
pip3 install psycopg2
```

# Reference Documentation
*https://www.lifewire.com/switch-user-su-command-3887179*
*https://stackoverflow.com/questions/6506578/how-to-create-a-new-database-using-sqlalchemy*
*http://docs.sqlalchemy.org/en/latest/core/engines.html*
*https://www.postgresql.org/docs/9.6/static/tutorial-createdb.html*
*https://stackoverflow.com/questions/10861260/how-to-create-user-for-a-db-in-postgresql*
