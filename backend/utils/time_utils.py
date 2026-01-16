# utils/time_utils.py
from datetime import datetime, timedelta

def beijing_time():
    """获取北京时间 - 用于db.Column default"""
    utc_now = datetime.utcnow()
    beijing_now = utc_now + timedelta(hours=8)
    return beijing_now

def get_beijing_time():
    """获取北京时间的别名（与beijing_time相同）"""
    return beijing_time()

def utc_to_beijing(utc_dt):
    """UTC时间转换为北京时间"""
    if utc_dt.tzinfo is None:
        # 如果没有时区信息，假设是UTC
        from datetime import timezone
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    
    beijing_offset = timedelta(hours=8)
    beijing_dt = utc_dt + beijing_offset
    return beijing_dt.replace(tzinfo=None)

def beijing_to_utc(beijing_dt):
    """北京时间转换为UTC时间"""
    beijing_offset = timedelta(hours=8)
    if beijing_dt.tzinfo is None:
        # 添加时区信息
        from datetime import timezone
        beijing_dt = beijing_dt.replace(tzinfo=timezone(beijing_offset))
    
    utc_dt = beijing_dt - beijing_offset
    return utc_dt.replace(tzinfo=None)

def format_datetime(dt, format_str="%Y-%m-%d %H:%M:%S"):
    """格式化时间"""
    if hasattr(dt, 'strftime'):
        return dt.strftime(format_str)
    return str(dt)

def get_current_time_string():
    """获取当前时间字符串（用于日志等）"""
    return format_datetime(get_beijing_time())

# 测试函数
# if __name__ == "__main__":
#     print("🧪 测试时间工具")
#     print("="*50)
    
#     utc_now = datetime.utcnow()
#     beijing_now = get_beijing_time()
    
#     print(f"UTC时间:     {utc_now}")
#     print(f"北京时间:     {beijing_now}")
#     print(f"时间差:       {beijing_now - utc_now}")
#     print(f"格式化:      {format_datetime(beijing_now)}")
#     print("="*50)