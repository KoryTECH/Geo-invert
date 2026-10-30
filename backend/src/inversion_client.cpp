#include "inversion_client.h"

#include <cstdlib>
#include <string>

#include <httplib.h>

namespace {

std::string env_host() {
    const char* v = std::getenv("INVERSION_HOST");
    if (v == nullptr || *v == '\0') return "127.0.0.1";
    return std::string(v);
}

int env_port() {
    const char* v = std::getenv("INVERSION_PORT");
    if (v == nullptr || *v == '\0') return 8000;
    try {
        return std::stoi(v);
    } catch (...) {
        return 8000;
    }
}

const char* error_text(httplib::Error err) {
    switch (err) {
        case httplib::Error::Connection:
            return "connection refused or host unreachable";
        case httplib::Error::ConnectionTimeout:
            return "connect timeout";
        case httplib::Error::ConnectionClosed:
            return "connection closed before a response arrived";
        case httplib::Error::Timeout:
            return "read timeout";
        case httplib::Error::Read:
            return "read error from socket";
        case httplib::Error::Write:
            return "write error to socket";
        case httplib::Error::BindIPAddress:
            return "failed to bind local IP address";
        case httplib::Error::ExceedRedirectCount:
            return "too many redirects";
        case httplib::Error::Compression:
            return "decompression error";
        case httplib::Error::ProxyConnection:
            return "proxy connection failed";
        case httplib::Error::SSLConnection:
            return "TLS connection failed";
        default:
            return nullptr; // fall back to generic message with code
    }
}

std::string unreachable_error(const std::string& base, httplib::Error err) {
    if (const char* text = error_text(err)) {
        return "python inversion service at " + base + " unreachable: " + text;
    }
    return "python inversion service at " + base +
           " (transport error " + std::to_string(static_cast<int>(err)) + ")";
}

} // namespace

InversionClient::InversionClient()
    : host_(env_host()), port_(env_port()) {
    base_ = host_ + ":" + std::to_string(port_);
}

InversionResult InversionClient::get(const std::string& path) {
    httplib::Client cli(host_, port_);
    // Connect fast, wait long: the Python service may spend minutes inside
    // an inversion, but establishing the TCP connection should be instant.
    cli.set_connection_timeout(2, 0);
    cli.set_read_timeout(60, 0);

    try {
        httplib::Result res = cli.Get(path.c_str());
        if (!res) {
            return InversionResult{false, 0, "", unreachable_error(base_, res.error())};
        }
        return InversionResult{true, res->status, res->body, ""};
    } catch (const std::exception& e) {
        return InversionResult{false, 0, "", "request to " + base_ + " crashed: " + e.what()};
    } catch (...) {
        return InversionResult{false, 0, "", "request to " + base_ + " crashed with unknown error"};
    }
}

InversionResult InversionClient::post_json(const std::string& path, const std::string& json) {
    httplib::Client cli(host_, port_);
    cli.set_connection_timeout(2, 0);
    cli.set_read_timeout(60, 0);

    try {
        httplib::Result res = cli.Post(path.c_str(), json, "application/json");
        if (!res) {
            return InversionResult{false, 0, "", unreachable_error(base_, res.error())};
        }
        return InversionResult{true, res->status, res->body, ""};
    } catch (const std::exception& e) {
        return InversionResult{false, 0, "", "request to " + base_ + " crashed: " + e.what()};
    } catch (...) {
        return InversionResult{false, 0, "", "request to " + base_ + " crashed with unknown error"};
    }
}
