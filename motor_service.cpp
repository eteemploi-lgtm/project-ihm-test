#include "../../include/services/motor_service.hpp"
#include <sstream>

MotorService::MotorService(DeviceManager& device_manager) : device_manager_(device_manager) {}

std::string MotorService::get_motor_json() const {
    return device_manager_.get_motor().to_json();
}

std::string MotorService::set_rpm_cmd_json(int rpm_cmd) {
    std::ostringstream oss;

    if (!device_manager_.set_motor_rpm(rpm_cmd)) {
        return "{\"ok\":false,\"message\":\"rpm_cmd hors plage ou CAN indisponible\"}";
    }

    oss << "{"
        << "\"ok\":true,"
        << "\"message\":\"Nouvelle consigne appliquee\","
        << "\"motor\":{"
        << "\"rpm_cmd\":" << rpm_cmd
        << "}"
        << "}";
    return oss.str();
}
