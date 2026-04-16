# API CAN Scaffold

Starter backend architecture for:
- same web server
- same API for both projects
- Ethernet on head
- CAN on field devices

## Main routes
- GET /api/status
- GET /api/state
- GET /api/motor
- POST /api/motor/rpm_cmd
- GET /api/sensors
- GET /api/battery
- GET /api/governor

## Where to plug your existing code
- `src/adapters/libcomm_adapter.cpp`
- `src/adapters/libtools_adapter.cpp`
- `src/adapters/libdevice_adapter.cpp`

These files are the integration points with:
- LibComm
- LibTools
- LibDevice
