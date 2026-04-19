#include "models/global_state.hpp"

#include <sstream>

GlobalState g_state;
std::mutex g_state_mutex;

std::string GlobalState::system_to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"connection_status\":\"" << system.connection_status << "\","
<< "\"server_status\":\"" << system.server_status << "\","
<< "\"can_status\":\"" << system.can_status << "\","
<< "\"mode\":\"" << system.mode << "\""
<< "}";
return oss.str();
}

std::string GlobalState::motor_to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"rpm_cmd\":" << motor.rpm_cmd << ","
<< "\"rpm_actual\":" << motor.rpm_actual << ","
<< "\"temperature\":" << motor.temperature << ","
<< "\"status\":\"" << motor.status << "\""
<< "}";
return oss.str();
}

std::string GlobalState::gouverne_to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"position\":" << gouverne.position << ","
<< "\"vitesse\":" << gouverne.vitesse << ","
<< "\"couple\":" << gouverne.couple << ","
<< "\"statut_word\":" << gouverne.statut_word << ","
<< "\"txpdo_ms\":" << gouverne.txpdo_ms << ","
<< "\"node_id\":" << gouverne.node_id << ","
<< "\"status\":\"" << gouverne.status << "\""
<< "}";
return oss.str();
}

std::string GlobalState::sensors_to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"temperatures\":{"
<< "\"temp_smo1\":" << sensors.temperatures.temp_smo1 << ","
<< "\"temp_smo2\":" << sensors.temperatures.temp_smo2 << ","
<< "\"temp_smo3\":" << sensors.temperatures.temp_smo3 << ","
<< "\"temp_plaque\":" << sensors.temperatures.temp_plaque
<< "},"
<< "\"pressure\":{"
<< "\"value\":" << sensors.pressure.value << ","
<< "\"unit\":\"" << sensors.pressure.unit << "\","
<< "\"state\":" << sensors.pressure.state << ","
<< "\"label\":\"" << sensors.pressure.label << "\""
<< "},"
<< "\"water\":{"
<< "\"state\":" << sensors.water.state << ","
<< "\"value\":" << sensors.water.value << ","
<< "\"label\":\"" << sensors.water.label << "\""
<< "}"
<< "}";
return oss.str();
}

std::string GlobalState::battery_to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"level\":" << battery.level << ","
<< "\"temperature\":" << battery.temperature << ","
<< "\"batt_T\":" << battery.temperature << ","
<< "\"batt_i\":" << battery.batt_i << ","
<< "\"batt_u\":" << battery.batt_u << ","
<< "\"batt_uCharge\":" << battery.batt_uCharge << ","
<< "\"batt_uDech\":" << battery.batt_uDech << ","
<< "\"batt_Power\":" << battery.batt_power << ","
<< "\"batt_Capacite\":" << battery.batt_capacite << ","
<< "\"batt_Energie\":" << battery.batt_energie << ","
<< "\"uelmin\":" << battery.uelmin << ","
<< "\"uelmax\":" << battery.uelmax << ","
<< "\"Tmin\":" << battery.Tmin << ","
<< "\"Tmax\":" << battery.Tmax << ","
<< "\"etat\":\"" << battery.etat << "\","
<< "\"alarme\":\"" << battery.alarme << "\","
<< "\"BMSstate\":\"" << battery.bms_state << "\","
<< "\"uelement1\":" << battery.uelement1 << ","
<< "\"uelement2\":" << battery.uelement2 << ","
<< "\"uelement3\":" << battery.uelement3 << ","
<< "\"uelement4\":" << battery.uelement4 << ","
<< "\"t1_disque\":" << battery.t1_disque << ","
<< "\"t2_disque\":" << battery.t2_disque
<< "}";
return oss.str();
}

std::string GlobalState::to_json() const {
std::ostringstream oss;
oss << "{"
<< "\"system\":" << system_to_json() << ","
<< "\"motor\":" << motor_to_json() << ","
<< "\"gouverne\":" << gouverne_to_json() << ","
<< "\"sensors\":" << sensors_to_json() << ","
<< "\"battery\":" << battery_to_json()
<< "}";
return oss.str();
}
