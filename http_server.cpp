#include "transport/http_server.hpp"

#include "api/state_routes.hpp"
#include "api/motor_routes.hpp"
#include "api/sensor_routes.hpp"
#include "api/battery_routes.hpp"
#include "api/gouverne_routes.hpp"

#include <iostream>
#include <string>
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib")

namespace {

std::string make_http_response(const std::string& body) {
    return "HTTP/1.1 200 OK\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
           "Access-Control-Allow-Headers: Content-Type\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" +
           body;
}

std::string make_options_response() {
    return "HTTP/1.1 204 No Content\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
           "Access-Control-Allow-Headers: Content-Type\r\n"
           "Content-Length: 0\r\n"
           "Connection: close\r\n"
           "\r\n";
}

std::string make_not_found_response() {
    const std::string body = "{\"ok\":false,\"message\":\"Not found\"}";
    return "HTTP/1.1 404 Not Found\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
           "Access-Control-Allow-Headers: Content-Type\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" +
           body;
}

std::string make_bad_request_response(const std::string& body) {
    return "HTTP/1.1 400 Bad Request\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
           "Access-Control-Allow-Headers: Content-Type\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" +
           body;
}

std::string make_server_error_response(const std::string& body) {
    return "HTTP/1.1 500 Internal Server Error\r\n"
           "Content-Type: application/json\r\n"
           "Access-Control-Allow-Origin: *\r\n"
           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
           "Access-Control-Allow-Headers: Content-Type\r\n"
           "Content-Length: " + std::to_string(body.size()) + "\r\n"
           "Connection: close\r\n"
           "\r\n" +
           body;
}

std::string extract_body(const std::string& request) {
    const std::string separator = "\r\n\r\n";
    std::size_t pos = request.find(separator);
    if (pos == std::string::npos) {
        return "";
    }
    return request.substr(pos + separator.size());
}

bool starts_with(const std::string& s, const std::string& prefix) {
    return s.rfind(prefix, 0) == 0;
}

} // namespace

void start_http_server() {
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

    std::cout << "HTTP server running on http://localhost:8080" << std::endl;

    while (true) {
        SOCKET clientSocket = accept(listenSocket, nullptr, nullptr);
        if (clientSocket == INVALID_SOCKET) {
            std::cerr << "Accept failed." << std::endl;
            continue;
        }

        char buffer[8192];
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        if (bytesReceived > 0) {
            buffer[bytesReceived] = '\0';
            std::string request(buffer);

            std::string response;

            try {
                // Préflight CORS
                if (starts_with(request, "OPTIONS ")) {
                    response = make_options_response();
                }

                // STATUS
                else if (request.find("GET /api/status") != std::string::npos) {
                    response = make_http_response(
                        "{\"server_status\":\"online\",\"connection_status\":\"connected\",\"mode\":\"supervision\"}"
                    );
                }

                // STATE GLOBAL
                else if (request.find("GET /api/state") != std::string::npos) {
                    response = make_http_response(handle_get_state());
                }

                // MOTOR
                else if (request.find("GET /api/motor") != std::string::npos) {
                    response = make_http_response(handle_get_motor());
                }

                else if (request.find("POST /api/motor/rpm_cmd") != std::string::npos) {
                    std::string body = extract_body(request);
                    std::string result = handle_post_motor_rpm_cmd(body);

                    if (result.find("\"ok\":false") != std::string::npos) {
                        response = make_bad_request_response(result);
                    } else {
                        response = make_http_response(result);
                    }
                }

                // SENSORS
                else if (request.find("GET /api/sensors") != std::string::npos) {
                    response = make_http_response(handle_get_sensors());
                }

                // BATTERY
                else if (request.find("GET /api/battery") != std::string::npos) {
                    response = make_http_response(handle_get_battery());
                }

                // GOUVERNE
                else if (request.find("GET /api/gouverne") != std::string::npos) {
                    response = make_http_response(handle_get_gouverne());
                }
                else if (request.find("POST /api/gouverne/position_cmd") != std::string::npos) {
                    std::string body = extract_body(request);
                    std::string result = handle_post_gouverne_position_cmd(body);

                    if (result.find("\"ok\":false") != std::string::npos) {
                        response = make_bad_request_response(result);
                    } else {
                        response = make_http_response(result);
                    }
                }

                // 404
                else {
                    response = make_not_found_response();
                }
            }
            catch (const std::exception& e) {
                std::string body = std::string("{\"ok\":false,\"message\":\"") + e.what() + "\"}";
                response = make_server_error_response(body);
            }
            catch (...) {
                response = make_server_error_response("{\"ok\":false,\"message\":\"unknown server error\"}");
            }

            send(clientSocket, response.c_str(), static_cast<int>(response.size()), 0);
        }

        closesocket(clientSocket);
    }

    closesocket(listenSocket);
    WSACleanup();
}