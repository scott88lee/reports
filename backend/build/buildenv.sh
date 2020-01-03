PARENT_DIR=$( pwd -P )
PATH="${PARENT_DIR}/.env.development.local"

if [[ -z "${CI_PROJECT_DIR}" ]]; then
	PATH="${PARENT_DIR}/.env.development.local"
else
	PATH="${CI_PROJECT_DIR}/backend/.env"
fi

if [ "$1" == "prod" ]; then
	echo "O_AUTH_ENDPOINT=\"${O_AUTH_ENDPOINT_PROD}\"" > $PATH
	echo "CLIENT_ID=\"${CLIENT_ID}\"" >> $PATH
	echo "CLIENT_SECRET=\"${CLIENT_SECRET}\"" >> $PATH
	echo "API_KEY=\"${API_KEY_PROD}\"" >> $PATH	
	echo "API_ENDPOINT=\"${API_ENDPOINT_PROD}\"" >> $PATH
	# echo "CARDPAY_ENDPOINT=\"${CARDPAY_ENDPOINT_PROD}\"" >> $PATH
	# echo "CARDPAY_REFUND_SCOPE=\"${CARDPAY_REFUND_SCOPE_PROD}\"" >> $PATH
	# echo "CARDPAY_VOID_SCOPE=\"${CARDPAY_VOID_SCOPE_PROD}\"" >> $PATH
	# echo "ALTPAY_ENDPOINT=\"${ALTPAY_ENDPOINT_PROD}\"" >> $PATH
	# echo "ALTPAY_REFUND_SCOPE=\"${ALTPAY_REFUND_SCOPE_PROD}\"" >> $PATH
	# echo "ALTPAY_VOID_SCOPE=\"${ALTPAY_VOID_SCOPE_PROD}\"" >> $PATH
else
	echo "O_AUTH_ENDPOINT=\"${O_AUTH_ENDPOINT}\"" > $PATH
	echo "CLIENT_ID=\"${CLIENT_ID}\"" >> $PATH
	echo "CLIENT_SECRET=\"${CLIENT_SECRET}\"" >> $PATH
	echo "API_KEY=\"${API_KEY}\"" >> $PATH	
	echo "API_ENDPOINT=\"${API_ENDPOINT}\"" >> $PATH
	# echo "CARDPAY_ENDPOINT=\"${CARDPAY_ENDPOINT}\"" >> $PATH
	# echo "CARDPAY_REFUND_SCOPE=\"${CARDPAY_REFUND_SCOPE}\"" >> $PATH
	# echo "CARDPAY_VOID_SCOPE=\"${CARDPAY_VOID_SCOPE}\"" >> $PATH
	# echo "ALTPAY_ENDPOINT=\"${ALTPAY_ENDPOINT}\"" >> $PATH
	# echo "ALTPAY_REFUND_SCOPE=\"${ALTPAY_REFUND_SCOPE}\"" >> $PATH
	# echo "ALTPAY_VOID_SCOPE=\"${ALTPAY_VOID_SCOPE}\"" >> $PATH
fi

