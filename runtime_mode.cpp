#include "config/runtime_mode.hpp"

RuntimeMode g_runtime_mode = RuntimeMode::SIMULATION;

std::string runtime_mode_to_string(RuntimeMode mode) {
switch (mode) {
case RuntimeMode::SIMULATION:
return "simulation";
case RuntimeMode::CAN_LIVE:
return "can-live";
default:
return "unknown";
}
}
