import random
from datetime import datetime, timedelta
import uuid
from flask import Flask, render_template, request, redirect, url_for, flash, session, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user

app = Flask(__name__)
app.config['SECRET_KEY'] = 'new_super_secret_key_to_clear_sessions'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=12)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@app.before_request
def check_sessions_and_plans():
    if current_user.is_authenticated:
        # 1. 12 hour session handled by PERMANENT_SESSION_LIFETIME + session.permanent
        # 2. Prevent multiple simultaneous logins:
        if 'session_token' in session:
            if session['session_token'] != current_user.active_session_token:
                logout_user()
                session.clear()
                flash("You have been logged out because you logged in from another device.")
                return redirect(url_for('login'))
        
        # 3. Check Subscription Auto-Expire
        if current_user.plan != 'none' and current_user.plan_expire_date:
            if datetime.utcnow() >= current_user.plan_expire_date:
                current_user.plan = 'none'
                db.session.commit()
                flash("Your subscription has expired. Please contact the Billing Admin.")

# ==========================================
# 1. UPDATED DATABASE SCHEMA
# ==========================================
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(100), unique=True, nullable=False) 
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    # ROLES: 'user', 'content_admin', 'billing_admin'
    role = db.Column(db.String(20), default='user') 
    plan = db.Column(db.String(50), default='none')
    plan_expire_date = db.Column(db.DateTime, nullable=True)
    max_devices = db.Column(db.Integer, default=3, nullable=True)
    active_session_token = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score_percent = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class UserDevice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    device_token = db.Column(db.String(256), nullable=False)
    device_name = db.Column(db.String(256), nullable=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

class PaymentRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requested_plan = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('payment_requests', lazy=True))

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # NEW: Question Type
    q_type = db.Column(db.String(20), nullable=False, default='mcq') 
    question_text = db.Column(db.Text, nullable=False)
    # These are now nullable (optional) because Numeric/TF might not need all 4
    option_a = db.Column(db.String(200), nullable=True)
    option_b = db.Column(db.String(200), nullable=True)
    option_c = db.Column(db.String(200), nullable=True)
    option_d = db.Column(db.String(200), nullable=True)
    correct_answer = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- CREATE TEST ADMINS ---
with app.app_context():
    try:
        db.session.execute(db.text("ALTER TABLE user ADD COLUMN max_devices INTEGER DEFAULT 3;"))
        db.session.commit()
    except Exception:
        db.session.rollback()
        
    db.create_all()
    # 1. The Content Admin (Questions)
    if not User.query.filter_by(identifier='admin_content').first():
        pw1 = generate_password_hash('admin123')
        admin1 = User(identifier='admin_content', name='Question Master', password_hash=pw1, role='content_admin')
        db.session.add(admin1)
    
    # 2. The Billing Admin (Subscriptions)
    if not User.query.filter_by(identifier='admin_billing').first():
        pw2 = generate_password_hash('admin123')
        admin2 = User(identifier='admin_billing', name='Finance Boss', password_hash=pw2, role='billing_admin')
        db.session.add(admin2)
        
    db.session.commit()

# ==========================================
# AUTHENTICATION & STANDARD ROUTES (Unchanged)
# ==========================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        phone = request.form.get('phone', '').strip()
        if not phone.isdigit() or len(phone) != 8:
            flash('Утасны дугаар нь 8 оронтой тоо байх ёстой.')
            return redirect(url_for('signup'))
            
        name = request.form.get('name', '').strip()
        password = request.form.get('password', '')
        if len(password) < 6:
            flash('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.')
            return redirect(url_for('signup'))
            
        full_identifier = '+976' + phone
        
        if User.query.filter_by(identifier=full_identifier).first():
            flash('Бүртгэлтэй утасны дугаар байна.')
            return redirect(url_for('login'))
            
        new_user = User(identifier=full_identifier, name=name, password_hash=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()
        
        device_id = str(uuid.uuid4())
        dev_name = f"{request.user_agent.browser} ({request.user_agent.platform})" if request.user_agent else "Unknown Device"
        new_dev = UserDevice(user_id=new_user.id, device_token=device_id, device_name=dev_name)
        
        session.permanent = True
        sess_token = str(uuid.uuid4())
        new_user.active_session_token = sess_token
        session['session_token'] = sess_token
        
        db.session.add(new_dev)
        db.session.commit()
        
        login_user(new_user)
        resp = make_response(redirect(url_for('dashboard')))
        resp.set_cookie('quiz_device_id', device_id, max_age=60*60*24*365)
        return resp
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        identifier = request.form.get('identifier', '').strip()
        if identifier.isdigit() and len(identifier) == 8:
            identifier = '+976' + identifier
            
        user = User.query.filter_by(identifier=identifier).first()
        if user and check_password_hash(user.password_hash, request.form.get('password', '')):
            device_id = request.cookies.get('quiz_device_id')
            if not device_id:
                device_id = str(uuid.uuid4())
                
            known_device = UserDevice.query.filter_by(user_id=user.id, device_token=device_id).first()
            if not known_device:
                limit = user.max_devices if user.max_devices is not None else 3
                if UserDevice.query.filter_by(user_id=user.id).count() >= limit:
                    flash(f'Та {limit}-аас олон төхөөрөмжөөс нэвтрэх боломжгүй. Админтай холбогдоно уу.')
                    return redirect(url_for('login'))
                dev_name = f"{request.user_agent.browser} ({request.user_agent.platform})" if request.user_agent else "Unknown Device"
                new_dev = UserDevice(user_id=user.id, device_token=device_id, device_name=dev_name)
                db.session.add(new_dev)
                
            session.permanent = True
            sess_token = str(uuid.uuid4())
            user.active_session_token = sess_token
            session['session_token'] = sess_token
            db.session.commit()
            
            login_user(user)
            if user.role == 'content_admin':
                resp = make_response(redirect(url_for('admin_content')))
            elif user.role == 'billing_admin':
                resp = make_response(redirect(url_for('admin_billing')))
            else:
                resp = make_response(redirect(url_for('dashboard')))
                
            if not request.cookies.get('quiz_device_id'):
                resp.set_cookie('quiz_device_id', device_id, max_age=60*60*24*365)
            return resp
            
        flash('Бүртгэлтэй хэрэглэгч байхгүй байна эсвэл нууц үг буруу.')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    history = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.timestamp.desc()).all()
    devices = UserDevice.query.filter_by(user_id=current_user.id).order_by(UserDevice.registered_at.desc()).all()
    return render_template('dashboard.html', name=current_user.name, history=history, devices=devices)



# ==========================================
# 2. ROLE-BASED ADMIN ROUTES
# ==========================================

# Route 1: Content Admin Only
@app.route('/admin/content', methods=['GET', 'POST'])
@login_required
def admin_content():
    if current_user.role != 'content_admin':
        return "Access Denied. You are not a Content Admin.", 403
        
    if request.method == 'POST':
        q_type = request.form.get('q_type')
        question_text = request.form.get('question_text')
        
        # Handle data differently based on what type of question the admin selected
        new_q = None
        if q_type == 'mcq':
            new_q = Question(q_type=q_type, question_text=question_text, 
                             option_a=request.form.get('mcq_a'), option_b=request.form.get('mcq_b'),
                             option_c=request.form.get('mcq_c'), option_d=request.form.get('mcq_d'),
                             correct_answer=request.form.get('mcq_correct'))
        elif q_type == 'tf':
            new_q = Question(q_type=q_type, question_text=question_text, correct_answer=request.form.get('tf_correct'))
        elif q_type == 'numeric':
            new_q = Question(q_type=q_type, question_text=question_text, correct_answer=request.form.get('num_correct'))
        elif q_type == 'matching':
            # For matching, we save the pairs into the options for now
            new_q = Question(q_type=q_type, question_text=question_text,
                             option_a=request.form.get('match_1'), option_b=request.form.get('match_2'),
                             option_c=request.form.get('match_3'), option_d=request.form.get('match_4'),
                             correct_answer="matching_logic") # Placeholder for complex grading logic
        elif q_type == 'multi_select':
            correct_opts = request.form.getlist('ms_correct')
            new_q = Question(q_type=q_type, question_text=question_text,
                             option_a=request.form.get('ms_a'), option_b=request.form.get('ms_b'),
                             option_c=request.form.get('ms_c'), option_d=request.form.get('ms_d'),
                             correct_answer=",".join(correct_opts))
        else:
            flash('Invalid question type selected.')
        
        if new_q:
            db.session.add(new_q)
            db.session.commit()
            flash('Question saved successfully!')
        
    search_date = request.args.get('search_date')
    search_type = request.args.get('search_type')
    query = Question.query.order_by(Question.created_at.desc())
    
    if search_type and search_type != 'all':
        query = query.filter_by(q_type=search_type)
        
    if search_date:
        try:
            from datetime import timedelta
            dt_start = datetime.strptime(search_date, '%Y-%m-%d')
            dt_end = dt_start + timedelta(days=1)
            query = query.filter(Question.created_at >= dt_start, Question.created_at < dt_end)
        except ValueError:
            pass
            
    questions = query.all()
    total = Question.query.count()
    return render_template('admin.html', total=total, questions=questions, search_date=search_date, search_type=search_type)

@app.route('/admin/content/delete/<int:q_id>', methods=['POST'])
@login_required
def admin_content_delete(q_id):
    if current_user.role != 'content_admin':
        return "Access Denied.", 403
    q = Question.query.get_or_404(q_id)
    db.session.delete(q)
    db.session.commit()
    flash('Question deleted successfully!')
    return redirect(url_for('admin_content'))

@app.route('/admin/content/edit/<int:q_id>', methods=['GET', 'POST'])
@login_required
def admin_content_edit(q_id):
    if current_user.role != 'content_admin':
        return "Access Denied.", 403
        
    q = Question.query.get_or_404(q_id)
    
    if request.method == 'POST':
        q.question_text = request.form.get('question_text', q.question_text)
        
        if q.q_type == 'mcq':
            q.option_a = request.form.get('mcq_a')
            q.option_b = request.form.get('mcq_b')
            q.option_c = request.form.get('mcq_c')
            q.option_d = request.form.get('mcq_d')
            q.correct_answer = request.form.get('mcq_correct')
        elif q.q_type == 'tf':
            q.correct_answer = request.form.get('tf_correct')
        elif q.q_type == 'numeric':
            q.correct_answer = request.form.get('num_correct')
        elif q.q_type == 'matching':
            q.option_a = request.form.get('match_1')
            q.option_b = request.form.get('match_2')
            q.option_c = request.form.get('match_3')
            q.option_d = request.form.get('match_4')
        elif q.q_type == 'multi_select':
            correct_opts = request.form.getlist('ms_correct')
            q.correct_answer = ",".join(correct_opts)
            q.option_a = request.form.get('ms_a')
            q.option_b = request.form.get('ms_b')
            q.option_c = request.form.get('ms_c')
            q.option_d = request.form.get('ms_d')
            
        db.session.commit()
        flash('Question updated successfully!')
        return redirect(url_for('admin_content'))
        
    return render_template('admin_edit_question.html', q=q)

# Route 2: Billing Admin Only
@app.route('/admin/billing', methods=['GET', 'POST'])
@login_required
def admin_billing():
    if current_user.role != 'billing_admin':
        return "Access Denied. You are not a Billing Admin.", 403
    
    search_str = request.args.get('search', '').strip()
    query = User.query.order_by(User.created_at.desc())
    if search_str:
        query = query.filter(User.identifier.contains(search_str))
        
    users = query.all()
    pending_reqs = PaymentRequest.query.filter_by(status='pending').order_by(PaymentRequest.created_at.asc()).all()
    return render_template('billing_admin.html', users=users, pending_reqs=pending_reqs)

@app.route('/admin/billing/approve/<int:req_id>', methods=['POST'])
@login_required
def admin_billing_approve(req_id):
    if current_user.role != 'billing_admin':
        return "Access Denied.", 403
    req = PaymentRequest.query.get_or_404(req_id)
    if req.status == 'pending':
        req.status = 'approved'
        u = User.query.get(req.user_id)
        if u:
            u.plan = req.requested_plan
            u.max_devices = 5 if req.requested_plan == 'pro' else 3
            u.plan_expire_date = datetime.utcnow() + timedelta(days=30)
        db.session.commit()
        flash(f'Амжилттай зөвшөөрсөн: {u.identifier if u else "Unknown"}')
    return redirect(url_for('admin_billing'))

@app.route('/admin/billing/reject/<int:req_id>', methods=['POST'])
@login_required
def admin_billing_reject(req_id):
    if current_user.role != 'billing_admin':
        return "Access Denied.", 403
    req = PaymentRequest.query.get_or_404(req_id)
    if req.status == 'pending':
        req.status = 'rejected'
        db.session.commit()
        flash('Хүсэлтийг цуцаллаа.')
    return redirect(url_for('admin_billing'))

@app.route('/admin/billing/edit_user/<int:user_id>', methods=['GET', 'POST'])
@login_required
def admin_billing_edit_user(user_id):
    if current_user.role != 'billing_admin':
        return "Access Denied.", 403
        
    u = User.query.get_or_404(user_id)
    
    if request.method == 'POST':
        u.name = request.form.get('name', u.name)
        u.role = request.form.get('role', u.role)
        u.plan = request.form.get('plan', u.plan)
        
        try:
            u.max_devices = int(request.form.get('max_devices', u.max_devices or 3))
        except ValueError:
            pass
        
        expire_str = request.form.get('plan_expire_date', '')
        if expire_str:
            try:
                u.plan_expire_date = datetime.strptime(expire_str, '%Y-%m-%d')
            except ValueError:
                pass
        else:
            u.plan_expire_date = None
        
        new_pass = request.form.get('password', '').strip()
        if new_pass:
            u.password_hash = generate_password_hash(new_pass)
            
        db.session.commit()
        flash(f'User {u.identifier} updated successfully!')
        return redirect(url_for('admin_billing'))
        
    return render_template('admin_edit_user.html', u=u)

# ==========================================
# 3. QUIZ INTERACTION & SUBSCRIPTIONS
# ==========================================

@app.route('/subscriptions')
def subscriptions():
    return render_template('subscriptions.html')

@app.route('/payment/<plan>')
@login_required
def payment(plan):
    if plan not in ['plus', 'pro']:
        flash("Буруу багц байна.")
        return redirect(url_for('subscriptions'))
    return render_template('payment.html', plan=plan)

@app.route('/payment/submit/<plan>', methods=['POST'])
@login_required
def payment_submit(plan):
    if plan not in ['plus', 'pro']:
        flash("Буруу багц байна.")
        return redirect(url_for('subscriptions'))
        
    req = PaymentRequest(user_id=current_user.id, requested_plan=plan, status='pending')
    db.session.add(req)
    db.session.commit()
    flash("Таны хүсэлтийг хүлээж авлаа. Админ шалгаж баталгаажуулсны дараа багц идэвхжих болно.")
    return redirect(url_for('dashboard'))

@app.route('/take_quiz')
@login_required
def take_quiz():
    if current_user.plan == 'none':
        flash("You need to upgrade Your plan to access the quizzes!")
        return redirect(url_for('subscriptions'))
        
    count_str = request.args.get('count', '10')
    questions = Question.query.all()
    
    if count_str.lower() != 'all':
        try:
            limit = int(count_str)
        except ValueError:
            limit = 10
        random.shuffle(questions)
        questions = questions[:limit]
        
    return render_template('quiz.html', questions=questions)

@app.route('/submit_quiz', methods=['POST'])
@login_required
def submit_quiz():
    if current_user.plan == 'none':
        flash("You need to upgrade Your plan to submit quizzes!")
        return redirect(url_for('subscriptions'))
        
    q_ids_str = request.form.get('q_ids', '')
    if not q_ids_str:
        flash("No questions were submitted.")
        return redirect(url_for('dashboard'))
        
    q_ids = [int(i.strip()) for i in q_ids_str.split(',') if i.strip().isdigit()]
    
    total = 0
    correct = 0
    results = []
    
    for q_id in q_ids:
        q = Question.query.get(q_id)
        if not q:
            continue
            
        total += 1
        is_correct = False
        user_answer = ""
        
        if q.q_type in ['mcq', 'tf']:
            user_val = request.form.get(f'q_{q.id}', '').strip()
            is_correct = (user_val.lower() == q.correct_answer.lower())
            
            if q.q_type == 'mcq':
                val_map = {'A': q.option_a, 'B': q.option_b, 'C': q.option_c, 'D': q.option_d}
                user_answer = val_map.get(user_val.upper(), user_val)
                correct_display = val_map.get(q.correct_answer.upper(), q.correct_answer)
            else:
                user_answer = "Үнэн" if user_val == "True" else ("Худал" if user_val == "False" else user_val)
                correct_display = "Үнэн" if q.correct_answer == "True" else "Худал"
            
        elif q.q_type == 'numeric':
            user_answer = request.form.get(f'q_{q.id}', '').strip()
            try:
                is_correct = abs(float(user_answer) - float(q.correct_answer)) < 1e-4
            except:
                is_correct = False
            correct_display = q.correct_answer
                
        elif q.q_type == 'matching':
            import json
            match_data_str = request.form.get(f'match_{q.id}_data', '{}')
            try:
                user_matches = json.loads(match_data_str)
            except:
                user_matches = {}

            correct_matches = 0
            possible_matches = 0
            for opt in filter(None, [q.option_a, q.option_b, q.option_c, q.option_d]):
                if '=' in opt:
                    possible_matches += 1
                    prompt, ans = [x.strip() for x in opt.split('=', 1)]
                    user_val = user_matches.get(prompt, '').strip()
                    if user_val.lower() == ans.lower():
                        correct_matches += 1
                        
            is_correct = (possible_matches > 0 and correct_matches == possible_matches)
            user_answer = "Холбох асуултанд хариулсан"
            correct_display = "Бүх холбоос зөв байх"
            
        elif q.q_type == 'multi_select':
            user_answers_list = request.form.getlist(f'q_{q.id}')
            user_ans_sorted = ",".join(sorted([a.strip().lower() for a in user_answers_list]))
            correct_ans_sorted = ",".join(sorted([a.strip().lower() for a in q.correct_answer.split(',') if a.strip()]))
            is_correct = (user_ans_sorted == correct_ans_sorted)
            
            val_map = {'A': q.option_a, 'B': q.option_b, 'C': q.option_c, 'D': q.option_d}
            user_texts = [val_map.get(v.upper(), v) for v in user_answers_list]
            correct_texts = [val_map.get(v.strip().upper(), v.strip()) for v in q.correct_answer.split(',')]
            
            user_answer = ", ".join(filter(None, user_texts))
            correct_display = ", ".join(filter(None, correct_texts))
            
        if is_correct:
            correct += 1
            
        results.append({
            'question': q.question_text,
            'user_answer': user_answer,
            'is_correct': is_correct,
            'correct_answer': correct_display
        })
        
    score_percent = int((correct / total) * 100) if total > 0 else 0
    
    if total > 0:
        new_attempt = QuizAttempt(
            user_id=current_user.id,
            score_percent=score_percent,
            total_questions=total,
            correct_answers=correct
        )
        db.session.add(new_attempt)
        db.session.commit()
    
    return render_template('quiz_result.html', total=total, correct=correct, score_percent=score_percent, results=results)

if __name__ == '__main__':
    app.run(debug=True)