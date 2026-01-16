from flask import request, jsonify
from ..services.user_service import UserService
from ..utils.response import success_200, error_400, error_500, error_404

class UserController:
    @staticmethod
    def get_users():
        try:
            users = UserService.get_all_users()
            return success_200(users)
        except Exception as e:
            return error_500(str(e), 500)

    @staticmethod
    def get_user(user_id):
        try:
            user = UserService.get_user_by_id(user_id)
            if not user:
                return error_404('User not found', 404)
            return success_200(user)
        except Exception as e:
            return error_500(str(e), 500)

    @staticmethod
    def create_user():
        try:
            data = request.get_json()
            new_user = UserService.create_user(data)
            return success_200(new_user, 201)
        except Exception as e:
            return error_400(str(e), 400)