from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

client = InferenceClient(
    provider="novita",
    api_key=os.getenv("HF_TOKEN"),
)

def explain_deadlock(deadlock_info: dict) -> str:
    """
    Real LLM API call - HuggingFace Inference
    """
    prompt = f"""You are a database expert analyzing a distributed deadlock.

DEADLOCK INFORMATION:
- Transaction 1: {deadlock_info['tx1_name']} is HOLDING {deadlock_info['tx1_holding']} and WAITING FOR {deadlock_info['tx1_waiting']}
- Transaction 2: {deadlock_info['tx2_name']} is HOLDING {deadlock_info['tx2_holding']} and WAITING FOR {deadlock_info['tx2_waiting']}

Please provide analysis in EXACTLY this format:

SITUATION: (what happened in simple terms)

ROOT CAUSE: (why this deadlock occurred)

VICTIM SELECTION: (which transaction should be killed and why)

RESOLUTION: (steps to resolve this deadlock)

PREVENTION: (how to prevent this in future)

Keep response concise and professional."""

    try:
        message = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct",
            messages=[
                {"role": "system", "content": "You are a senior database administrator. Respond only in the requested format."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3,
        )
        return message.choices[0].message.content
    except Exception as e:
        print(f"⚠️ LLM API Error: {e}")
        # Fallback to mock response
        return f"""SITUATION: Circular wait between {deadlock_info['tx1_name']} and {deadlock_info['tx2_name']}.

ROOT CAUSE: Locks acquired in opposite order.

VICTIM SELECTION: Kill {deadlock_info['tx2_name']}.

RESOLUTION: Release locks, allow {deadlock_info['tx1_name']} to proceed.

PREVENTION: Use consistent lock ordering."""

def get_prevention_tip(resource1: str, resource2: str) -> str:
    """
    Short prevention tip from LLM
    """
    prompt = f"In one sentence, how to prevent deadlock between {resource1} and {resource2} in a distributed database?"

    try:
        message = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.2,
        )
        return message.choices[0].message.content
    except Exception as e:
        print(f"⚠️ Prevention tip API Error: {e}")
        return f"Always acquire locks on {resource1} before {resource2} to prevent circular waits."