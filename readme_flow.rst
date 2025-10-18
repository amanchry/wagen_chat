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
Sources
=============
https://demos.creative-tim.com/material-dashboard-react/

icons
https://www.svgrepo.com/svg/

https://chatgpt.com/c/67ea2689-7374-8003-ae8d-650a40490e39




