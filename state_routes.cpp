#include "api/state_routes.hpp"
#include "models/global_state.hpp"

extern GlobalState g_state;

std::string handle_get_state() {
    return g_state.to_json();
}