#include "api/motor_routes.hpp"
#include "models/global_state.hpp"

#include <cstdlib>
#include <sstream>
#include <string>

extern GlobalState g_state;

static bool extract_rpm_cmd_value(const std::string& body, int& value) {
    std::size_t pos = body.find("rpm_cmd");
    if (pos == std::string::npos) {
        return false;
    }

    pos = body.find(':', pos);
    if (pos == std::string::npos) {
        return false;
    }

    ++pos;

    while (pos < body.size() &&
           (body[pos] == ' ' || body[pos] == '\t' || body[pos] == '\"')) {
        ++pos;
    }

    std::size_t end = pos;
    while (end < body.size() &&
           (body[end] == '-' || (body[end] >= '0' && body[end] <= '9'))) {
        ++end;
    }

    if (end == pos) {
        return false;
    }

    value = std::atoi(body.substr(pos, end - pos).c_str());
    return true;
}

std::string handle_get_motor() {
    return g_state.motor_to_json();
}

std::string handle_post_motor_rpm_cmd(const std::string& request_body) {
    int new_rpm_cmd = 0;

    if (!extract_rpm_cmd_value(request_body, new_rpm_cmd)) {
        return "{\"ok\":false,\"message\":\"rpm_cmd manquant ou invalide\"}";
    }

    if (new_rpm_cmd < 0 || new_rpm_cmd > 3000) {
        return "{\"ok\":false,\"message\":\"rpm_cmd hors plage (0-3000)\"}";
    }

    g_state.motor.rpm_cmd = new_rpm_cmd;

    if (new_rpm_cmd == 0) {
        g_state.motor.status = "STOP";
    } else {
        g_state.motor.status = "RUN";
    }

    std::ostringstream oss;
    oss << "{"
        << "\"ok\":true,"
        << "\"message\":\"Nouvelle consigne appliquee\","
        << "\"motor\":{"
        << "\"rpm_cmd\":" << g_state.motor.rpm_cmd << ","
        << "\"status\":\"" << g_state.motor.status << "\""
        << "}"
        << "}";

    return oss.str();
}