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

static LoggingSeverity minWriteLevel = INFO;

void SetMinWriteLogLevel(LoggingSeverity level) {
    minWriteLevel = level;
}

static const char* loggingSeverityCover(LoggingSeverity severity) {
    static const char* severityList[] = {
        [NONE] = "[N]",
        [VERBOSE] = "[V]",
        [DEBUG] = "[D]",
        [INFO] = "[I]",
        [WARNING] = "[W]",
        [ERROR] = "[E]",
    };
    
    return severityList[severity];
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
