#include "../../include/models/governor_model.hpp"
#include <sstream>

GovernorModel::GovernorModel() : status("OK"), position(120.5), velocity(18.0), torque(7.0) {}

std::string GovernorModel::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"status\":\"" << status << "\","
        << "\"position\":" << position << ","
        << "\"velocity\":" << velocity << ","
        << "\"torque\":" << torque
        << "}";
    return oss.str();
}
