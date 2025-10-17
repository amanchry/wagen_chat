# Zambia Water Informatics Dashboard




=============
Apache commands
=============


* Enable the virtual host with the following command:**
`sudo a2ensite zambia.waterinformatics.org.conf`

* To disable site**
(here zambia.waterinformatics.org.conf is apache conf file for zambia.waterinformatics.org website)
`sudo a2dissite zambia.waterinformatics.org.conf`


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
`sudo certbot --apache -d zambia.waterinformatics.org`





=============
Data Source:
=============

Shapefile:
https://www.fao.org/agroinformatics/news/news-detail/now-available--the-global-administrative-unit-layers-(gaul)-dataset---2024-edition/en



RS Data:
AETI - WaPOR v3 L1
TBP - WaPOR v3 L1
PCP - CHIRPS v3
LULC - ESA
RET - WaPOR v3 L1
GBWP - WPOR v3 L1





