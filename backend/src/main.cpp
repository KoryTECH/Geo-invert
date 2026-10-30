#include "crow.h"
#include "inversion_client.h"

namespace {

// Bridge used by the /api/bridge/* routes below. Host/port come from
// INVERSION_HOST / INVERSION_PORT (defaults 127.0.0.1 / 8000).
InversionClient inversion_client;

crow::response error_response(int http_status, const std::string& message) {
    crow::json::wvalue result;
    result["status"] = "error";
    result["message"] = message;
    crow::response res(http_status);
    res.set_header("Content-Type", "application/json");
    res.body = result.dump();
    return res;
}

crow::response forward_response(const InversionResult& r) {
    crow::response res(r.status);
    res.set_header("Content-Type", "application/json");
    res.body = r.body;
    return res;
}

} // namespace

int main() {
    crow::SimpleApp app;

    // Health check route
    CROW_ROUTE(app, "/health")([]() {
        crow::json::wvalue result;
        result["status"] = "ok";
        result["service"] = "geo-invert-backend";
        return result;
    });

    // Placeholder auth route
    CROW_ROUTE(app, "/api/auth/login").methods("POST"_method)(
        [](const crow::request& req) {
            crow::json::wvalue result;
            result["message"] = "auth coming soon";
            return result;
        }
    );

    // Placeholder upload route
    CROW_ROUTE(app, "/api/upload").methods("POST"_method)(
        [](const crow::request& req) {
            crow::json::wvalue result;
            result["message"] = "upload coming soon";
            return result;
        }
    );

    // Bridge: proxy the Python inversion service health check
    CROW_ROUTE(app, "/api/bridge/health")([]() {
        InversionResult r = inversion_client.get("/health");
        if (!r.ok) {
            return error_response(502, r.error);
        }
        return forward_response(r);
    });

    // Bridge: validate JSON, then hand it to the Python /echo route
    CROW_ROUTE(app, "/api/bridge/echo").methods("POST"_method)(
        [](const crow::request& req) {
            auto parsed = crow::json::load(req.body);
            if (!parsed) {
                return error_response(400, "request body is not valid JSON");
            }
            InversionResult r = inversion_client.post_json("/echo", req.body);
            if (!r.ok) {
                return error_response(502, r.error);
            }
            return forward_response(r);
        }
    );

    app.port(8080).multithreaded().run();
    return 0;
}
