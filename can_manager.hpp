#pragma once
#include "../adapters/libcomm_adapter.hpp"
#include "../adapters/libtools_adapter.hpp"

class CanManager {
public:
    CanManager();

    bool send_motor_rpm_cmd(int rpm_cmd);
    bool poll();

private:
    LibCommAdapter comm_;
    LibToolsAdapter tools_;
};
