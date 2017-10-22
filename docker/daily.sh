#!/bin/bash

set -e

DOWNLOADS_PATH=/root/etar-downloads
DATA_PATH=/srv/etar-packages
source /srv/lexplano/etar_credentials.sh
source /srv/lexplano/sleep_time.sh

if [ ! -z "${SLEEP_SECONDS}" ]; then
    echo Sleeping: ${SLEEP_SECONDS}s
    sleep ${SLEEP_SECONDS}
fi

mkdir -p ${DOWNLOADS_PATH}

FILENAME=$(etar-client check | grep packageFilename | sed "s/.*packageFilename: '\(.*\).zip'.*$/\\1.zip/")

if [ -z ${FILENAME} ]; then
    echo "Unable to read the filename"
    exit 1
fi

if [ -f ${DOWNLOADS_PATH}/latest ]; then
    LATEST_DOWNLOADED=$(cat ${DOWNLOADS_PATH}/latest)
fi

if [ "${FILENAME}" == "${LATEST_DOWNLOADED}" ]; then
    echo "Latest available on e-tar is the latest downloaded on this host"
    exit 1
fi

if [ -f ${DOWNLOADS_PATH}/${FILENAME} ]; then
    echo "Exists in download path: ${DOWNLOADS_PATH}/${FILENAME}"
    exit 1
fi

if [ -f ${DATA_PATH}/${FILENAME} ]; then

    etar-client rotate ${DATA_PATH}

else

    etar-client download ${DOWNLOADS_PATH}

    mv ${DOWNLOADS_PATH}/${FILENAME} ${DATA_PATH}/${FILENAME}
    echo ${FILENAME} > ${DOWNLOADS_PATH}/latest

fi
