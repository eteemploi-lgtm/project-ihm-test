#include "../../include/services/governor_service.hpp"

GovernorService::GovernorService(DeviceManager& device_manager) : device_manager_(device_manager) {}

std::string GovernorService::get_governor_json() {
    return device_manager_.get_governor().to_json();
}
