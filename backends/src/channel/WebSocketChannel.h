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
#include "Channel.h"

namespace channel {

using Server = websocketpp::server<websocketpp::config::asio>;

class WebSocketChannel: public Channel {
    
public:
    void Open() override;
    void Close() override;
    void AsyncRun() override;
    void Send(const std::string&) override;
    void Send(const uint8_t*, std::size_t) override;
    virtual ~WebSocketChannel();
    
private:
    Server server_;
    websocketpp::connection_hdl connectionHander_;
};

}

#endif /* !WEBSOCKETCHANNEL_H */
