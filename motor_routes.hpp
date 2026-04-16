#pragma once
#include <string>
#include "../services/motor_service.hpp"

class MotorRoutes {
public:
    explicit MotorRoutes(MotorService& service);

    std::string handle_get_motor();
    std::string handle_post_motor_rpm_cmd(const std::string& request_body);

private:
    int extract_rpm_cmd(const std::string& request_body, bool& ok);
    MotorService& service_;
};
