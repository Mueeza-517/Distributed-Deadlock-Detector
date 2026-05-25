from huggingface_hub import InferenceClient
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

client = InferenceClient(
    provider="novita",
    api_key=os.getenv("HF_TOKEN"),
)

def explain_deadlock(deadlock_info: dict) -> str:
    prompt = f"""You are an expert database administrator analyzing a distributed system deadlock.

DEADLOCK DETAILS:
- Transaction 1: "{deadlock_info['tx1_name']}"
  * Currently HOLDING lock on: {deadlock_info['tx1_holding']}
  * Currently WAITING for: {deadlock_info['tx1_waiting']}

- Transaction 2: "{deadlock_info['tx2_name']}"
  * Currently HOLDING lock on: {deadlock_info['tx2_holding']}
  * Currently WAITING for: {deadlock_info['tx2_waiting']}

Provide a structured analysis with EXACTLY these sections:

SITUATION:
[One sentence explaining what happened in simple terms]

ROOT CAUSE:
[Explain why this circular wait occurred]

VICTIM SELECTION:
[Which transaction to kill and why - consider that lower priority transactions should be terminated first]

RESOLUTION:
[Exact steps taken to resolve this deadlock]

PREVENTION:
[2-3 specific recommendations to prevent this in future]

Keep response clear, technical, and concise."""

    message = client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct",
        messages=[
            {
                "role": "system",
                "content": "You are a senior database administrator. Always respond in the exact structured format requested. Be precise and technical."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=600,
        temperature=0.3,
    )

    return message.choices[0].message.content


def get_prevention_tip(resource1: str, resource2: str) -> str:
    """
    Short prevention tip generate karo — DB mein save hogi
    """
    prompt = f"""In one sentence, how to prevent deadlock between {resource1} and {resource2} in a distributed database? Be specific and technical."""

    message = client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        temperature=0.2,
    )

    return message.choices[0].message.content


if __name__ == "__main__":
    test_deadlock = {
        "tx1_name": "Tx_Alpha",
        "tx1_holding": "Table_Orders",
        "tx1_waiting": "Table_Users",
        "tx2_name": "Tx_Beta",
        "tx2_holding": "Table_Users",
        "tx2_waiting": "Table_Orders"
    }

    print("🤖 LLM Analysis:")
    print("=" * 50)
    result = explain_deadlock(test_deadlock)
    print(result)
    print("\n" + "=" * 50)
    print("💡 Prevention Tip:")
    tip = get_prevention_tip("Table_Orders", "Table_Users")
    print(tip)