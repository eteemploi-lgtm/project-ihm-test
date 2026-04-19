#include "../../include/models/motor_model.hpp"
#include <sstream>

MotorModel::MotorModel() : status("STOP"), rpm_actual(0), rpm_cmd(0), temperature(25.0) {}

std::string MotorModel::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"status\":\"" << status << "\","
        << "\"rpm_actual\":" << rpm_actual << ","
        << "\"rpm_cmd\":" << rpm_cmd << ","
        << "\"temperature\":" << temperature
        << "}";
    return oss.str();
}
