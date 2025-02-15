
message("Util Module.")

set(util_name util)

file(GLOB_RECURSE util_all_file "${src_dir}/util/*")
message(STATUS "util_all_file: ${util_all_file}")

sourceGroup("${sourceGroupPrefixName}" ${util_all_file})

