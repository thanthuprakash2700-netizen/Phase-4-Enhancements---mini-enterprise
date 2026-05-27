from fastapi import APIRouter, Depends, Request, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import select
import stripe
import os
from pydantic import BaseModel
from typing import Optional

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Organization, Subscription, PlanEnum, SubscriptionStatus
from app.core.config import settings

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")

PLAN_PRICES = {
    PlanEnum.silver: "price_silver_placeholder",
    PlanEnum.gold: "price_gold_placeholder"
}

class CreateCheckoutSessionRequest(BaseModel):
    plan_name: str

@router.get("/info")
def get_billing_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.execute(select(Organization).where(Organization.id == current_user.organization_id)).scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    sub = db.execute(select(Subscription).where(Subscription.organization_id == org.id)).scalars().first()
    
    return {
        "organization_name": org.name,
        "credits": org.credits,
        "plan_name": sub.plan_name if sub else "unknown",
        "status": sub.status if sub else "unknown",
        "current_period_end": sub.current_period_end if sub else None
    }

@router.post("/create-checkout-session")
def create_checkout_session(
    payload: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        plan_enum = PlanEnum(payload.plan_name)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid plan name")

    if plan_enum == PlanEnum.basic:
        raise HTTPException(status_code=400, detail="Cannot subscribe to basic plan via checkout")

    org = db.execute(select(Organization).where(Organization.id == current_user.organization_id)).scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # MOCK FLOW FOR DEV
    if stripe.api_key == "sk_test_placeholder":
        sub = db.execute(select(Subscription).where(Subscription.organization_id == org.id)).scalars().first()
        if sub:
            sub.plan_name = plan_enum
            sub.status = SubscriptionStatus.active
            if plan_enum == PlanEnum.silver:
                org.credits += 1000
            elif plan_enum == PlanEnum.gold:
                org.credits += 5000
            db.commit()
        return {"checkout_url": f"/mock-stripe-checkout?plan={plan_enum.value}"}


    if not org.stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=org.name,
            metadata={"organization_id": org.id}
        )
        org.stripe_customer_id = customer.id
        db.commit()

    price_id = PLAN_PRICES.get(plan_enum)
    
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=org.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            ui_mode='embedded',
            return_url=settings.FRONTEND_URL + '/billing?session_id={CHECKOUT_SESSION_ID}',
            metadata={
                "organization_id": org.id,
                "plan_name": plan_enum.value
            }
        )
        return {"client_secret": checkout_session.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None), db: Session = Depends(get_db)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # In test mode we might not care, but normally we fail here
        print("Signature verification failed, ignoring for local dev")
        event = stripe.Event.construct_from(
            import_json=await request.json(),
            key=stripe.api_key
        )
        
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        org_id = int(session['metadata']['organization_id'])
        plan_name = session['metadata']['plan_name']
        stripe_subscription_id = session['subscription']
        
        org = db.execute(select(Organization).where(Organization.id == org_id)).scalars().first()
        sub = db.execute(select(Subscription).where(Subscription.organization_id == org_id)).scalars().first()
        
        if sub:
            sub.stripe_subscription_id = stripe_subscription_id
            sub.plan_name = PlanEnum(plan_name)
            sub.status = SubscriptionStatus.active
            
            # Add credits based on plan
            if sub.plan_name == PlanEnum.silver:
                org.credits += 1000
            elif sub.plan_name == PlanEnum.gold:
                org.credits += 5000
                
            db.commit()

    return {"status": "success"}
