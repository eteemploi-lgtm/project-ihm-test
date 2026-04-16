#pragma once
#include <string>
#include "../services/governor_service.hpp"

class GovernorRoutes {
public:
    explicit GovernorRoutes(GovernorService& service);
    std::string handle_get_governor();
private:
    GovernorService& service_;
};
