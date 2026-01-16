class User:
    def __init__(self, username, email, password=None):
        self.id = None
        self.username = username
        self.email = email
        self.password = password

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
            # 不返回密码
        }