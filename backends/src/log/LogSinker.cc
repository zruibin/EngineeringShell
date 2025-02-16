/*
 *
 * LogSinker.cc
 *
 * Created by Ruibin.Chow on 2025/02/16.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#include "LogSinker.h"
#include <filesystem>
#include <string_view>
#include "log/LogFileManager.h"

namespace logger {

LogSinker& LogSinker::GetInstance() {
    static LogSinker *instance = nullptr;
    static std::once_flag flag;
    std::call_once(flag, []() {
        if (instance == nullptr) {
            instance = new LogSinker();
        }
    });
    return *instance;
}

LogSinker::LogSinker(): logQueue_(std::make_unique<std::queue<std::string>>()) {
    logThread_ = std::make_unique<std::thread>([this](){
        while (true) {
            std::unique_lock<std::mutex> lock(this->mutex_);
            this->cv_.wait(lock, [this]() {
                if (!this->isReady || this->logQueue_->empty()) {
                    return false;
                } else {
                    while (!this->logQueue_->empty()) {
                        const char* str = this->logQueue_->front().c_str();
                        LogFileManager::GetInstance().Write(str);
                        this->logQueue_->pop();
                    }
                    LogFileManager::GetInstance().Flush();
                    return true;
                }
            });
        }
    });
}

void LogSinker::Write(const char* string) {
    std::unique_lock<std::mutex> lock(this->mutex_);
    this->logQueue_->push(string);
    lock.unlock();
    this->cv_.notify_all();
}

}

