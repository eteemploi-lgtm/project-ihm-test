#include "../../include/models/system_model.hpp"
#include <sstream>

SystemModel::SystemModel() : server_status("online"), connection_status("connected"), mode("supervision") {}

std::string SystemModel::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"server_status\":\"" << server_status << "\","
        << "\"connection_status\":\"" << connection_status << "\","
        << "\"mode\":\"" << mode << "\""
        << "}";
    return oss.str();
}
