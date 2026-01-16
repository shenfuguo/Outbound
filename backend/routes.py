from .controllers.user_controller import UserController
# , product_controller


def init_routes(app):
    # 用户相关路由
    app.add_url_rule('/api/users', 'get_users', UserController.get_users, methods=['GET'])
    app.add_url_rule('/api/users/<int:user_id>', 'get_user', UserController.get_user, methods=['GET'])
    app.add_url_rule('/api/users', 'create_user', UserController.create_user, methods=['POST'])
    
    # 产品相关路由
    # app.add_url_rule('/api/products', 'get_products', product_controller.get_products, methods=['GET'])
    # app.add_url_rule('/api/products/<int:product_id>', 'get_product', product_controller.get_product, methods=['GET'])