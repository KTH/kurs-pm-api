FROM kthse/kth-nodejs:16.0.0
LABEL maintainer="KTH StudAdm studadm.developers@kth.se"

RUN apk add --no-cache curl bash

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

COPY * /

RUN chmod +x /wait /all-tests.sh

CMD ["bash", "-c", "/wait && /all-tests.sh"]