#include "../../include/services/state_service.hpp"

StateService::StateService(DeviceManager& device_manager) : device_manager_(device_manager) {}

std::string StateService::get_state_json() {
    device_manager_.refresh_from_devices();
    return device_manager_.get_global_state().to_json();
}

std::string StateService::get_status_json() {
    return "{\"server_status\":\"online\",\"connection_status\":\"connected\",\"mode\":\"supervision\"}";
}
