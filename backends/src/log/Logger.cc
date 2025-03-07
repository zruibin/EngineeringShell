/*
 *
 * Logger.h
 *
 * Created by Ruibin.Chow on 2025/02/14.
 * Copyright (c) 2025年 Ruibin.Chow All rights reserved.
 */

#include "log/Logger.h"
#include <iostream>
#include "LogSinker.h"
#include "util/Util.h"

namespace logger {

static LoggingSeverity minWriteLevel = LoggingSeverity::INFO;

void SetMinWriteLogLevel(LoggingSeverity level) {
    minWriteLevel = level;
}

static const char* loggingSeverityCover(LoggingSeverity severity) {
#if defined(_WIN32) || defined(_WIN64)
    switch (severity) {
        case LoggingSeverity::VERBOSE:
            return "[V]";
        case LoggingSeverity::DEBUG:
            return "[D]";
        case LoggingSeverity::INFO:
            return "[I]";
        case LoggingSeverity::WARNING:
            return "[W]";
        case LoggingSeverity::ERROR:
            return "[E]";
        default:
            return "[N]";
    }
#else
    static const char* severityList[] = {
        [static_cast<uint8_t>(LoggingSeverity::NONE)] = "[N]",
        [static_cast<uint8_t>(LoggingSeverity::VERBOSE)] = "[V]",
        [static_cast<uint8_t>(LoggingSeverity::DEBUG)] = "[D]",
        [static_cast<uint8_t>(LoggingSeverity::INFO)] = "[I]",
        [static_cast<uint8_t>(LoggingSeverity::WARNING)] = "[W]",
        [static_cast<uint8_t>(LoggingSeverity::ERROR)] = "[E]",
    };
    
    return severityList[static_cast<uint8_t>(severity)];
#endif
}

LogMessage::LogMessage(const char* file, int line, LoggingSeverity severity, bool origin)
        : stringBuffer_(new std::string), origin_(origin) {
    severity_ = severity;
    std::string fileStr(file);
            stringBuffer_->append(util::GetCurrentTimeString());
    stringBuffer_->append(" [B][");
            stringBuffer_->append(std::to_string(util::GetCurrentThreadId()));
    stringBuffer_->append("]");
    if (!origin_) {
        stringBuffer_->append("[");
        stringBuffer_->append(fileStr.substr(fileStr.find_last_of("/")+1));
        stringBuffer_->append(":");
        stringBuffer_->append(std::to_string(line));
        stringBuffer_->append("]");
        stringBuffer_->append(loggingSeverityCover(severity));
        stringBuffer_->append(" ");
    }
}

LogMessage::LogMessage(const char* file, int line, LoggingSeverity severity)
        : LogMessage(file, line, severity, false) {}

LogMessage::~LogMessage() {
    if (!origin_) {
        stringBuffer_->append("\n");
    }
    std::cout << stringBuffer_->c_str();
    LogSinker::GetInstance().Write(stringBuffer_->c_str());
    delete stringBuffer_;
}


}
