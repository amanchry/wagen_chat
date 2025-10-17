Water Water Accounting Report Generator
=============
This project uses Next JS (frontend) and a Django backend, with Apache acting as a reverse proxy.

=============
Request Flow
User opens https://geochat.waterinag.org/
→ Apache serves React’s index.html

React requests /api/...
→ Apache proxies to Django at 127.0.0.1:8006

Django responds with JSON → React updates UI

Requests for /static/...
→ Served by Apache from React’s build /static

Requests for /django_static/... (Django admin + app static)
→ Served by Apache from Django’s STATIC_ROOT

Requests for /media/...
→ Served by Apache from Django’s MEDIA_ROOT


=============
1. Apache serves the React build from: /home/aman/geochat/frontend/build
2. FallbackResource /index.html ensures client-side routes (like /dashboard, /projects) are handled by React’s index.html, not by Apache.

3. Static assets for React (/static/...) are served from the React build directory:
Alias /static/ /home/aman/geochat/frontend/build/static/

=============
1. Apache proxies API calls with:
- ProxyPass /api http://127.0.0.1:8006/api
- ProxyPassReverse /api http://127.0.0.1:8006/api


2. Example API calls:
- https://geochat.waterinag.org/api/admin/
- https://geochat.waterinag.org/api/login/
- https://geochat.waterinag.org/api/get-projects/
- https://geochat.waterinag.org/api/ask-ai/

3. Django Static & Media Files
STATIC_URL = '/django_static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'django_static/')

Must run: python manage.py collectstatic



.. Frontend
scp -r /Users/amanchaudhary/Desktop/worldbank/chat-geo/chat-geo_v2/frontend/build aman@65.108.77.67:/home/aman/geochat/frontend


.. Backend
scp -r /Users/amanchaudhary/Desktop/worldbank/chat-geo/chat-geo_v2/backend/geochat aman@65.108.77.67:/home/aman/geochat/backend
scp -r /Users/amanchaudhary/Desktop/worldbank/chat-geo/chat-geo_v2/backend/webapp aman@65.108.77.67:/home/aman/geochat/backend




=============
FRONTEND
=============

cd frontend

npm install
npm start
npm run build


=============
BACKEND
=============


* In a new system (Ubuntu server) install the following software

  * PostgreSQL and its developing package
  * redis
  * GDAL software 
  * Apache
  * Compilers
  * Python3 devel packages
  * Setup Geoserver
  * certbot


**Install following packages in Backend**

Open a terminal and use following commands to install required libraries.

`sudo apt-get install gdal-bin apache2 redis-server build-essential python3-dev libpq-dev pango1.0-tools`
`sudo apt-get install postgresql`
`sudo apt install certbot python3-certbot-apache`


* Create an empty PostgreSQL database with PostGIS extension
`sudo -u postgres createuser wagen_chat`

Open psql in the terminal using following command
`sudo -u postgres psql`

In the psql command:

| *# Change password of postgres user*
| `ALTER USER postgres PASSWORD 'wagen_chat';``
| `ALTER USER wagen_chat PASSWORD 'wagen_chat123';``
| *# Give more privileges to user wagen_chat*
| `ALTER USER wagen_chat WITH SUPERUSER;`
| *# quit psql*
| `\q`


Create a new DB named "wagen_chat":

| `createdb -U YOURUSER -h YOURHOST wagen_chat`
| `psql -U YOURUSER -h YOURHOST wagen_chat -c "CREATE EXTENSION postgis"`

.. createdb -U wagen_chat -h localhost wagen_chat
.. pass: wagen_chat123
.. psql -U wagen_chat -h localhost wagen_chat -c "CREATE EXTENSION postgis"
.. 


.. Create database in sqlite in django
rm db.sqlite3
python manage.py migrate


* Download this source code and enter in directory geochat/webapp

* Create a Python 3 virtual environment in the webapp directory

`python3 -m venv venv`

* Activate the virtual environment

`source venv/bin/activate`

.. If using conda
`conda activate django`

* Install dependencies with `pip`

`pip install -r requirements.txt`

.. gdal installation: if getting error
`pip install --no-binary=:all: GDAL==3.8.4`


* Set connection to the database and create its structure

  # add user, password and grass settings in geochat/settings.py
  `python manage.py makemigrations webapp`
  `python manage.py migrate`

  .. Now collectstatic is important because now these will be served through custom "django_static" folder

  `python manage.py collectstatic`

  # create a new user to access the features of web app
  `python manage.py createsuperuser --username admin`

  .. email: aman.chaudhary@iitgn.ac.in
  .. pass: aman
  .. username: admin


  # to see the help
  `python manage.py help`




=============
TESTING
=============


* At this point you could run the app

  `python3 manage.py runserver`

*run this to access on other device too

  `python manage.py runserver 0.0.0.0:8005`

* After running this you can access the dashboard on otherdevice too at "http://10.37.129.2:8001/"


* Open web browser at http://127.0.0.1:8000/





=============
DEPLOYMENT
=============

* Edit the `ini` file and modify the paths
  `nano geochat/geochat.ini`


* Edit the Apache configuration file and modify it, specially the path
  `sudo cp geochat/geochat.conf /etc/apache2/sites-available/geochat.conf`

* Install uwsgi python package in the venv
  (install it in the virtualenv environment)

* Install uwsgi libapache in the ubuntu system
  `sudo apt install libapache2-mod-uwsgi`

* Enable uwsgi and ssl module in apache
  `sudo a2enmod uwsgi`
  `sudo a2enmod ssl`

* Run the Django app using `uwsgi`
  (first, enable virtualenv environment)
  `uwsgi --ini geochat.ini`


* Activate the Apache configuration file
  `sudo a2ensite geochat.conf`
  `sudo systemctl restart apache2`



`uwsgi --ini /home/ubuntu01/geochat/webapp/geochat/geochat.ini`



=================================================================
Screens
=================================================================
* Install Screen
`sudo apt install screen`

* Check the running screen 
`screen -r`

To attach a screen : 
`screen -r geochat_server`

Then control+ C =

* Detach a screen
`screen -d geochat_server`

* To delete a screen 
`screen -S geochat_server -X quit`

* Start a new screen
`screen -S geochat_server`



=================================================================
Restart the uWSGI in development after updates
=================================================================

** check all the running uWSGI workers
`ps aux | grep uwsgi`

** Kill all the workers
`sudo killall -9 uwsgi`


#Restart uWSGI (first activate the venv)
`uwsgi --ini geochat.ini`





=============
Apache commands
=============
* Enable the proxy-pass
`sudo a2enmod proxy
sudo a2enmod proxy_http
`
* Enable the virtual host with the following command:**
`sudo a2ensite wagen_chat.conf`

* To disable site**
(here karnataka.waterinag.org.conf is apache conf file for karnataka.waterinag.org website)
`sudo a2dissite wagen_chat.conf`


* Restart the Apache webserver to apply the changes:
`sudo systemctl reload apache2`
`sudo systemctl restart apache2`

* List all the enabled sites**
`ls -l /etc/apache2/sites-enabled`

* Test the apache configuration:**
`sudo apachectl configtest`


* Install certbot in Ubuntu (enable ssl certificate)
`sudo apt install certbot python3-certbot-apache`

* Set SSL and enable https**
`sudo certbot --apache -d wagen.waterinag.org`

* Apache error log
sudo tail -n 50 /var/log/apache2/wagen_error.log



.. frontend permissions
# Give Apache read + execute permission on the frontend folder
sudo chown -R www-data:www-data /home/aman/wagen_chat/frontend
sudo chmod -R 755 /home/aman/wagen_chat/frontend



=============
Sources
=============
https://demos.creative-tim.com/material-dashboard-react/

icons
https://www.svgrepo.com/svg/

https://chatgpt.com/c/67ea2689-7374-8003-ae8d-650a40490e39




