#include "crow.h"

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

    app.port(8080).multithreaded().run();
    return 0;
}
