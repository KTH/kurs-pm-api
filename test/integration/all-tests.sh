#!/bin/bash

bash ./basic.sh || exit $?

node check-_paths.js || exit $?

exit 0