#include "../../include/adapters/libdevice_adapter.hpp"

LibDeviceAdapter::LibDeviceAdapter() {}

MotorModel LibDeviceAdapter::read_motor() const {
    MotorModel model;
    model.status = "RUN";
    model.rpm_actual = 1450;
    model.rpm_cmd = 1500;
    model.temperature = 39.0;
    return model;
}

SensorModel LibDeviceAdapter::read_sensors() const {
    return SensorModel();
}

BatteryModel LibDeviceAdapter::read_battery() const {
    return BatteryModel();
}

GovernorModel LibDeviceAdapter::read_governor() const {
    return GovernorModel();
}
