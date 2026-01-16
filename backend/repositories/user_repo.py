from ..models.user import User

class UserRepository:
    # 模拟数据库
    _users = []
    _next_id = 1

    @classmethod
    def get_all(cls):
        return [user.to_dict() for user in cls._users]

    @classmethod
    def get_by_id(cls, user_id):
        user = next((u for u in cls._users if u.id == user_id), None)
        return user.to_dict() if user else None

    @classmethod
    def save(cls, user):
        user.id = cls._next_id
        cls._next_id += 1
        cls._users.append(user)
        return user.to_dict()