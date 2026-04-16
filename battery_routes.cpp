#include "../../include/api/battery_routes.hpp"

BatteryRoutes::BatteryRoutes(BatteryService& service) : service_(service) {}

std::string BatteryRoutes::handle_get_battery() {
    return service_.get_battery_json();
}
