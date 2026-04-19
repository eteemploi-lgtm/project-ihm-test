#include "api/sensor_routes.hpp"
#include "models/global_state.hpp"

extern GlobalState g_state;

std::string handle_get_sensors() {
    return g_state.sensors_to_json();
}