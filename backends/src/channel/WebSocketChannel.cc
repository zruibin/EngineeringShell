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

        server_.set_open_handler([this](connection_hdl hdl){
            int id = this->nextId_++;
            SessionData data{id, hdl};
            this->connectionsById_[id] = data;
            this->idByHandler_[hdl] = id;
            Log(DEBUG) << "Open, id: " << id;
            if (this->openedHander_) {
                this->openedHander_(id, true);
            }
        });
        server_.set_close_handler([this](connection_hdl hdl){
            auto it = this->idByHandler_.find(hdl);
            if (it != this->idByHandler_.end()) {
                int id = it->second;
                this->connectionsById_.erase(id);
                this->idByHandler_.erase(hdl);
                Log(DEBUG) << "Close, id: " << id;
                if (this->closedHander_) {
                    this->closedHander_(id, true);
                }
            }
            this->Close();
        });
        server_.set_message_handler([this](connection_hdl hdl, message_ptr msg) {
            auto it = this->idByHandler_.find(hdl);
            if (it != this->idByHandler_.end()) {
                int id = it->second;
                if (this->receivedHandler_) {
                    const std::string &payload = msg->get_payload();
                    this->receivedHandler_(id, payload.data(),
                                           payload.size(),
                                           FrameType::kText);
                }
            }
        });
    } catch (websocketpp::exception const & e) {
        Log(ERROR) << e.what();
    } catch (...) {
        Log(ERROR) << "other exception";
    }
}

void WebSocketChannel::Close() {
    if (this->idByHandler_.empty()) {
        if (server_.is_listening()) {
            server_.stop_listening();
        }
        if (this->destoryHander_) {
            this->destoryHander_(true);
        }
    }
}

void WebSocketChannel::AsyncRun() {
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

void WebSocketChannel::Send(uint16_t id, const std::string& data) {
    auto it = this->connectionsById_.find(id);
    if (it != this->connectionsById_.end()) {
        connection_hdl hdl = it->second.handler;
        this->server_.send(hdl, data,
                           websocketpp::frame::opcode::value::text);
    }
}

void WebSocketChannel::Send(uint16_t id, const uint8_t* data, std::size_t size) {
    auto it = this->connectionsById_.find(id);
    if (it != this->connectionsById_.end()) {
        connection_hdl hdl = it->second.handler;
        this->server_.send(hdl, data, size,
                           websocketpp::frame::opcode::value::text);
    }
}

}


