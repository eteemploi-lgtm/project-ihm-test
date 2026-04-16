#include "../../include/models/global_state.hpp"
#include <sstream>

GlobalState::GlobalState() {}

std::string GlobalState::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"system\":" << system.to_json() << ","
        << "\"motor\":" << motor.to_json() << ","
        << "\"sensors\":" << sensors.to_json() << ","
        << "\"battery\":" << battery.to_json() << ","
        << "\"governor\":" << governor.to_json()
        << "}";
    return oss.str();
}
