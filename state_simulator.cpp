#include "sim/state_simulator.hpp"

#include "models/global_state.hpp"
#include "config/runtime_mode.hpp"

#include <thread>
#include <chrono>
#include <cmath>

namespace {
double clamp_double(double v, double lo, double hi) {
if (v < lo) return lo;
if (v > hi) return hi;
return v;
}

int clamp_int(int v, int lo, int hi) {
if (v < lo) return lo;
if (v > hi) return hi;
return v;
}
}

void start_state_simulator() {
std::thread([]() {
double phase = 0.0;

while (true) {
if (g_runtime_mode == RuntimeMode::SIMULATION) {
std::lock_guard<std::mutex> lock(g_state_mutex);

g_state.system.mode = "simulation";
g_state.system.server_status = "online";
g_state.system.connection_status = "connected";

phase += 0.15;

// Motor
g_state.motor.rpm_actual = clamp_int(
static_cast<int>(1000.0 + 1000.0 * (0.5 + 0.5 * std::sin(phase))),
0, 3000
);
g_state.motor.rpm_cmd = clamp_int(g_state.motor.rpm_actual + 50, 0, 3000);
g_state.motor.temperature = clamp_double(30.0 + 10.0 * std::sin(phase * 0.7), 20.0, 80.0);
g_state.motor.status = (g_state.motor.rpm_actual > 0) ? "RUN" : "STOP";

// Gouverne
g_state.gouverne.position = clamp_double(20.0 * std::sin(phase * 0.5), -150.0, 150.0);
g_state.gouverne.vitesse = clamp_double(5.0 + 2.0 * std::cos(phase), 0.0, 30.0);
g_state.gouverne.couple = clamp_double(3.0 + 1.5 * std::sin(phase * 1.2), 0.0, 25.0);
g_state.gouverne.statut_word = 0;
g_state.gouverne.txpdo_ms = 50;
g_state.gouverne.node_id = 2;
g_state.gouverne.status = "OK";

// Sensors temperatures
g_state.sensors.temperatures.temp_smo1 = clamp_int(static_cast<int>(35 + 6 * std::sin(phase)), 25, 80);
g_state.sensors.temperatures.temp_smo2 = clamp_int(static_cast<int>(34 + 5 * std::cos(phase * 0.8)), 25, 80);
g_state.sensors.temperatures.temp_smo3 = clamp_int(static_cast<int>(36 + 7 * std::sin(phase * 0.6)), 25, 80);
g_state.sensors.temperatures.temp_plaque = clamp_int(static_cast<int>(37 + 4 * std::cos(phase * 0.9)), 25, 90);

// Pressure
g_state.sensors.pressure.value = clamp_double(1.1 + 0.25 * std::sin(phase * 0.9), 0.8, 1.5);
g_state.sensors.pressure.unit = "bar";
if (g_state.sensors.pressure.value < 1.10) {
g_state.sensors.pressure.state = 1;
g_state.sensors.pressure.label = "Actif";
} else {
g_state.sensors.pressure.state = 2;
g_state.sensors.pressure.label = "Élevé";
}

// Water
g_state.sensors.water.state = 0;
g_state.sensors.water.value = 0;
g_state.sensors.water.label = "Aucune détection";

// Battery
g_state.battery.level = clamp_int(static_cast<int>(50 + 20 * std::sin(phase * 0.4)), 10, 100);
g_state.battery.temperature = clamp_double(27.0 + 3.0 * std::sin(phase * 0.7), 20.0, 45.0);
g_state.battery.batt_i = clamp_double(8.0 + 1.0 * std::sin(phase), 5.0, 20.0);
g_state.battery.batt_u = clamp_double(24.3 + 0.3 * std::cos(phase), 24.0, 29.0);
g_state.battery.batt_uCharge = clamp_double(28.3 + 0.2 * std::sin(phase), 26.0, 30.0);
g_state.battery.batt_uDech = clamp_double(22.3 + 0.2 * std::cos(phase), 20.0, 24.0);

g_state.battery.batt_power =
clamp_double(g_state.battery.batt_u * g_state.battery.batt_i, 100.0, 500.0);

g_state.battery.batt_capacite = 42.0;
g_state.battery.batt_energie = 1.18;

g_state.battery.uelmin = 3.62;
g_state.battery.uelmax = 3.79;
g_state.battery.Tmin = 24.0;
g_state.battery.Tmax = 31.0;

g_state.battery.etat = (g_state.battery.level > 25) ? "Charge" : "Faible";
g_state.battery.alarme = (g_state.battery.temperature > 40.0) ? "Surchauffe" : "Aucune";
g_state.battery.bms_state = (g_state.battery.temperature > 40.0) ? "WARN" : "NORMAL";

g_state.battery.uelement1 = clamp_double(3.70 + 0.03 * std::sin(phase), 3.50, 3.90);
g_state.battery.uelement2 = clamp_double(3.69 + 0.03 * std::cos(phase), 3.50, 3.90);
g_state.battery.uelement3 = clamp_double(3.74 + 0.03 * std::sin(phase * 0.8), 3.50, 3.90);
g_state.battery.uelement4 = clamp_double(3.71 + 0.03 * std::cos(phase * 0.8), 3.50, 3.90);

g_state.battery.t1_disque = clamp_double(g_state.battery.temperature, 20.0, 50.0);
g_state.battery.t2_disque = clamp_double(g_state.battery.temperature, 20.0, 50.0);
}

std::this_thread::sleep_for(std::chrono::milliseconds(100));
}
}).detach();
}
