#include "../../include/api/state_routes.hpp"

StateRoutes::StateRoutes(StateService& service) : service_(service) {}

std::string StateRoutes::handle_get_status() {
    return service_.get_status_json();
}

std::string StateRoutes::handle_get_state() {
    return service_.get_state_json();
}
