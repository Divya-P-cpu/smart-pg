# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
from app.db.database import get_db
from app.models import User, Owner
from app.schemas.auth import UserCreate, UserLogin, Token, UserOut, OwnerCreate, OwnerOut
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    from app.core.config import settings
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_owner(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    from app.core.config import settings
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate owner credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        owner_id: str = payload.get("sub")
        role: str = payload.get("role")
        if owner_id is None or role != "owner":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    owner = db.query(Owner).filter(Owner.owner_id == owner_id).first()
    if owner is None:
        raise credentials_exception
    return owner

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    email = str(user.email).strip().lower()
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        user_id=f"USR{int(db.query(func.count(User.user_id)).scalar()) + 1:03d}",
        full_name=user.full_name,
        email=email,
        phone=user.phone,
        password_hash=get_password_hash(user.password),
        is_sample_user=False
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="This email or phone number is already registered.")
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user is None and db.query(Owner).filter(func.lower(Owner.email) == email).first():
        raise HTTPException(status_code=401, detail="This email belongs to a PG owner account. Select PG Owner login.")
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.user_id, "role": "user"})
    return Token(access_token=access_token)

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/owner/register", response_model=OwnerOut)
def register_owner(owner: OwnerCreate, db: Session = Depends(get_db)):
    email = str(owner.email).strip().lower()
    existing = db.query(Owner).filter(func.lower(Owner.email) == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    count = db.query(func.count(Owner.owner_id)).scalar()
    new_owner = Owner(
        owner_id=f"OWN{int(count) + 1:03d}",
        owner_name=owner.owner_name,
        email=email,
        phone=owner.phone,
        password_hash=get_password_hash(owner.password),
        verification_status="Verified",
        data_status="Active",
        notes=owner.notes
    )
    db.add(new_owner)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="This owner email is already registered.")
    db.refresh(new_owner)
    return new_owner

@router.post("/owner/login", response_model=Token)
def login_owner(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username.strip().lower()
    owner = db.query(Owner).filter(func.lower(Owner.email) == email).first()
    if owner is None and db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(status_code=401, detail="This email belongs to a user account. Select User / Guest login.")
    if not owner or not verify_password(form_data.password, owner.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": owner.owner_id, "role": "owner"})
    return Token(access_token=access_token)

@router.get("/owner/me", response_model=OwnerOut)
def read_owners_me(current_owner: Owner = Depends(get_current_owner)):
    return current_owner
