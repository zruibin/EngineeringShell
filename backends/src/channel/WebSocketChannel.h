/*
 * WebSocketChannel.h
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#ifndef WEBSOCKETCHANNEL_H
#define WEBSOCKETCHANNEL_H

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <memory>
#include <map>
#include <atomic>
#include "Channel.h"

namespace channel {

using Server = websocketpp::server<websocketpp::config::asio>;
using connection_hdl = websocketpp::connection_hdl;

class WebSocketChannel: public Channel {
    
public:
    void Open() override;
    void Close() override;
    void AsyncRun() override;
    void Send(uint16_t id, const std::string&) override;
    void Send(uint16_t id, const uint8_t*, std::size_t) override;
    virtual ~WebSocketChannel();
    
private:
    struct SessionData {
        int connectionId;
        connection_hdl handler;
    };
    Server server_;
    std::atomic<uint16_t> nextId_{1};
    std::map<uint16_t, SessionData> connectionsById_; // 以 ID 为键
    std::map<connection_hdl, uint16_t, std::owner_less<connection_hdl>> idByHandler_;  // 以句柄为键
};

}

#endif /* !WEBSOCKETCHANNEL_H */
