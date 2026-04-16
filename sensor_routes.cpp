#include "../../include/api/sensor_routes.hpp"

SensorRoutes::SensorRoutes(SensorService& service) : service_(service) {}

std::string SensorRoutes::handle_get_sensors() {
    return service_.get_sensors_json();
}
