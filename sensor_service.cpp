#include "../../include/services/sensor_service.hpp"

SensorService::SensorService(DeviceManager& device_manager) : device_manager_(device_manager) {}

std::string SensorService::get_sensors_json() {
    return device_manager_.get_sensors().to_json();
}
