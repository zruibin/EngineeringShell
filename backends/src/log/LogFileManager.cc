/*
 *
 * LogFileManager.cc
 *
 * Created by Ruibin.Chow on 2025/02/14.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#include "LogFileManager.h"
#include <memory>
#include <mutex>
#include <thread>
#include <filesystem>
#include <string_view>
#include "LogSinker.h"

namespace logger {

static std::string __defaultLoggerFile = "";

void SetLoggerFile(const std::string& defaultLoggerFile) {
    if (defaultLoggerFile.size() > 0) {
        __defaultLoggerFile = defaultLoggerFile;
        LogSinker::GetInstance().isReady = true;
    }
}

std::string_view GetLoggerFile() {
    return __defaultLoggerFile;
}

LogFileManager& LogFileManager::GetInstance() {
    static LogFileManager *instance = nullptr;
    static std::once_flag flag;
    std::call_once(flag, []() {
        if (instance == nullptr) {
            instance = new LogFileManager(GetLoggerFile().data());
        }
    });
    return *instance;
}

LogFileManager::LogFileManager(const char* fileName) {
    fileStream_ = new std::ofstream(fileName, std::ios::out|std::ios::app);
}

LogFileManager::~LogFileManager() {
    if (fileStream_ != nullptr) {
        fileStream_->close();
        delete fileStream_;
    }
}

void LogFileManager::Write(const char* string) {
    *fileStream_ << string;
}

void LogFileManager::Flush(void) {
    fileStream_->flush();
}

}

