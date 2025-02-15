/*
 *
 * WebSocketChannel.cc
 *
 * Created by Ruibin.Chow on 2025/02/15.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#include "WebSocketChannel.h"
#include <thread>
#include "log/Logger.h"

namespace channel {

typedef Server::message_ptr message_ptr;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::bind;
using websocketpp::connection_hdl;

WebSocketChannel::~WebSocketChannel() {
    Log(DEBUG) << "Dealloc.";
    this->Close();
}

void WebSocketChannel::Open() {
    try {
        server_.clear_access_channels(websocketpp::log::alevel::all);
        server_.clear_error_channels(websocketpp::log::alevel::all);

        server_.set_open_handler([this](connection_hdl hander){
            Log(DEBUG) << "Open.";
            this->connectionHander_ = hander;
            if (this->openedHander_) {
                this->openedHander_(true);
            }
        });
        server_.set_close_handler([this](connection_hdl){
            Log(DEBUG) << "Close";
            this->Close();
        });
        server_.set_message_handler([this](websocketpp::connection_hdl hdl, message_ptr msg) {
            if (this->receivedHandler_) {
                const std::string &payload = msg->get_payload();
                this->receivedHandler_(payload.data(), payload.size(), FrameType::kText);
            }
        });
    } catch (websocketpp::exception const & e) {
        Log(ERROR) << e.what();
    } catch (...) {
        Log(ERROR) << "other exception";
    }
}

void WebSocketChannel::Close() {
    if (server_.is_listening()) {
        server_.stop_listening();
    }
    if (this->closedHander_) {
        this->closedHander_(true);
    }
}

void WebSocketChannel::AyncRun() {
    std::thread([this](){
        try {
            server_.init_asio();
            server_.listen(9002);
            server_.start_accept();
            server_.run();
        } catch (websocketpp::exception const & e) {
            Log(ERROR) << e.what();
        } catch (...) {
            Log(ERROR) << "other exception";
        }
    }).detach();
}

void WebSocketChannel::Send(const std::string& data) {
    this->server_.send(this->connectionHander_,
                       data,
                       websocketpp::frame::opcode::value::text);
}

void WebSocketChannel::Send(const uint8_t* data, std::size_t size) {
    this->server_.send(this->connectionHander_,
                       data,
                       size,
                       websocketpp::frame::opcode::value::text);
}

}


