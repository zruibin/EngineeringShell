cmake_minimum_required (VERSION 3.0)

# projectname is the same as the main-executable
project(Backends)
set(TARGET ${PROJECT_NAME})


option(CMAKE_BUILD_TYPE "Build Type." Release)
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()
message(WARNING "Build Type: ${CMAKE_BUILD_TYPE}")


# 生成compile_commands.json,用于在VSCode等编辑器/IDE中给C/C++代码做函数定义跳转支持
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)


# 设置c++的编译选项
include(CheckCXXCompilerFlag)
if(MSVC)
    CHECK_CXX_COMPILER_FLAG("/std:c++17" COMPILER_SUPPORTS_CXX17)
    if(COMPILER_SUPPORTS_CXX17)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /std:c++17")
    else()
        message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++17 support. Please use a different C++ compiler.")
    endif()
else()
    CHECK_CXX_COMPILER_FLAG("-std=c++17" COMPILER_SUPPORTS_CXX17)
    if(COMPILER_SUPPORTS_CXX17)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17")
    else()
        message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++17 support. Please use a different C++ compiler.")
    endif()
endif()
message(STATUS "CMAKE_CXX_FLAGS: ${CMAKE_CXX_FLAGS}")
set(CMAKE_CXX_STANDARD 17) # 设置 C++ 标准为 C++17
set(CMAKE_CXX_STANDARD_REQUIRED ON) # 要求必须使用指定的 C++ 标准
set(CMAKE_CXX_EXTENSIONS OFF) # 禁用编译器特定的扩展
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c99") 

if (CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ftime-trace")
    message(STATUS "CMAKE_CXX_FLAGS: ${CMAKE_CXX_FLAGS}")
endif()

if(CMAKE_BUILD_TYPE MATCHES "Debug")
    message(STATUS "Debug Type.")
    add_definitions("-Wall")
    add_definitions("-fPIC")
    add_definitions("-Wl,-lm")
    add_definitions("-Wno-dev")
    if(NOT WIN32)
        add_definitions("-Wextra")
        add_definitions("-Wpedantic")
    endif()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")
endif()

# for [[deprecated("")]] on C++14 or above
if(MSVC)
    # MSVC配置
    add_compile_options(
        /w14996    # 启用C4996废弃警告
        # /wd4996    # 禁用C4996废弃警告
        # /we4996    # 将C4996警告视为错误
    )
else()
    # GCC/Clang配置
    add_compile_options(
        -Wdeprecated-declarations    # 启用废弃警告（默认已开启）
        # -Wno-deprecated-declarations # 禁用废弃警告
        # -Werror=deprecated-declarations # 将警告升级为错误
    )
endif()

#-------------------------------------------------------------------------------

function(deleteFiles)
    foreach(FILE IN LISTS ARGN) 
        if ("${FILE}" MATCHES ".DS_Store")
            message(WARNING "删除文件: ${FILE}")
            file(REMOVE ${FILE})
        endif()
    endforeach()
endfunction()
file(GLOB_RECURSE delete_seerch_all_file "*")
deleteFiles(${delete_seerch_all_file})

# default was /src
set(sourceGroupPrefixName "")

# 按文件层次结构显示
function(sourceGroup prefix)
    #message("prefix: ${prefix}")
    foreach(FILE IN LISTS ARGN) 
        get_filename_component(PARENT_DIR "${FILE}" DIRECTORY)
        string(REPLACE "${CMAKE_CURRENT_SOURCE_DIR}" "" GROUP "${PARENT_DIR}")
        string(REPLACE "${prefix}" "" GROUP "${GROUP}")
        string(REPLACE "/" "\\" GROUP "${GROUP}")

        if ("${FILE}" MATCHES ".*\\.cpp" AND ".*\\.cc" AND ".*\\.c")
            set(GROUP "Source Files${GROUP}")
        elseif("${FILE}" MATCHES ".*\\.h" AND ".*\\.hpp")
            set(GROUP "Header Files${GROUP}")
        endif()

        source_group("${GROUP}" FILES "${FILE}")
    endforeach()
endfunction()

#-------------------------------------------------------------------------------

add_definitions("-DPROJECT_DIR=\"${CMAKE_SOURCE_DIR}\"")
message(STATUS "PROJECT_DIR=\"${CMAKE_SOURCE_DIR}\"")

if(EXISTS "${PROJECT_SOURCE_DIR}/deps/") 
    list(APPEND CMAKE_PREFIX_PATH "${PROJECT_SOURCE_DIR}/deps/")
    message(WARNING "CMAKE_PREFIX_PATH: ${CMAKE_PREFIX_PATH}")
endif() 

#-------------------------------------------------------------------------------

if(WIN32)
    message(STATUS "Now is windows")
    add_definitions(-D_WEBSOCKETPP_CPP11_STL_)
    add_definitions(-D_WEBSOCKETPP_CPP11_STRICT_)

    # 降级警告级别
    # remove_compile_options(/W4 /WX) 
    add_compile_options(/W3)                     # 基本警告级别
    add_compile_options(/wd4068 /wd4996)         # 禁用特定警告编号
    # 禁用警告转错误
    string(REGEX REPLACE "/W[0-4]" "" CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")
elseif(APPLE)
    message(STATUS "Now is Apple systens.")

    # Check whether we are running under Rosetta on arm64 hardware.
    execute_process(COMMAND sysctl -q hw.optional.arm64
        OUTPUT_VARIABLE _sysctl_stdout
        ERROR_VARIABLE _sysctl_stderr
        RESULT_VARIABLE _sysctl_result
    )
    if(_sysctl_result EQUAL 0 AND _sysctl_stdout MATCHES "hw.optional.arm64: 1")
        set(CMAKE_HOST_SYSTEM_PROCESSOR "arm64")
    endif()

    if(CMAKE_HOST_SYSTEM_PROCESSOR MATCHES "x86_64")
        add_definitions("-D__x86_64__=1")
        set(CMAKE_OSX_ARCHITECTURES "x86_64")
    else()
        set(CMAKE_OSX_ARCHITECTURES arm64)
    endif()
    message(STATUS "OSX Architectures: ${CMAKE_OSX_ARCHITECTURES}")
    message(STATUS "Host System Processor: ${CMAKE_HOST_SYSTEM_PROCESSOR}")
    
    list(APPEND DEPS_LIBS "-framework Foundation")
elseif(UNIX)
    message(STATUS "Now is UNIX-like OS's. Including aPPLE os x  and CygWin")
endif()
message(STATUS "Operation System: ${CMAKE_SYSTEM}")

#-------------------------------------------------------------------------------

set(src_dir "${PROJECT_SOURCE_DIR}/src")
set(libs_dir "${PROJECT_SOURCE_DIR}/libs")

include_directories(
    "${src_dir}"
    "${libs_dir}"
)

# 使用 file(GLOB_RECURSE) 命令获取指定目录及其子目录下的所有文件或目录
file(GLOB_RECURSE libs_sub_dirs LIST_DIRECTORIES true "${libs_dir}/*")
foreach(item ${libs_sub_dirs})
    if (IS_DIRECTORY ${item})
        message("libs_sub_dirs: ${item}")
        include_directories(${item})
    endif()
endforeach()


# 相当于g++命令的-L选项的作用
link_directories(
    "/usr/local"
    "${src_dir}"
    "${libs_dir}"
)

# modules
include("${src_dir}/log/CMakeLists.txt")
include("${src_dir}/util/CMakeLists.txt")
include("${src_dir}/channel/CMakeLists.txt")

# libs
include("${libs_dir}/asio/CMakeLists.txt")
include("${libs_dir}/nlohmann_json_reflect/CMakeLists.txt")

set(MODULES
    ${log_all_file}
    ${util_all_file}
    ${channel_all_file}
)

set(DEPENDS_LIBS
    ${asio_all_file}
    ${nlohmann_json_reflect_all_file}
)

list(APPEND ALL_SOURCES ${MODULES} ${DEPENDS_LIBS})

add_definitions(-DASIO_STANDALONE)
add_definitions(-DASIO_HAS_STD_SYSTEM_ERROR)

#-------------------------------------------------------------------------------

set(HEADERS
    
)

set(SOURCES
    
)

set(EXECUTE_SOURCES
    src/main.cc
)

# 添加依赖
if(EXISTS "${PROJECT_SOURCE_DIR}/deps.cmake")
    message(STATUS "Include deps.cmake")
    include("deps.cmake")
endif()

source_group(TREE "${CMAKE_SOURCE_DIR}" FILES ${HEADERS} ${SOURCES} ${EXECUTE_SOURCES})

#-------------------------------------------------------------------------------

# 相当于g++选项中的-I参数的作用
include_directories(

)

#-------------------------------------------------------------------------------

set(RESOURCES
    
)
set(RESOURCES_CHECK_ITEMS
    builddeps.py
    deps.json
    deps.cmake
    depsSource.cmake
    depsSource.lock
    README.md
    LICENSE
)
foreach(item ${RESOURCES_CHECK_ITEMS})
    if(EXISTS "${PROJECT_SOURCE_DIR}/${item}")
        list(APPEND RESOURCES ${item})
        message(${item})
    endif()
endforeach()
source_group(Resources FILES ${RESOURCES})

#-------------------------------------------------------------------------------

set(OUTPUT_DIR "${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE}")
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${OUTPUT_DIR}/Lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${OUTPUT_DIR}/Lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${OUTPUT_DIR}/Bin)
message(STATUS "OUTPUT_DIR: ${OUTPUT_DIR}")
message(STATUS "ARCHIVE_OUTPUT_DIRECTORY: ${CMAKE_ARCHIVE_OUTPUT_DIRECTORY}")
message(STATUS "LIBRARY_OUTPUT_DIRECTORY: ${CMAKE_LIBRARY_OUTPUT_DIRECTORY}")
message(STATUS "RUNTIME_OUTPUT_DIRECTORY: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")

list(APPEND EXECUTE_SOURCES ${ALL_SOURCES} ${HEADERS} ${SOURCES})


if(WIN32)
    add_executable(${TARGET} WIN32 ${EXECUTE_SOURCES} ${RESOURCES})
    target_link_libraries(${TARGET} PRIVATE ${TARGET_LIB} ${DEPS_LIBS})
else()
    add_executable(${TARGET} ${EXECUTE_SOURCES} ${RESOURCES})
    target_link_libraries(${TARGET} PRIVATE ${TARGET_LIB} ${DEPS_LIBS} pthread)
endif()


if(EXISTS "${PROJECT_SOURCE_DIR}/depsSource.cmake")
    include("depsSource.cmake")
    if(Deps_Source_Targets)
        add_dependencies(${TARGET} ${Deps_Source_Targets})
    endif()
endif()

#-------------------------------------------------------------------------------

# 单元测试
option(ENABLE_UNIT_TESTS "Enable Unit Tests." OFF)
if(ENABLE_UNIT_TESTS)
    include("${CMAKE_CURRENT_SOURCE_DIR}/test/CMakeLists.txt")
endif()
#-------------------------------------------------------------------------------


message(STATUS "Origin installed directory: ${CMAKE_INSTALL_PREFIX}")
# if(${CMAKE_INSTALL_PREFIX} MATCHES "/usr/local")
# endif()
set(install_directory "${PROJECT_SOURCE_DIR}/install")
file(MAKE_DIRECTORY ${install_directory})
set(CMAKE_INSTALL_PREFIX ${install_directory})
message(STATUS "Create installed directory: ${CMAKE_INSTALL_PREFIX}")
message(STATUS "Project will be installed to ${CMAKE_INSTALL_PREFIX}")

install(
    TARGETS ${TARGET} ${TARGET_LIB}
    RUNTIME DESTINATION bin 
    LIBRARY DESTINATION lib
    BUNDLE DESTINATION bundle
)

set(output_head_files

)
install(FILES ${output_head_files} DESTINATION include)

install(DIRECTORY src/foundation
        DESTINATION include
        FILES_MATCHING
        PATTERN "*.h"
        PATTERN "*.hpp"
        PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ
                    GROUP_EXECUTE GROUP_READ)


set(output_libs_head_files_directory
    ${DEPS_INCLUDE_DIR}
)
install(
    DIRECTORY ${output_libs_head_files_directory}
    DESTINATION include
    FILES_MATCHING
    PATTERN "*.h"
    PATTERN "*.hpp"
    PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ
    GROUP_EXECUTE GROUP_READ
)

if(NOT WIN32)
    install(
        DIRECTORY ${DEPS_LIB_DIR}
        DESTINATION lib
        PATTERN "cmake" EXCLUDE
        PATTERN "pkgconfig" EXCLUDE
        PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ
        GROUP_EXECUTE GROUP_READ
    )
endif()
#-------------------------------------------------------------------------------

if(CMAKE_GENERATOR MATCHES "Unix Makefiles" OR CMAKE_GENERATOR MATCHES "Ninja")
    set(RUN_NAME "run")
    message(STATUS "CMAKE_GENERATOR: ${CMAKE_GENERATOR}, and generate target(${RUN_NAME})")
    add_custom_target(${RUN_NAME}
        COMMAND ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/${TARGET}
        WORKING_DIRECTORY ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}
        COMMENT "Intermediate Run target: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
    )
endif()


