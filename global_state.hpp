#pragma once

#include <string>
#include <mutex>

struct MotorState {
int rpm_cmd = 0;
int rpm_actual = 0;
double temperature = 25.0;
std::string status = "STOP";
};

struct GouverneState {
double position = 0.0;
double vitesse = 0.0;
double couple = 0.0;
int statut_word = 0;
int txpdo_ms = 50;
int node_id = 2;
std::string status = "OK";
};

struct TemperatureSensorsState {
int temp_smo1 = 35;
int temp_smo2 = 35;
int temp_smo3 = 35;
int temp_plaque = 35;
};

struct PressureSensorState {
double value = 1.0;
std::string unit = "bar";
int state = 1;
std::string label = "Actif";
};

struct WaterSensorState {
int state = 0;
int value = 0;
std::string label = "Aucune détection";
};

struct SensorsState {
TemperatureSensorsState temperatures;
PressureSensorState pressure;
WaterSensorState water;
};

struct BatteryState {
int level = 100;
double temperature = 25.0;

double batt_i = 8.0;
double batt_u = 24.0;
double batt_uCharge = 28.0;
double batt_uDech = 22.0;

double batt_power = 190.0;
double batt_capacite = 42.0;
double batt_energie = 1.18;

double uelmin = 3.62;
double uelmax = 3.79;

double Tmin = 24.0;
double Tmax = 31.0;

std::string etat = "Charge";
std::string alarme = "Aucune";
std::string bms_state = "NORMAL";

double uelement1 = 3.70;
double uelement2 = 3.69;
double uelement3 = 3.74;
double uelement4 = 3.71;

double t1_disque = 25.0;
double t2_disque = 25.0;
};

struct SystemState {
std::string connection_status = "connected";
std::string server_status = "online";
std::string can_status = "unknown";
std::string mode = "simulation";
};

struct GlobalState {
SystemState system;
MotorState motor;
GouverneState gouverne;
SensorsState sensors;
BatteryState battery;

std::string system_to_json() const;
std::string motor_to_json() const;
std::string gouverne_to_json() const;
std::string sensors_to_json() const;
std::string battery_to_json() const;
std::string to_json() const;
};

extern GlobalState g_state;
extern std::mutex g_state_mutex;
