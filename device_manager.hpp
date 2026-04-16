#pragma once
#include "../models/motor_model.hpp"
#include "../models/sensor_model.hpp"
#include "../models/battery_model.hpp"
#include "../models/governor_model.hpp"
#include "../models/global_state.hpp"
#include "state_manager.hpp"
#include "can_manager.hpp"
#include "../adapters/libdevice_adapter.hpp"

class DeviceManager {
public:
    DeviceManager();

    MotorModel get_motor() const;
    SensorModel get_sensors() const;
    BatteryModel get_battery() const;
    GovernorModel get_governor() const;

    bool set_motor_rpm(int rpm_cmd);
    void refresh_from_devices();

    GlobalState get_global_state() const;

private:
    StateManager state_manager_;
    CanManager can_manager_;
    LibDeviceAdapter device_adapter_;
};
