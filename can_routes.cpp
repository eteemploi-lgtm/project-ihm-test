#include "can/can_status.hpp"

#include <string>

std::string handle_get_can_status() {
return can_status_to_json();
}