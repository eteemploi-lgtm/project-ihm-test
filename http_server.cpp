#include "../../include/transport/http_server.hpp"

#include <iostream>
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib")

HttpServer::HttpServer(StateRoutes& state_routes,
                       MotorRoutes& motor_routes,
                       SensorRoutes& sensor_routes,
                       BatteryRoutes& battery_routes,
                       GovernorRoutes& governor_routes)
    : state_routes_(state_routes),
      motor_routes_(motor_routes),
      sensor_routes_(sensor_routes),
      battery_routes_(battery_routes),
      governor_routes_(governor_routes) {}

std::string HttpServer::make_http_response(const std::string& body) {
    return "HTTP/1.1 200 OK\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" + body;
}

std::string HttpServer::make_not_found_response() {
    const std::string body = "{\"ok\":false,\"message\":\"Not found\"}";
    return "HTTP/1.1 404 Not Found\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" + body;
}

std::string HttpServer::make_bad_request_response(const std::string& body) {
    return "HTTP/1.1 400 Bad Request\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" + body;
}

std::string HttpServer::extract_body(const std::string& request) {
    const std::string separator = "\r\n\r\n";
    std::size_t pos = request.find(separator);
    if (pos == std::string::npos) return "";
    return request.substr(pos + separator.size());
}

void HttpServer::start() {
    WSADATA wsaData;
    int wsaResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (wsaResult != 0) {
        std::cerr << "WSAStartup failed: " << wsaResult << std::endl;
        return;
    }

    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        std::cerr << "Socket creation failed." << std::endl;
        WSACleanup();
        return;
    }

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(8080);

    if (bind(listenSocket, reinterpret_cast<sockaddr*>(&serverAddr), sizeof(serverAddr)) == SOCKET_ERROR) {
        std::cerr << "Bind failed." << std::endl;
        closesocket(listenSocket);
        WSACleanup();
        return;
    }

    if (listen(listenSocket, SOMAXCONN) == SOCKET_ERROR) {
        std::cerr << "Listen failed." << std::endl;
        closesocket(listenSocket);
        WSACleanup();
        return;
    }

    std::cout << "Server running on http://localhost:8080" << std::endl;

    while (true) {
        SOCKET clientSocket = accept(listenSocket, 0, 0);
        if (clientSocket == INVALID_SOCKET) {
            continue;
        }

        char buffer[8192];
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        if (bytesReceived > 0) {
            buffer[bytesReceived] = '\0';
            std::string request(buffer);
            std::string response;

            if (request.find("GET /api/status") != std::string::npos) {
                response = make_http_response(state_routes_.handle_get_status());
            } else if (request.find("GET /api/state") != std::string::npos) {
                response = make_http_response(state_routes_.handle_get_state());
            } else if (request.find("GET /api/motor") != std::string::npos) {
                response = make_http_response(motor_routes_.handle_get_motor());
            } else if (request.find("POST /api/motor/rpm_cmd") != std::string::npos) {
                std::string result = motor_routes_.handle_post_motor_rpm_cmd(extract_body(request));
                if (result.find("\"ok\":false") != std::string::npos) {
                    response = make_bad_request_response(result);
                } else {
                    response = make_http_response(result);
                }
            } else if (request.find("GET /api/sensors") != std::string::npos) {
                response = make_http_response(sensor_routes_.handle_get_sensors());
            } else if (request.find("GET /api/battery") != std::string::npos) {
                response = make_http_response(battery_routes_.handle_get_battery());
            } else if (request.find("GET /api/governor") != std::string::npos) {
                response = make_http_response(governor_routes_.handle_get_governor());
            } else {
                response = make_not_found_response();
            }

            send(clientSocket, response.c_str(), (int)response.size(), 0);
        }

        closesocket(clientSocket);
    }
}
