from ..models.user import User
from ..repositories.user_repo import UserRepository

class UserService:
    @staticmethod
    def get_all_users():
        return UserRepository.get_all()

    @staticmethod
    def get_user_by_id(user_id):
        return UserRepository.get_by_id(user_id)

    @staticmethod
    def create_user(user_data):
        # 业务逻辑验证
        if not user_data.get('username'):
            raise ValueError('Username is required')
        
        user = User(**user_data)
        return UserRepository.save(user)