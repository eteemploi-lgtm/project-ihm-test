#pragma once

#include "models/global_state.hpp"

class LibDeviceAdapter {
public:
    bool init();

    bool sync_motor(GlobalState& state);
    bool sync_gouverne(GlobalState& state);
    bool sync_sensors(GlobalState& state);
    bool sync_battery(GlobalState& state);

private:
    bool initialized_ = false;
};