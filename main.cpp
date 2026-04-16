#include "../include/managers/device_manager.hpp"
#include "../include/services/state_service.hpp"
#include "../include/services/motor_service.hpp"
#include "../include/services/sensor_service.hpp"
#include "../include/services/battery_service.hpp"
#include "../include/services/governor_service.hpp"
#include "../include/api/state_routes.hpp"
#include "../include/api/motor_routes.hpp"
#include "../include/api/sensor_routes.hpp"
#include "../include/api/battery_routes.hpp"
#include "../include/api/governor_routes.hpp"
#include "../include/transport/http_server.hpp"

int main() {
    DeviceManager device_manager;

    StateService state_service(device_manager);
    MotorService motor_service(device_manager);
    SensorService sensor_service(device_manager);
    BatteryService battery_service(device_manager);
    GovernorService governor_service(device_manager);

    StateRoutes state_routes(state_service);
    MotorRoutes motor_routes(motor_service);
    SensorRoutes sensor_routes(sensor_service);
    BatteryRoutes battery_routes(battery_service);
    GovernorRoutes governor_routes(governor_service);

    HttpServer server(state_routes, motor_routes, sensor_routes, battery_routes, governor_routes);
    server.start();

    return 0;
}
