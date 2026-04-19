#include "can/can_codec.hpp"

CanFrame CanCodec::encode_motor_rpm_cmd(int rpm) {
    CanFrame frame;
    frame.id = 0x201;
    frame.data = {
        static_cast<uint8_t>(rpm & 0xFF),
        static_cast<uint8_t>((rpm >> 8) & 0xFF)
    };
    return frame;
}

CanFrame CanCodec::encode_gouverne_position_cmd(double position) {
    int scaled = static_cast<int>((position + 150.0) * 10.0);

    CanFrame frame;
    frame.id = 0x202;
    frame.data = {
        static_cast<uint8_t>(scaled & 0xFF),
        static_cast<uint8_t>((scaled >> 8) & 0xFF)
    };
    return frame;
}

bool CanCodec::decode_motor_frame(const CanFrame& frame, DecodedMotorFrame& out) {
    if (frame.id != 0x181 || frame.data.size() < 4) return false;

    out.rpm_actual = frame.data[0] | (frame.data[1] << 8);
    out.temperature = static_cast<double>(frame.data[2]);
    out.status_code = frame.data[3];
    return true;
}

bool CanCodec::decode_temperature_frame(const CanFrame& frame, DecodedTemperatureSensorsFrame& out) {
    if (frame.id != 0x182 || frame.data.size() < 4) return false;

    out.temp_smo1 = static_cast<int8_t>(frame.data[0]);
    out.temp_smo2 = static_cast<int8_t>(frame.data[1]);
    out.temp_smo3 = static_cast<int8_t>(frame.data[2]);
    out.temp_plaque = static_cast<int8_t>(frame.data[3]);
    return true;
}

bool CanCodec::decode_pressure_frame(const CanFrame& frame, DecodedPressureFrame& out) {
    if (frame.id != 0x183 || frame.data.size() < 2) return false;

    int raw = frame.data[0] | (frame.data[1] << 8);
    out.pressure = raw / 100.0;
    return true;
}

bool CanCodec::decode_water_frame(const CanFrame& frame, DecodedWaterFrame& out) {
    if (frame.id != 0x184 || frame.data.size() < 1) return false;

    out.state = frame.data[0] ? 1 : 0;
    return true;
}

bool CanCodec::decode_battery_frame(const CanFrame& frame, DecodedBatteryFrame& out) {
    if (frame.id != 0x185 || frame.data.size() < 4) return false;

    out.level = frame.data[0];
    out.temperature = static_cast<double>(frame.data[1]);
    out.t1_disque = static_cast<double>(frame.data[2]);
    out.t2_disque = static_cast<double>(frame.data[3]);
    return true;
}