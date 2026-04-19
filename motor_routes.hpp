#pragma once

#include <string>

std::string handle_get_motor();
std::string handle_post_motor_rpm_cmd(const std::string& request_body);