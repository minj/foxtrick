#!/bin/bash
usage() {
	echo -e "Usage: $0 FF_ADDON_ID VERSION XPI_PATH\nPrints GECKO_CHKSUM on success" >&2
	exit 1
}

dump() {
	local msg="$1"
	shift

	echo "$msg" >&2

	if [[ $# -gt 0 ]]; then
		cat "$@" >&2
		echo -e "\n#EOF" >&2
	fi

	false
}

[[ $# -lt 3 ]] && usage

FF_ADDON_ID="$1"
VERSION="$2"
XPI_PATH="$3"

[[ ! -f "${XPI_PATH}" ]] && usage

amo_api_url="https://addons.mozilla.org/api/v3/addons/${FF_ADDON_ID}/versions/${VERSION}/"
tmp_resp="$(mktemp)"
tmp_headers="$(mktemp)"

dump "Uploading ${XPI_PATH} to ${amo_api_url} as ${FF_ADDON_ID} (${VERSION})"
dump "Headers: ${tmp_headers}; Response: ${tmp_resp}"

curl -fg "${amo_api_url}" -XPUT --form "upload=@${XPI_PATH}" \
	-H "Authorization: JWT $(dist/amo_jwt.py)" \
	-o "${tmp_resp}" -D "${tmp_headers}" || \
		dump "ERROR: failed to upload to ${amo_api_url}:" "${tmp_headers}" "${tmp_resp}" || exit 2

amo_timeout=60
while [[ $amo_timeout -lt 600 ]]; do
	dump "Neeed to wait for AMO signing. Trying in ${amo_timeout} seconds."

	sleep $amo_timeout
	amo_timeout=$((amo_timeout * 2))

	curl -fg "${amo_api_url}" -H "Authorization: JWT $(dist/amo_jwt.py)" \
		-o "${tmp_resp}" -D "${tmp_headers}" || \
		dump "WARNING: failed to access ${amo_api_url}:" "${tmp_headers}" "${tmp_resp}" || continue

	grep -q '"signed": true' "${tmp_resp}" || continue

	amo_url=$(grep -oP '(?<="download_url": ").+?(?=")' "${tmp_resp}")
	dump "Downloading from ${amo_url}"

	curl -L -f "${amo_url}" -H "Authorization: JWT $(dist/amo_jwt.py)" \
		-o "${XPI_PATH}" -D "${tmp_headers}" || \
		dump "WARNING: failed to download from ${amo_url}:" "${tmp_headers}" || continue

	GECKO_CHKSUM=$(grep -oPm1 '(?<=^X-Target-Digest: )\w+:\w+' "${tmp_headers}")
	amo_302=$(grep -P 'HTTP/[\d.]+ 302' "${tmp_headers}")
	if [[ -n "${amo_302}" ]]; then
		if [[ -z "${GECKO_CHKSUM}" ]]; then
			dump "ERROR: no checksum found in redirect:" "${tmp_headers}" || exit 2
		fi

		dump "HTTP 302 file checksum: ${GECKO_CHKSUM}"

		hash_val=${GECKO_CHKSUM#*:}
		hash_type=${GECKO_CHKSUM%:*}
		hash_fn="/usr/bin/${hash_type}sum"

		if [[ ! -x "${hash_fn}" ]]; then
			dump "ERROR: unknown hash algorithm: ${hash_type}" "${tmp_headers}" || exit 2
		fi

		file_hash=$(${hash_fn} "${XPI_PATH}" | sed -r 's/\s+.+$//g')
		if [[ "${file_hash}" != "${hash_val}" ]]; then
			dump "WARNING: hash miss-match: ${file_hash} != ${hash_val}" || continue
		fi
	else
		GECKO_CHKSUM="sha256:$(sha256sum "${XPI_PATH}" | sed -r 's/\s+.+$//g')"
		dump "Received file checksum: ${GECKO_CHKSUM}"
	fi

	# plain echo: result to STDOUT
	echo -n "${GECKO_CHKSUM}"

	rm "${tmp_resp}" "${tmp_headers}"
	exit 0
done

dump "ERROR: downloading from AMO failed:" "${tmp_headers}" "${tmp_resp}"

rm "${tmp_resp}" "${tmp_headers}"
exit 2
