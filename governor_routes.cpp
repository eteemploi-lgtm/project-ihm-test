#include "../../include/api/governor_routes.hpp"

GovernorRoutes::GovernorRoutes(GovernorService& service) : service_(service) {}

std::string GovernorRoutes::handle_get_governor() {
    return service_.get_governor_json();
}
