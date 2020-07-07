import { IncomingMessage, ServerResponse } from "http";

function getUpdaterFn(): (res: ServerResponse) => void {
  return (res) => {
    res.removeHeader("X-Powered-By");
  };
}

function xPoweredBy() {
  const updateResponse = getUpdaterFn();

  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    updateResponse(res);
    next();
  };
}

module.exports = xPoweredBy;
export default xPoweredBy;
