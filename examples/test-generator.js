function getRequest(client) {
    var req = client.request('GET', '/asdf');
    return req;
}

module.exports.getRequest = exports.getRequest = getRequest;
