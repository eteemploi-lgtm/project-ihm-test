#include "api/battery_routes.hpp"
#include "models/global_state.hpp"

extern GlobalState g_state;

std::string handle_get_battery() {
    return g_state.battery_to_json();
}