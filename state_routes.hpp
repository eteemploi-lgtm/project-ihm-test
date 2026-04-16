#pragma once
#include <string>
#include "../services/state_service.hpp"

class StateRoutes {
public:
    explicit StateRoutes(StateService& service);

    std::string handle_get_status();
    std::string handle_get_state();

private:
    StateService& service_;
};
