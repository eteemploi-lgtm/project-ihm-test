#include "../../include/models/sensor_model.hpp"
#include <sstream>

BinarySensor::BinarySensor() : state(0), label("UNKNOWN"), value(0.0), unit("") {}

std::string BinarySensor::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"state\":" << state << ","
        << "\"label\":\"" << label << "\","
        << "\"value\":" << value;
    if (!unit.empty()) {
        oss << ",\"unit\":\"" << unit << "\"";
    }
    oss << "}";
    return oss.str();
}

SensorModel::SensorModel() {
    water.state = 0; water.label = "Aucune détection"; water.value = 0;
    pressure.state = 1; pressure.label = "Actif"; pressure.value = 1.02; pressure.unit = "bar";
    temperature.state = 1; temperature.label = "Actif"; temperature.value = 39.0; temperature.unit = "C";
}

std::string SensorModel::to_json() const {
    std::ostringstream oss;
    oss << "{"
        << "\"water\":" << water.to_json() << ","
        << "\"pressure\":" << pressure.to_json() << ","
        << "\"temperature\":" << temperature.to_json()
        << "}";
    return oss.str();
}
