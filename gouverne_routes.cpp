#include "api/gouverne_routes.hpp"
#include "models/global_state.hpp"
#include "can/can_manager.hpp"

#include <cstdlib>
#include <sstream>
#include <string>
#include <mutex>

extern GlobalState g_state;
extern std::mutex g_state_mutex;

static bool extract_position_cmd_value(const std::string& body, double& value) {
    std::size_t pos = body.find("position_cmd");
    if (pos == std::string::npos) return false;

    pos = body.find(':', pos);
    if (pos == std::string::npos) return false;
    ++pos;

    while (pos < body.size() &&
           (body[pos] == ' ' || body[pos] == '\t' || body[pos] == '\"')) {
        ++pos;
    }

    std::size_t end = pos;
    while (end < body.size() &&
           (body[end] == '-' || body[end] == '.' || (body[end] >= '0' && body[end] <= '9'))) {
        ++end;
    }

    if (end == pos) return false;

    value = std::atof(body.substr(pos, end - pos).c_str());
    return true;
}

std::string handle_get_gouverne() {
    std::lock_guard<std::mutex> lock(g_state_mutex);
    return g_state.gouverne_to_json();
}

std::string handle_post_gouverne_position_cmd(const std::string& request_body) {
    double new_position_cmd = 0.0;

    if (!extract_position_cmd_value(request_body, new_position_cmd)) {
        return "{\"ok\":false,\"message\":\"position_cmd manquant ou invalide\"}";
    }

    if (new_position_cmd < -150.0 || new_position_cmd > 150.0) {
        return "{\"ok\":false,\"message\":\"position_cmd hors plage (-150 à 150)\"}";
    }

    {
        std::lock_guard<std::mutex> lock(g_state_mutex);
        g_state.gouverne.position = new_position_cmd;
        g_state.gouverne.status = "OK";
    }

    std::ostringstream oss;
    oss << "{"
        << "\"ok\":true,"
        << "\"message\":\"Nouvelle position gouverne appliquee\","
        << "\"gouverne\":{"
        << "\"position\":" << new_position_cmd << ","
        << "\"status\":\"OK\""
        << "}"
        << "}";

    return oss.str();
}