#!/usr/bin/env bash
pushd app
yarn install
yarn test
if [ $? -ne 0 ]; then
echo "yarn test failed"
exit 1
fi
popd