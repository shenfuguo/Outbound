from flask import jsonify

def success_200(message=None, data=None, status_code=200):
    """成功响应"""
    response = {
        'status': 'success',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_400(message, status_code=400, data=None):
    """客户端错误响应"""
    response = {
        'status': 'error',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_500(message, status_code=500, data=None):
    """服务器错误响应"""
    response = {
        'status': 'error',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_404(message, status_code=404, data=None):
    """未找到响应"""
    response = {
        'status': 'error',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_403(message, status_code=403, data=None):
    """无权访问"""
    response = {
        'status': 'error',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code