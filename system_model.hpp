#pragma once
#include <string>

struct SystemModel {
    std::string server_status;
    std::string connection_status;
    std::string mode;

    SystemModel();
    std::string to_json() const;
};
