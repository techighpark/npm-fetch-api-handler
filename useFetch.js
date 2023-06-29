const { getCookie } = require("@developers/lib/useCookies");
// TODO header to paramater

const useFetch = {}

// ---------------------------------------------------------------------------------------------------
/**
 * @param {string} url
 * @param {Object} [queryParams]
 * */
useFetch.getApi = async (url, queryParams) => {
    let joinedUrl = url;
    if (queryParams) {
        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        joinedUrl += '?' + queryString;
    }
    const response = await fetch(joinedUrl);
    return await response.json();
}

// ---------------------------------------------------------------------------------------------------
/**
 * @description file 있으면 formData 에 파일 넣음 & Content-Type headers에서 제거 & body에 formData 담기
 * @param {string} url
 * @param {any} data
 * @param {boolean} [hasFile]
 * @return {json}
 * */
useFetch.postApi = async ({ url, data, hasFile = false }) => {
    //file 있으면 formData 에 파일 넣음
    let response;
    if (hasFile) {
        // file 이 있는 경우
        const formData = new FormData();
        for (const item in data) {
            // FileList type 인 경우
            if (data[item] !== null) {
                if (data[item] instanceof FileList) {
                    let i = 0;
                    for (const file of data[item]) {
                        formData.append(`${item}[${i}]`, file)
                        i++;
                    }
                } else {
                    // Object type 인 경우
                    // FormData 로 전송될 경우 Object type 은 String 으로 전송되기때문에 오류 발생
                    if (data[item] instanceof Object) {
                        formData.append(`${item}`, JSON.stringify(data[item]))
                        //     const itemKeys = Object.keys( data[ item ] )
                        //     itemKeys.forEach( i => {
                        //         formData.append( `${ item }[${ i }]`, data[ item ][ i ] )
                        //     } )
                    } else {
                        formData.append(item, data[item])
                    }
                }
            }
        }

        await fetch('/sanctum/csrf-cookie')
        response = await fetch(url, {
            method: "POST",
            headers: {
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
            },
            body: formData
        });

    } else {
        // file 이 없는 경우
        await fetch('/sanctum/csrf-cookie')
        response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
            },
            body: JSON.stringify(data),
        });

    }
    return await response.json();
}

// ---------------------------------------------------------------------------------------------------
/**
 * @param {string} url
 * @param {any} data
 * @return {json}
 * */
useFetch.putApi = async (url, data) => {
    console.log(url, data)
    await fetch('/sanctum/csrf-cookie')
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

// ---------------------------------------------------------------------------------------------------
useFetch.deleteApi = async (url) => {
    await fetch('/sanctum/csrf-cookie')
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
        },
    })
    return await response.json();

}
module.exports = useFetch;