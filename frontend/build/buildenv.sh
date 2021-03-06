#!/bin/sh


PARENT_DIR=$( pwd -P )

if [[ -z "${CI_PROJECT_DIR}" ]]; then
	PATH="${PARENT_DIR}/.env.development.local"
else
	PATH="${CI_PROJECT_DIR}/frontend/.env.production"
fi


if [ "$1" == "prod" ]; then
	echo "VUE_APP_ROOT_API=\"$PROD_ENDPOINT\"" > $PATH
	echo "VUE_APP_RDP_SSO_ENDPOINT=\"$RDP_SSO_ENDPOINT_PROD\"" >> $PATH
	echo "VUE_APP_RDP_SSO_PAGE=\"$RDP_SSO_PAGE_PROD\"" >> $PATH
	echo "VUE_APP_RDP_SSO_PUB=\"$RDP_SSO_PUBLIC_KEY_PROD\"" >> $PATH
	echo "VUE_APP_RDP_SSO_ISS=\"$RDP_SSO_ISS_PROD\"" >> $PATH
	echo "VUE_APP_RDP_SSO_SHORTKEY_TIMEOUT=\"$RDP_SSO_SHORTLIVE_TIMEOUT_PROD\"" >> $PATH
	echo "VUE_APP_RDP_CDN=\"$RDP_CDN_CSP_PROD\"" >> $PATH
else
	echo "VUE_APP_ROOT_API=\"$STAGING_ENDPOINT\"" > $PATH
	echo "VUE_APP_RDP_SSO_ENDPOINT=\"$RDP_SSO_ENDPOINT\"" >> $PATH
	echo "VUE_APP_RDP_SSO_PAGE=\"$RDP_SSO_PAGE\"" >> $PATH
	echo "VUE_APP_RDP_SSO_PUB=\"$RDP_SSO_PUBLIC_KEY\"" >> $PATH
	echo "VUE_APP_RDP_SSO_ISS=\"$RDP_SSO_ISS\"" >> $PATH
	echo "VUE_APP_RDP_SSO_SHORTKEY_TIMEOUT=\"$RDP_SSO_SHORTLIVE_TIMEOUT\"" >> $PATH
	echo "VUE_APP_RDP_CDN=\"$RDP_CDN_CSP\"" >> $PATH
fi


