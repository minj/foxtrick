#!/bin/bash
usage() {
	echo -e "Usage: $0 FF_ADDON_ID VERSION XPI_PATH\nPrints GECKO_CHKSUM on success" >&2
	exit 1
}

[[ $# -lt 3 ]] && usage

FF_ADDON_ID="$1"
VERSION="$2"
XPI_PATH="$3"

[[ ! -f "${XPI_PATH}" ]] && usage

amo_api_url="https://addons.mozilla.org/api/v3/addons/${FF_ADDON_ID}/versions/${VERSION}/"
tmp_resp="$(mktemp)"
tmp_headers="$(mktemp)"

echo "Uploading ${XPI_PATH} to ${amo_api_url} as ${FF_ADDON_ID} (${VERSION})" >&2
echo "Headers: ${tmp_headers}; Response: ${tmp_resp}" >&2

curl -fg "${amo_api_url}" -XPUT --form "upload=@${XPI_PATH}" \
	-H "Authorization: JWT $(dist/amo_jwt.py)" \
	-o "${tmp_resp}" -D "${tmp_headers}" || (\
		echo "ERROR: failed to upload to ${amo_api_url}" >&2; \
		cat "${tmp_headers}" "${tmp_resp}" >&2; \
		echo -e "\n#EOF" >&2; \
		exit 2 \
	)

found=
amo_timeout=60
while [[ $amo_timeout -lt 600 ]]; do
	echo "Neeed to wait for AMO signing. Trying in ${amo_timeout} seconds." >&2;

	sleep $amo_timeout
	amo_timeout=$((amo_timeout * 2))

	curl -fg "${amo_api_url}" -H "Authorization: JWT $(dist/amo_jwt.py)" \
		-o "${tmp_resp}" -D "${tmp_headers}"|| (\
				echo "WARNING: failed to access ${amo_api_url}" >&2; \
				cat "${tmp_headers}" "${tmp_resp}" >&2; \
				echo -e "\n#EOF" >&2; \
				continue \
			)

	[[ -z "$(grep '"signed": true' "${tmp_resp}")" ]] && continue

	amo_url=$(grep -oP '(?<="download_url": ").+?(?=")' "${tmp_resp}");
	echo "Downloading from ${amo_url}" >&2

	curl -L -f "${amo_url}" -H "Authorization: JWT $(dist/amo_jwt.py)" \
		-o "${XPI_PATH}" -D "${tmp_headers}" || (\
				echo "WARNING: failed to download from ${amo_url}:" >&2; \
				cat "${tmp_headers}" >&2; \
				echo -e "\n#EOF" >&2; \
				continue \
			)

	GECKO_CHKSUM=$(grep -oPm1 '(?<=^X-Target-Digest: )\w+:\w+' "${tmp_headers}")
	amo_302=$(grep -P 'HTTP/[\d.]+ 302' "${tmp_headers}")
	if [[ -n "${amo_302}" ]]; then
		if [[ -z "${GECKO_CHKSUM}" ]]; then
			echo "ERROR: no checksum found in redirect:" >&2
			cat "${tmp_headers}" >&2
			echo -e "\n#EOF" >&2
			exit 2
		fi

		echo "HTTP 302 file checksum: ${GECKO_CHKSUM}" >&2

		hash_val=${GECKO_CHKSUM#*:}
		hash_type=${GECKO_CHKSUM%:*}
		hash_fn="/usr/bin/${hash_type}sum"

		if [[ ! -x "${hash_fn}" ]]; then
			echo "ERROR: unknown hash algorithm: ${hash_type}" >&2
			cat "${tmp_headers}" >&2
			echo -e "\n#EOF" >&2
			exit 2
		fi

		file_hash=$(${hash_fn} "${XPI_PATH}" | sed -r 's/\s+.+$//g')
		if [[ "${file_hash}" != "${hash_val}" ]]; then
			echo "WARNING: hash miss-match: ${file_hash} != ${hash_val}" >&2
			continue
		fi
	else
		GECKO_CHKSUM="sha256:$(sha256sum "${XPI_PATH}" | sed -r 's/\s+.+$//g')"
		echo "Received file checksum: ${GECKO_CHKSUM}" >&2
	fi

	found=1
	break
done

if [[ -z $found ]]; then
	echo "ERROR: downloading from AMO failed:" >&2
	cat "${tmp_headers}" "${tmp_resp}" >&2
	echo -e "\n#EOF" >&2
	exit 2
fi

echo -n "$GECKO_CHKSUM"

rm "${tmp_resp}" "${tmp_headers}"
