import hashlib
import hmac
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker


ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
DATA_DIR = Path(os.getenv("DATA_DIR", "/data"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'concreto.db'}")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
PBKDF2_ROUNDS = int(os.getenv("PASSWORD_HASH_ROUNDS", "210000"))

if DATABASE_URL.startswith("sqlite:///"):
    sqlite_path = Path(DATABASE_URL.replace("sqlite:///", "", 1))
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sessions: Mapped[list["AuthSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped[User] = relationship(back_populates="sessions")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    source_type: Mapped[str] = mapped_column(String(24), default="github")
    repository_url: Mapped[str] = mapped_column(Text, default="")
    zip_filename: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user: Mapped[User] = relationship(back_populates="applications")
    deployments: Mapped[list["Deployment"]] = relationship(back_populates="application", cascade="all, delete-orphan")


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    logs: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    application: Mapped[Application] = relationship(back_populates="deployments")


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=256)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class ApplicationSource(BaseModel):
    type: str = "github"
    url: Optional[str] = ""
    filename: Optional[str] = ""


class ApplicationCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    source: ApplicationSource


class DeploymentCreateRequest(BaseModel):
    application_id: int


class DeploymentStatusRequest(BaseModel):
    status: str = Field(min_length=1, max_length=32)
    logs: Optional[list[str]] = None


app = FastAPI(title="Concreto API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, rounds, salt, expected = stored_hash.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(rounds)).hex()
    return hmac.compare_digest(digest, expected)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def serialize_user(user: User) -> dict:
    return {"id": str(user.id), "name": user.name, "email": user.email}


def serialize_app(application: Application) -> dict:
    return {
        "id": str(application.id),
        "name": application.name,
        "source_type": application.source_type,
        "repository_url": application.repository_url,
        "zip_filename": application.zip_filename,
        "created_at": application.created_at.isoformat(),
    }


def serialize_deployment(deployment: Deployment) -> dict:
    logs = [line for line in deployment.logs.splitlines() if line]
    return {
        "id": str(deployment.id),
        "application_id": str(deployment.application_id),
        "status": deployment.status,
        "logs": logs,
        "created_at": deployment.created_at.isoformat(),
    }


def create_auth_response(db: Session, user: User) -> dict:
    token = secrets.token_urlsafe(32)
    db.add(AuthSession(token_hash=hash_token(token), user_id=user.id))
    db.commit()
    return {"token": token, "user": serialize_user(user)}


def get_current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_token(token)))
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return user


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}


@app.post("/api/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    email = normalize_email(payload.email)
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account already exists for this email")
    user = User(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_auth_response(db, user)


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    email = normalize_email(payload.email)
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return create_auth_response(db, user)


@app.get("/api/me")
def me(user: User = Depends(get_current_user)) -> dict:
    return serialize_user(user)


@app.post("/api/auth/logout")
def api_logout(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> dict:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() == "bearer" and token:
        session = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_token(token)))
        if session:
            db.delete(session)
            db.commit()
    return {"ok": True}


@app.get("/api/applications")
def list_applications(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(Application).where(Application.user_id == user.id).order_by(Application.created_at.desc())).all()
    return [serialize_app(row) for row in rows]


@app.post("/api/applications")
def create_application(
    payload: ApplicationCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    source_type = "zip" if payload.source.type == "zip" else "github"
    application = Application(
        user_id=user.id,
        name=payload.name.strip(),
        source_type=source_type,
        repository_url=(payload.source.url or "").strip() if source_type == "github" else "",
        zip_filename=(payload.source.filename or "").strip() if source_type == "zip" else "",
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return serialize_app(application)


@app.get("/api/deployments")
def list_deployments(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(
        select(Deployment)
        .join(Application)
        .where(Application.user_id == user.id)
        .order_by(Deployment.created_at.desc())
    ).all()
    return [serialize_deployment(row) for row in rows]


@app.post("/api/deployments")
def create_deployment(
    payload: DeploymentCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    application = db.get(Application, payload.application_id)
    if not application or application.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    deployment = Deployment(application_id=application.id, status="pending", logs="")
    db.add(deployment)
    db.commit()
    db.refresh(deployment)
    return serialize_deployment(deployment)


@app.patch("/api/deployments/{deployment_id}")
def update_deployment(
    deployment_id: int,
    payload: DeploymentStatusRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    deployment = db.get(Deployment, deployment_id)
    if not deployment or deployment.application.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    deployment.status = payload.status
    if payload.logs is not None:
        deployment.logs = "\n".join(payload.logs)
    db.commit()
    db.refresh(deployment)
    return serialize_deployment(deployment)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "index.html")


@app.get("/{page_name}")
def html_page(page_name: str) -> FileResponse:
    candidate = PUBLIC_DIR / page_name
    if candidate.suffix != ".html":
        candidate = PUBLIC_DIR / f"{page_name}.html"
    if not candidate.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return FileResponse(candidate)


app.mount("/", StaticFiles(directory=PUBLIC_DIR), name="static")
