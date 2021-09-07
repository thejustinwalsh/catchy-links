import { IncomingMessage } from 'http';

export function absoluteUrl(req: IncomingMessage, setLocalhost: string) {
  var protocol = 'https:';
  var host = (
    req
      ? req.headers['x-forwarded-host'] || req.headers['host']
      : window.location.host
  ) as string;

  if (host.indexOf('localhost') > -1) {
    if (setLocalhost) host = setLocalhost;
    protocol = 'http:';
  }

  return {
    protocol: protocol,
    host: host,
    origin: protocol + '//' + host,
  };
}
