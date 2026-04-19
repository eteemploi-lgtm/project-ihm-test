#pragma once

#include <string>

enum class RuntimeMode {
SIMULATION,
CAN_LIVE
};

extern RuntimeMode g_runtime_mode;

std::string runtime_mode_to_string(RuntimeMode mode);
