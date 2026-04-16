#include "../../include/models/battery_model.hpp"
#include <sstream>

BatteryModel::BatteryModel() : status("NORMAL"), soc(78), temperature(31.0), voltage(27.8) {}

std::string BatteryModel::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"status\":\"" << status << "\","
        << "\"soc\":" << soc << ","
        << "\"temperature\":" << temperature << ","
        << "\"voltage\":" << voltage
        << "}";
    return oss.str();
}
