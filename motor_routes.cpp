#include "../../include/api/motor_routes.hpp"
#include <cstdlib>

MotorRoutes::MotorRoutes(MotorService& service) : service_(service) {}

std::string MotorRoutes::handle_get_motor() {
    return service_.get_motor_json();
}

int MotorRoutes::extract_rpm_cmd(const std::string& request_body, bool& ok) {
    ok = false;
    std::size_t pos = request_body.find("rpm_cmd");
    if (pos == std::string::npos) return 0;

    pos = request_body.find(':', pos);
    if (pos == std::string::npos) return 0;
    ++pos;

    while (pos < request_body.size() &&
           (request_body[pos] == ' ' || request_body[pos] == '\t' || request_body[pos] == '"')) {
        ++pos;
    }

    std::size_t end = pos;
    while (end < request_body.size() &&
           (request_body[end] == '-' || (request_body[end] >= '0' && request_body[end] <= '9'))) {
        ++end;
    }

    if (end == pos) return 0;

    ok = true;
    return std::atoi(request_body.substr(pos, end - pos).c_str());
}

std::string MotorRoutes::handle_post_motor_rpm_cmd(const std::string& request_body) {
    bool ok = false;
    int rpm_cmd = extract_rpm_cmd(request_body, ok);

    if (!ok) {
        return "{\"ok\":false,\"message\":\"rpm_cmd manquant ou invalide\"}";
    }

    return service_.set_rpm_cmd_json(rpm_cmd);
}
