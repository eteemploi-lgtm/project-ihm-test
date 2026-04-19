#include "services/motor_service.hpp"
#include "models/global_state.hpp"
#include "managers/device_manager.hpp"

#include <sstream>

extern GlobalState g_state;
static DeviceManager g_device_manager;

std::string MotorService::get_motor_json() const {
    return g_state.motor_to_json();
}

std::string MotorService::set_rpm_cmd(int rpm) {
    if (rpm < 0 || rpm > 3000) {
        return "{\"ok\":false,\"message\":\"rpm_cmd hors plage (0-3000)\"}";
    }

    g_state.motor.rpm_cmd = rpm;

    if (!g_device_manager.set_motor_rpm(rpm)) {
        return "{\"ok\":false,\"message\":\"echec envoi CAN\"}";
    }

    std::ostringstream oss;
    oss << "{"
        << "\"ok\":true,"
        << "\"message\":\"Nouvelle consigne appliquee\","
        << "\"motor\":{"
        << "\"rpm_cmd\":" << rpm
        << "}"
        << "}";

    return oss.str();
}