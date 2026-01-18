# README Update Summary

## Changes Made

Updated README.md to recommend uv as the primary installation method for pdf2zh.

### Key Changes:

1. **Prerequisites Section**
   - Added "Method 1: Using uv (Recommended)" with star emoji
   - Included separate instructions for Windows and macOS/Linux
   - Highlighted uv advantages: speed, automatic Python management, isolation
   - Moved pip to "Method 2: Using pip (Alternative)"
   - Added link to detailed UV Setup Guide

2. **Troubleshooting Section**
   - Updated "pdf2zh not found" with uv-specific solutions
   - Added separate instructions for uv and pip installations
   - Added new section: "Python version incompatibility"
   - Recommended uv as solution for Python 3.13+ users

### User Benefits:

- **Simpler setup**: No need to manually install Python 3.10-3.12
- **Faster**: 10-100x faster than pip
- **Safer**: Isolated environments prevent conflicts
- **Future-proof**: Works even if system has Python 3.13+

### Files Modified:

- `/README.md` - Updated installation and troubleshooting sections
- `/docs/UV_SETUP_GUIDE.md` - Created detailed setup guide (new file)

### Next Steps:

Consider updating:
- `/README.zh-CN.md` - Chinese version (if exists)
- Package.json description to mention uv support
- Extension marketplace listing
