#pragma once
#include <string>
#include "../api/state_routes.hpp"
#include "../api/motor_routes.hpp"
#include "../api/sensor_routes.hpp"
#include "../api/battery_routes.hpp"
#include "../api/governor_routes.hpp"

class HttpServer {
public:
    HttpServer(StateRoutes& state_routes,
               MotorRoutes& motor_routes,
               SensorRoutes& sensor_routes,
               BatteryRoutes& battery_routes,
               GovernorRoutes& governor_routes);

    void start();

private:
    std::string make_http_response(const std::string& body);
    std::string make_not_found_response();
    std::string make_bad_request_response(const std::string& body);
    std::string extract_body(const std::string& request);

    StateRoutes& state_routes_;
    MotorRoutes& motor_routes_;
    SensorRoutes& sensor_routes_;
    BatteryRoutes& battery_routes_;
    GovernorRoutes& governor_routes_;
};
