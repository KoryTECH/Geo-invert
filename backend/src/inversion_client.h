#pragma once

#include <string>

// Raw outcome of one request to the Python inversion service.
//   ok     - transport succeeded and we received an HTTP response
//            (even a 4xx/5xx one); false means the service was unreachable
//            or the request failed before an HTTP answer came back
//   status - HTTP status code when ok, otherwise 0
//   body   - response body when ok, otherwise empty
//   error  - human-readable failure description when !ok, otherwise empty
struct InversionResult {
    bool ok = false;
    int status = 0;
    std::string body;
    std::string error;
};

// Thin HTTP bridge to the Python inversion service (FastAPI).
//
// Host/port are read once, at construction, from the environment:
//   INVERSION_HOST (default "127.0.0.1")
//   INVERSION_PORT (default 8000)
// Connect timeout is 2s, read timeout 60s. All methods are exception-free:
// any transport failure is reported through InversionResult::ok == false
// with a readable ::error message.
class InversionClient {
public:
    InversionClient();

    // GET <path> (e.g. "/health").
    InversionResult get(const std::string& path);

    // POST <path> with Content-Type: application/json and the given body.
    InversionResult post_json(const std::string& path, const std::string& json);

private:
    std::string host_;
    int port_ = 0;
    std::string base_; // "host:port", used in error messages
};
