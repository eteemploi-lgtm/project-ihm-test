#include "../../include/services/battery_service.hpp"

BatteryService::BatteryService(DeviceManager& device_manager) : device_manager_(device_manager) {}

std::string BatteryService::get_battery_json() {
    return device_manager_.get_battery().to_json();
}
