/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
    return new Promise(function (resolve, reject) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`Request failed with status ${response.status}: ${response.statusText}`));
                } else {
                    response.json()
                        .then(data => resolve({data}))
                        .catch(() => {
                            reject(new Error("JSON Parse Error"));
                        });
                }
            })
            .catch(() => {
                reject(new Error("Network error occurred"));
            });

        setTimeout(() => reject(new Error("Request timeout")), 500);
    });
}

export default fetchModel;
