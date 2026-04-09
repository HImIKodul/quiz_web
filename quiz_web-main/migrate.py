import os
from app import app, db, User, backup_database, generate_password_hash

def run_migrations():
    with app.app_context():
        print("[MIGRATE] Starting database initialization...")
        
        # 1. Backup
        try:
            print("[MIGRATE] [1/4] Backing up database...")
            backup_database()
        except Exception as e:
            print(f"[MIGRATE] Backup failed: {e}")

        # 2. Column migrations
        print("[MIGRATE] [2/4] Running safe migrations...")
        for ddl in [
            "ALTER TABLE user ADD COLUMN max_devices INTEGER DEFAULT 3;",
            "ALTER TABLE user ADD COLUMN plan VARCHAR(50) DEFAULT 'none';",
            "ALTER TABLE user ADD COLUMN plan_expire_date DATETIME;",
            "ALTER TABLE user ADD COLUMN active_session_token VARCHAR(256);",
            "ALTER TABLE question ADD COLUMN image_filename TEXT;",
            "ALTER TABLE question ADD COLUMN topic VARCHAR(100);",
            "ALTER TABLE question ADD COLUMN created_by VARCHAR(100);",
            "ALTER TABLE question ADD COLUMN option_e VARCHAR(200);",
            "ALTER TABLE question ADD COLUMN option_f VARCHAR(200);",
        ]:
            try:
                db.session.execute(db.text(ddl))
                db.session.commit()
            except Exception:
                db.session.rollback()

        # 3. Create tables
        try:
            print("[MIGRATE] [3/4] Creating tables...")
            db.create_all()
        except Exception as e:
            print(f"[MIGRATE] Table creation failed: {e}")

        # 4. Seed admins
        try:
            print("[MIGRATE] [4/4] Seeding admin accounts...")
            admin_pw = os.getenv('ADMIN_PASSWORD', 'admin123')
            if not User.query.filter_by(identifier='admin_content').first():
                admin1 = User(identifier='admin_content', name='Question Master', 
                             password_hash=generate_password_hash(admin_pw), role='content_admin')
                db.session.add(admin1)

            if not User.query.filter_by(identifier='admin_billing').first():
                admin2 = User(identifier='admin_billing', name='Finance Boss', 
                             password_hash=generate_password_hash(admin_pw), role='billing_admin')
                db.session.add(admin2)

            db.session.commit()
        except Exception as e:
            print(f"[MIGRATE] Seeding failed: {e}")
            db.session.rollback()
        
        print("[MIGRATE] Database initialization complete.")

if __name__ == "__main__":
    run_migrations()
