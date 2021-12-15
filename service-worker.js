importScripts('service-worker-utils.js')

const redirects = new Map();

const onBeforeRequestCb = (request) => {
  const proxy = redirects.get(request.url);
  if (!proxy) return request;

  //todo probably obfuscate this param
  request.url = request.url + `&proxy=${proxy}`;
  return request;
};

const onBeforeRedirectCb = (request) => {
  console.dir(request)
  redirects.set(request.redirectUrl, request.responseHeaders['x-proxy-subdomain']);
};

const onResponseStartedCb = (request) => {
  redirects.delete(request.url);
};

const filter = {urls: ['<all_urls>']};
const opt_extraInfoSpec1 = ["responseHeaders", "extraHeaders"];

chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestCb, filter, []);
chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirectCb, filter, opt_extraInfoSpec1);
chrome.webRequest.onResponseStarted.addListener(onResponseStartedCb, filter, opt_extraInfoSpec1);

const config = {
  mode: 'pac_script',
  pacScript: {
    data: FindProxyForURL.toString(),
    mandatory: true
  }
};

chrome.proxy.settings.set(
  {value: config, scope: 'regular'},
  function() {}
);

function FindProxyForURL(url, host) {
  const id = url;
  return `PROXY localhost:8080`;
}
