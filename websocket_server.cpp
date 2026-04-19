#include "transport/websocket_server.hpp"
#include "models/global_state.hpp"

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>

#include <iostream>
#include <thread>
#include <chrono>
#include <string>
#include <vector>
#include <mutex>
#include <algorithm>

#pragma comment(lib, "ws2_32.lib")

namespace {
std::vector<SOCKET> g_ws_clients;
std::mutex g_ws_clients_mutex;

void remove_dead_clients() {
std::lock_guard<std::mutex> lock(g_ws_clients_mutex);

g_ws_clients.erase(
std::remove_if(
g_ws_clients.begin(),
g_ws_clients.end(),
[](SOCKET s) { return s == INVALID_SOCKET; }
),
g_ws_clients.end()
);
}

void broadcast_state_loop() {
while (true) {
std::string json;
{
std::lock_guard<std::mutex> lock(g_state_mutex);
json = g_state.to_json();
}

{
std::lock_guard<std::mutex> lock(g_ws_clients_mutex);
for (auto& client : g_ws_clients) {
if (client == INVALID_SOCKET) {
continue;
}

const int sent = send(client, json.c_str(), static_cast<int>(json.size()), 0);
if (sent == SOCKET_ERROR) {
closesocket(client);
client = INVALID_SOCKET;
}
}
}

remove_dead_clients();
std::this_thread::sleep_for(std::chrono::milliseconds(200));
}
}
}

void start_websocket_server() {
std::thread([]() {
WSADATA wsaData;
const int wsa = WSAStartup(MAKEWORD(2, 2), &wsaData);
if (wsa != 0) {
std::cerr << "WSAStartup failed: " << wsa << std::endl;
return;
}

SOCKET server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
if (server_fd == INVALID_SOCKET) {
std::cerr << "WS socket creation failed." << std::endl;
WSACleanup();
return;
}

sockaddr_in addr{};
addr.sin_family = AF_INET;
addr.sin_addr.s_addr = INADDR_ANY;
addr.sin_port = htons(8081);

if (bind(server_fd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) == SOCKET_ERROR) {
std::cerr << "WS bind failed: " << WSAGetLastError() << std::endl;
closesocket(server_fd);
WSACleanup();
return;
}

if (listen(server_fd, SOMAXCONN) == SOCKET_ERROR) {
std::cerr << "WS listen failed: " << WSAGetLastError() << std::endl;
closesocket(server_fd);
WSACleanup();
return;
}

std::cout << "WebSocket server listening on ws://localhost:8081" << std::endl;

std::thread(broadcast_state_loop).detach();

while (true) {
SOCKET client = accept(server_fd, nullptr, nullptr);
if (client == INVALID_SOCKET) {
continue;
}

std::lock_guard<std::mutex> lock(g_ws_clients_mutex);
g_ws_clients.push_back(client);
}
}).detach();
}
