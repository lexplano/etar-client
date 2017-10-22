FROM debian:stretch-slim
MAINTAINER info@lexplano.com

RUN apt-get update && apt-get -y install gnupg2 apt-transport-https

COPY docker/nodesource.gpg.key /tmp/nodesource.gpg.key
RUN apt-key add /tmp/nodesource.gpg.key
COPY docker/nodesource.list /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && apt-get -y install cron nodejs

RUN chown Debian-exim:adm /var/log/exim4 # something odd with gitlab ci - it does not set correct permissions
RUN sed -e "s/dc_eximconfig_configtype='local'/dc_eximconfig_configtype='internet'/" -i /etc/exim4/update-exim4.conf.conf
RUN sed -e "s/dc_local_interfaces='127.0.0.1 ; ::1'/dc_local_interfaces='127.0.0.1'/" -i /etc/exim4/update-exim4.conf.conf
RUN update-exim4.conf

RUN npm i -g @lexplano/etar-client

# Add crontab file in the cron directory
COPY docker/crontab /etc/crontab
RUN chmod 0644 /etc/crontab

COPY docker/daily.sh /root/daily.sh

# Run the command on container startup
CMD ["cron", "-f"]
