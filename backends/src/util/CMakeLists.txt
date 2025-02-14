
message("Util Module.")

set(util_name util)

file(GLOB_RECURSE util_all_file "${src_dir}/util/*")

set(remove_files
    ${src_dir}/util/timer.h
    ${src_dir}/util/timer.cc
    ${src_dir}/util/threadsafe_queue.hpp
)
list(REMOVE_ITEM util_all_file ${remove_files})

message(STATUS "util_all_file: ${util_all_file}")

sourceGroup("${sourceGroupPrefixName}" ${util_all_file})

