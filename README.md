# Enterprise Collaboration & Workflow Manager

This project is a modern, full-stack Enterprise Collaboration platform offering deep task management, dynamic SLA tracking, multi-tier approvals, delegations, escalations, and audit logging. 

It acts as a central operational dashboard for employees, managers, and admins to orchestrate daily workflows.

---

## 🌟 Application Workflow

1. **Authentication & RBAC**: Users log in securely. The system uses Role-Based Access Control (Admin, Manager, Employee) to enforce permissions.
2. **Task & Document Management**: Users can create, assign, and comment on tasks. They can also upload documents associated with workflows.
3. **Approval Flows**: Employees can request approvals for resources or actions. Managers can approve, reject, put on hold, delegate to peers, or escalate requests.
4. **SLA Tracking**: Administrators define SLA Rules (e.g., High-Priority Tasks must be completed within 2 hours). The system actively tracks these timelines, automatically marking records as "Breached" if limits are exceeded.
5. **Real-time Notifications**: WebSockets notify users immediately when tasks are assigned or approvals are escalated.

---

## 🧠 Core Technologies & Concepts Explained

### 1. Python (The Engine)
Python serves as the robust foundation of the backend.
- **Why Python?**: Python’s readability and extensive ecosystem make rapid enterprise development seamless.
- **Language Concepts in Project**: 
  - We heavily utilize **Type Hinting** (e.g., `def create_user(db: Session, user: UserCreate) -> User:`) for IDE support and data validation.
  - Context Managers and Generators (e.g., `get_db()` via `yield`) carefully manage database session lifecycles.
  - Object-Oriented design encapsulates business logic inside scalable `Services` (e.g., `SLAService`, `ApprovalService`).

### 2. FastAPI (The Web Framework)
FastAPI drives the high-performance HTTP layer.
- **Concept: Routing**: Code is split intuitively into modular routers (`/tasks`, `/approvals`, `/sla-rules`), connected cleanly to a central `main.py` hub.
- **Concept: Pydantic Validation**: Schemas (like `SLARuleCreate`) automatically validate incoming JSON request bodies against strict types before the code even runs, preventing bad data.
- **Concept: Dependency Injection**: We inject dependencies such as `Depends(get_db)` and `Depends(get_current_user)` directly into endpoints, keeping controllers stateless, secure, and lean.

### 3. SQL & MySQL (Data Persistence)
While currently optimized for SQLite/MySQL, the data layer utilizes SQLAlchemy as an Object-Relational Mapper (ORM).
- **Concept: Models over Raw Queries**: Instead of writing raw SQL strings, we declare Python classes (`class SLATracking(Base):`) which map perfectly to SQL tables. 
- **Concept: Complex Queries**: Behind the scenes, we translate Python into highly optimized SQL. For example, fetching nested relations using `.options(joinedload(Approval.history))`.
- **Concept: Migrations (Alembic)**: As the schema evolves, Alembic scripts execute DDL (`CREATE TABLE`, `ALTER TABLE`) to safely transition the database state without losing data.

### 4. TailwindCSS (Frontend Styling)
The React dashboard is visually sculpted using TailwindCSS.
- **Concept: Utility-First**: Instead of managing large custom `.css` files, we write utility classes directly into React JSX (e.g., `className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"`).
- **Workflow**: This enables rapid prototyping, prevents CSS global scope bleeding, and automatically purges unused styles during production builds, minimizing payload size.

---

## 🔌 API Ecosystem Overview

The backend exposes fully documented Swagger UI endpoints at `http://127.0.0.1:8000/docs`:

### Authentication & Users
- `POST /auth/login`: Authenticate and receive JWT.
- `GET /users/me`: Retrieve current user profile.

### Tasks & SLA
- `POST /tasks`: Create a new task.
- `POST /sla-rules`: Define a new enterprise time limit rule.
- `GET /sla-tracking/active`: Monitor currently ticking SLA timers.

### Approvals & Workflows
- `POST /approvals`: Submit a request.
- `POST /approval-escalations`: Escalate a stuck approval to a higher authority.
- `POST /approval-delegations`: Temporarily pass approval rights to a delegate.

---

## 🚀 Setup & Execution

### 1. Backend Initialization
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Run Database Migrations
alembic upgrade head

# Start Server
uvicorn app.main:app --reload
```
API Documentation available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```
Dashboard available at: `http://127.0.0.1:5173`
